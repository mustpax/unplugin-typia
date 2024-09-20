/**
 * This entry file is for Next.js plugin.
 *
 * @module
 */

import webpack from './webpack.js';
import type { Options } from './core/options.js';

/**
 * Next.js plugin
 *
 * @example
 * ```js
 * // next.config.mjs
 * import unTypiaNext from "@ryoppippi/unplugin-typia/next";
 *
 * /** @type {import("next").NextConfig} *\/
 * const nextConfig = { /* your next.js config *\/ };
 *
 * /** @type {import("unplugin-typia").Options} *\/
 * const unpluginTypiaOptions = { /* your unplugin-typia options *\/ };
 *
 * // Export the next.js config
 * export default unTypiaNext(
 *	 nextConfig,
 *   unpluginTypiaOptions // you can omit this when you don't need to customize it
 * );
 * ```
 */
function next(nextConfig: Record<string, unknown> = {}, options: Options): Record<string, unknown> {
	return {
		...nextConfig,
		webpack(config: Record<string, unknown>, webpackOptions: Record<string, unknown>) {
			if (Array.isArray(config?.plugins)) {
				config.plugins.unshift(webpack(options));
			}

			if (typeof nextConfig?.webpack === 'function') {
				return nextConfig.webpack(config, webpackOptions) as Record<string, unknown>;
			}

			return config;
		},
	};
}

export default next;
