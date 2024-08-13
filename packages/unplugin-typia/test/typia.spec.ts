import fs from 'node:fs/promises';
import { expect, it } from 'vitest';

import type { UnpluginBuildContext, UnpluginContext } from 'unplugin';
import { join } from 'pathe';
import { transformTypia } from '../src/core/typia.js';
import { resolveOptions } from '../src/api.js';
import type { Data, ID, Source } from '../src/core/types.js';

class DummyContext {
	warn(args: unknown) {
		console.warn(args);
	}
};

const ctx = new DummyContext() as UnpluginContext & UnpluginBuildContext;

async function test(_id: string): Promise<Data> {
	const id = join(import.meta.dirname, './fixtures/', _id) as ID;
	const code = await fs.readFile(id, 'utf-8') as Source;
	const transformed = await transformTypia(id, code, ctx, resolveOptions({ cache: false }));
	return transformed;
}

it('transform is', async () => {
	const transformed = await test('is.ts');
	await expect(transformed).toMatchFileSnapshot('./snapshot/is.ts');
});

it('transform validate', async () => {
	const transformed = await test('validate.ts');
	await expect(transformed).toMatchFileSnapshot('./snapshot/validate.ts');
});

it('transform random', async () => {
	const transformed = await test('random.ts');
	await expect(transformed).toMatchFileSnapshot('./snapshot/random.ts');
});
