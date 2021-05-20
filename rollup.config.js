import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import nodeResolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import { BUILD_VARS } from './buildvars.js';

// =================================================================================================
// INITIALIZATION
// =================================================================================================

// Determine whether this is a production or dev build.
// If Rollup was executed in watch mode (i.e., with the -w flag), then assume this is a dev build.
// Otherwise, Rollup was executed once, with not file watches, so assume this is a production build.
const production = !process.env.ROLLUP_WATCH;

// The "start" and "end" delimiters for strings to be replaced in the code base.
// For example, in <@BUILD_VERSION@>, the start delimiter is <@ and the end delimiter is @>.
const replacementTokenDelimiters = ['<@', '@>'];

// =================================================================================================
// MAIN ROLLUP BUILD SEQUENCE
// =================================================================================================
export default {
  // Specify entry point to application ("input"), and file to output.
  input: 'js_src/theme/index.js',
  output: {
    file: `src/assets/rocket-js-compiledtheme.js`,
    format: 'es',
    sourcemap: false
  },

  // Rollup bundles JavaScript directly, but relies on plugins to perform other build tasks. Run
  // those plugins now.
  plugins: [
    // The nodeResolve() plugin locates external node modules (such as mputils) in this project,
    // allowing Rollup to include them in the distribution. Without nodeResolve(), node modules
    // would not be copied into the dist. The "browser: true" setting is required for modules that
    // have native browser dependencies, as, for example, the uuid package does (it relies on crypto).
    nodeResolve({ browser: true }),

    // The replace() plugin finds and replaces strings in files processed by Rollup. For a list of
    // strings replaced during the build process in this project, see buildvars.js.
    replace({
      exclude: 'node_modules/**',
      delimiters: replacementTokenDelimiters,
      values: BUILD_VARS
    }),

    // The terser() plugin minifies JavaScript code, but only in production builds.
    production && terser(),

    // The copy() plugin copies non-JavaScript files to the distribution folder, and finds/replaces
    // placeholder tokens in those files. Unfortunately, replace() cannot perform find/replace
    // in non-JavaScript files, so copy()'s transform function is required for HTML and CSS.
    // Both replace() and copy() use the single replacement map, BUILD_VARS.
    copy({
      targets: [{
        src: 'src/index.html',
        dest: 'dist/',
        transform: contents => {
          return replaceAll(contents, BUILD_VARS, replacementTokenDelimiters);
        }
      },
      {
        src: 'src/styles/*.css',
        dest: 'dist/styles/',
        transform: contents => {
          return replaceAll(contents, BUILD_VARS, replacementTokenDelimiters);
        }
      },
      {
        src: 'src/lib/*',
        dest: 'dist/lib/'
      }]
    })
  ]
};


// =================================================================================================
// HELPER FUNCTIONS
// =================================================================================================

/**
 * Replaces keys with values in the specified 'contents' string. Used in copy() plugin's transform
 * function for finding/replacing strings in non-JavaScript files.
 *
 * @param contents The string in which to perform token replacment.
 * @param replacementMap An object of key/value pairs to find/replace.
 * @param delimiters Optional delimiters around each token (key).
 *
 * @returns {string} The transformed string, with all keys replaced with values.
 */
function replaceAll (contents, replacementMap, delimiters) {
  contents = contents.toString();
  let startDelimiter = '';
  let endDelimiter = '';

  if (delimiters) {
    if (delimiters.length > 0) {
      startDelimiter = delimiters[0];
    }
    if (delimiters.length > 1) {
      endDelimiter = delimiters[1];
    }
  }

  for (const [key, value] of Object.entries(replacementMap)) {
    contents = contents.replace(new RegExp(`${startDelimiter}${key}${endDelimiter}`, 'gi'), value);
  }
  return contents;
}
