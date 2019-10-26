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

  async transform({ asset, config }) {
    let code = await asset.getCode();

    if (config.preprocessors) {
      const preprocessed = await preprocess(
        code,
        config.preprocessors,
        config.compiler
      );
      code = preprocessed.toString();
    }

    const { js, css } = compile(code, config.compiler);

    // FIXME: source map should be set in different way ?
    if (false && options.sourceMaps) {
      asset.setMap(SourceMap.fromRawSourceMap(js.map));
    }

    return [
      {
        type: 'js',
        code: js.code
      },
      css && {
        type: 'css',
        code: css.code
      }
    ].filter(Boolean);
  }
});
