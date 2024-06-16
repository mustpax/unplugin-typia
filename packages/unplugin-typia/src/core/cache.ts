import { existsSync } from 'node:fs';
import { access, constants, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import process from 'node:process';
import { basename, dirname, join } from 'pathe';
import { readPackageJSON } from 'pkg-types';
import type { CacheKey, CachePath, Data, FilePath, ID, Source } from './types.js';
import { wrap } from './types.js';
import type { ResolvedOptions } from './options.js';
import { isBun } from './utils.js';

type ResolvedCacheOptions = ResolvedOptions['cache'];

let cacheDir: string | null = null;
let typiaVersion: string | undefined;

/**
 * Get cache
 * @param id
 * @param source
 * @param option
 */
export async function getCache(
	id: ID,
	source: Source,
	option: ResolvedCacheOptions,
): Promise<Data | null> {
	if (!option.enable) {
		return null;
	}
	await prepareCacheDir(option);

	const key = getKey(id, source);
	const path = getCachePath(key, option);

	let data: string | null = null;
	if (isBun()) {
		const file = Bun.file(path);
		if (!(await file.exists())) {
			return null;
		}
		data = await file.text();
	}
	else {
		if (!(existsSync(path))) {
			return null;
		}
		data = await readFile(path, { encoding: 'utf8' });
	}

	const hashComment = await getHashComment(key);

	if (data.endsWith(hashComment)) {
		return wrap<Data>(data);
	}

	return null;
}

/**
 * Set cache
 * @param id
 * @param source
 * @param data
 * @param option
 */
export async function setCache(
	id: ID,
	source: Source,
	data: Data,
	option: ResolvedCacheOptions,
): Promise<void> {
	if (!option.enable) {
		return;
	}
	await prepareCacheDir(option);

	const key = getKey(id, source);
	const path = getCachePath(key, option);
	const hashComment = await getHashComment(key);

	if (data == null) {
		await rm(path);
		return;
	}

	const cache = data + hashComment;
	if (isBun()) {
		await Bun.write(path, cache, { createPath: true });
	}
	else {
		await writeFile(path, cache, { encoding: 'utf8' });
	}
}

/**
 * Get cache key
 * @param id
 * @param source
 */
function getKey(id: ID, source: Source): CacheKey {
	const h = hash(source);
	const filebase = `${basename(dirname(id))}_${basename(id)}`;

	return wrap<CacheKey>(`${filebase}_${h}`);
}

/**
 * Get storage
 * @param key
 * @param option
 */
function getCachePath(
	key: CacheKey,
	option: ResolvedCacheOptions,
): CachePath {
	return wrap<CachePath>(join(option.base, key));
}

async function prepareCacheDir(option: ResolvedCacheOptions) {
	if (cacheDir != null) {
		return;
	}
	const _cacheDir = option.base;
	await mkdir(_cacheDir, { recursive: true });

	if (!await isWritable(_cacheDir)) {
		throw new Error('Cache directory is not writable.');
	}

	cacheDir = _cacheDir;
}

async function isWritable(filename: string): Promise<boolean> {
	try {
		await access(filename, constants.W_OK);
		return true;
	}
	catch {
		return false;
	}
}

/**
 * Create hash string
 * @param input
 * @returns The hash string.
 */
function hash(input: string): string {
	if (isBun()) {
		return Bun.hash(input).toString();
	}
	return createHash('md5').update(input).digest('hex');
}

async function getHashComment(cachePath: CacheKey) {
	typiaVersion = typiaVersion ?? await readPackageJSON('typia').then(pkg => pkg.version);
	return `/* unplugin-typia-${typiaVersion ?? ''}-${cachePath} */`;
}

/**
 * Get cache directory
 * copy from https://github.com/unjs/jiti/blob/690b727d7c0c0fa721b80f8085cafe640c6c2a40/src/cache.ts
 */
export function getCacheDir(): FilePath {
	let _tmpDir = tmpdir();

	// Workaround for pnpm setting an incorrect `TMPDIR`.
	// https://github.com/pnpm/pnpm/issues/6140
	// https://github.com/unjs/jiti/issues/120
	if (
		process.env.TMPDIR != null
		&& _tmpDir === process.cwd()
	) {
		const _env = process.env.TMPDIR;
		delete process.env.TMPDIR;
		_tmpDir = tmpdir();
		process.env.TMPDIR = _env;
	}

	const path = join(_tmpDir, 'unplugin_typia');
	return wrap<FilePath>(path);
}
