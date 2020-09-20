const path = require("path");
const { Transformer } = require("@parcel/plugin");
const { default: SourceMap } = require("@parcel/source-map");
const { relativeUrl } = require("@parcel/utils");
const { compile, preprocess } = require("svelte/compiler.js");
const { exit } = require("process");

Object.defineProperty(exports, "__esModule", { value: true });

function generateName(input) {
  let name = path
    .basename(input)
    .replace(path.extname(input), "")
    .replace(/[^a-zA-Z_$0-9]+/g, "_")
    .replace(/^_/, "")
    .replace(/_$/, "")
    .replace(/^(\d)/, "_$1");

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
    let customOptions =
      (await config.getConfig([".svelterc", "svelte.config.js"], {
        packageKey: "svelte",
      })) || {};

    const parcelCompilerOptions = {
      dev: options.mode !== "production",
    };

    const compiler = { ...customOptions.compiler, ...parcelCompilerOptions };
    const preprocess = customOptions.preprocess;

    config.setResult({
      compiler,
      preprocess,
    });
  },

  async transform({ asset, config, options }) {
    const filename = relativeUrl(options.projectRoot, asset.filePath);
    const name = generateName(filename);

    let code = await asset.getCode();

    if (config.preprocess) {
      const preprocessed = await preprocess(code, config.preprocess, {
        filename,
      });
      // TODO: add dependencies? see https://github.com/DeMoorJasper/parcel-plugin-svelte/blob/master/packages/parcel-plugin-svelte/lib/svelte-asset.js#L35
      code = preprocessed.toString();
    }

    const compilerOptions = { ...config.compiler, css: false, filename, name };
    const { js, css } = compile(code, compilerOptions);

    return [
      {
        type: "js",
        content: js.code,
        uniqueKey: asset.id + "-js",
        map: extractSourceMaps(asset, js.map),
      },
      css &&
        css.code && {
          type: "css",
          content: css.code,
          uniqueKey: asset.id + "-css",
          map: extractSourceMaps(asset, css.map),
        },
    ].filter(Boolean);
  },
});
