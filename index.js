const path = require('path');
const { Transformer } = require('@parcel/plugin');
const { default: SourceMap } = require('@parcel/source-map');
const { relativeUrl } = require('@parcel/utils');
const { compile, preprocess } = require('svelte/compiler.js');

Object.defineProperty(exports, '__esModule', { value: true });

function generateName(input) {
  let name = path
    .basename(input)
    .replace(path.extname(input), '')
    .replace(/[^a-zA-Z_$0-9]+/g, '_')
    .replace(/^_/, '')
    .replace(/_$/, '')
    .replace(/^(\d)/, '_$1');

  return name[0].toUpperCase() + name.slice(1);
}

function extractSourceMaps(asset, sourceMap) {
  if (!sourceMap) return;

  sourceMap.sources = [asset.filePath];

  const map = new SourceMap();
  map.addRawMappings(sourceMap);

  return map;
}

exports.default = new Transformer({
  async loadConfig({ config, options }) {
    const customOptions =
      (await config.getConfig(['.svelterc', 'svelte.config.js'], {
        packageKey: 'svelte',
      })) || {};

    if (customOptions.compiler) {
      console.error(
        'The "compiler" option in .svelterc is deprecated, use "compilerOptions" instead',
      );
      customOptions.compilerOptions =
        customOptions.compilerOptions || customOptions.compiler;
    }

    const compilerOptions = {
      css: false,
      ...customOptions.compilerOptions,

      dev: options.mode !== 'production',
    };
    const preprocess = customOptions.preprocess;

    config.setResult({
      compilerOptions,
      preprocess,
    });
  },

  async transform({ asset, config, options }) {
    const sourceFileName = relativeUrl(options.projectRoot, asset.filePath);
    try {
      let code = await asset.getCode();
      const compilerOptions = {
        ...config.compilerOptions,
        filename: sourceFileName,
        name: generateName(sourceFileName),
      };

      if (config.preprocess) {
        const preprocessed = await preprocess(
          code,
          config.preprocess,
          compilerOptions,
        );
        code = preprocessed.toString();
      }

      const { js, css } = compile(code, compilerOptions);

      return [
        {
          type: 'js',
          content: js.code,
          uniqueKey: `${asset.id}-js`,
          map: extractSourceMaps(asset, js.map),
        },
        Boolean(css && css.code) && {
          type: 'css',
          content: css.code,
          uniqueKey: `${asset.id}-css`,
          map: extractSourceMaps(asset, css.map),
        },
      ].filter(Boolean);
    } catch (error) {
      throw new Error(`Error in file ${sourceFileName}: ${error}`);
    }
  },
});
