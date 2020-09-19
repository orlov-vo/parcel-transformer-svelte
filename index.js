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

  name = name[0].toUpperCase() + name.slice(1);
}

function extractSourceMaps(asset, sourceMap) {
  if (!sourceMap) return

  sourceMap.sources = [asset.filePath];

  const map = new SourceMap();
  map.addRawMappings(sourceMap);

  return map
}

exports.default = new Transformer({
  async getConfig({ asset, options }) {
    const sourceFileName = relativeUrl(options.projectRoot, asset.filePath);

    const customOptions =
      (await asset.getConfig(['.svelterc', 'svelte.config.js'], {
        packageKey: 'svelte'
      })) || {};

    const compiler = {
      css: false,
      ...customOptions.compiler,
      filename: sourceFileName,
      name: generateName(sourceFileName),
      dev: options.mode !== 'production'
    };
    const preprocessors = customOptions.preprocessors;

    return { compiler, preprocessors };
  },

  async transform({ asset, options }) {
    let code = await asset.getCode();

    if (options.preprocessors) {
      const preprocessed = await preprocess(
        code,
        options.preprocessors,
        options.compiler
      );
      code = preprocessed.toString();
    }

    // Avoid duplicate inline CSS from <style> tags
    const options = Object.assign({ css: false }, options.compiler);
    const { js, css } = compile(code, options);

    return [
      {
        type: 'js',
        content: js.code,
        map: extractSourceMaps(asset, js.map)
      },
      css && css.code && {
        type: 'css',
        content: css.code,
        map: extractSourceMaps(asset, css.map)
      }
    ].filter(Boolean);
  }
});
