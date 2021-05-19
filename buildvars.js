import packageConfig from './package.json';

// A list of variables to be replaced with actual values at build time, throughout all files in the code base.
export const BUILD_VARS = {
  "BUILD_DATE": new Date(),
  "BUILD_VERSION": packageConfig.version,
  "APP_NAME": packageConfig.name,
  "APP_TITLE": packageConfig.title
};