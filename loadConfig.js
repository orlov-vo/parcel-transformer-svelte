const path = require('path');

Object.defineProperty(exports, '__esModule', { value: true });

const CONFIG_FILES = ['.svelterc', 'svelte.config.js'];
const CONFIG_PACKAGE_KEY = 'svelte';

async function getConfigFile(config) {
  const packageKey = CONFIG_PACKAGE_KEY;
  const file = await config.getConfig(CONFIG_FILES, { packageKey });

  return file || null;
}

async function configHydrator(configFile, config, options) {
  config.setResult({
    raw: configFile,
    hydrated: {
      preprocess: configFile.preprocess,
    },
  });
}

exports.load = async function load({ config, options, logger }) {
  const configFile = await getConfigFile(config);
  if (!configFile) return;

  const { contents } = configFile;
  const isDynamic = path.extname(configFile.filePath) === '.js';

  if (typeof contents !== 'object' && typeof contents !== 'string') {
    throw new Error('Svelte config should be an object or a string.');
  }

  if (isDynamic) {
    if (!contents.preprocess) {
      logger.warn({
        message:
          'WARNING: Using a JavaScript Svelte config file means losing out on caching features of Parcel. Use a .svelterc(.json) file whenever possible.',
      });
    }

    config.shouldInvalidateOnStartup();

    if (contents.preprocess) {
      config.shouldReload();
    }
  }

  if (contents.compiler) {
    logger.warn({
      message:
        'WARNING: The "compiler" option in .svelterc is deprecated, use "compilerOptions" instead',
    });
    contents.compilerOptions = contents.compilerOptions || contents.compiler;
  }

  return configHydrator(
    {
      compilerOptions: {
        css: false,
        ...contents.compilerOptions,

        dev: options.mode !== 'production',
      },
      preprocess: contents.preprocess,
    },
    config,
    options,
  );
};

exports.preSerialize = function preSerialize(config) {
  if (!config.result) return;

  // Ensure we don't pass preprocess functions to the serializer
  if (config.result.raw.preprocess) {
    config.result.raw = {};
  }

  // This gets re-hydrated in Deserialize, so never store this
  config.result.hydrated = {};
};

exports.postDeserialize = function postDeserialize(config, options) {
  return configHydrator(config.result.raw, config, options);
};
