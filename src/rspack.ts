/**
 * This entry file is for rspack plugin.
 *
 * @module
 */

import unplugin from './core/index.js';

/**
 * rspack plugin
 *
 * @example
 * ```ts
 * // rspack.config.js
 * module.exports = {
 *  plugins: [require('@ryoppippi/unplugin-typia/rspack')()],
 * }
 * ```
 */
export default unplugin.rspack;
