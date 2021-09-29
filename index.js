const path = require("path");
const { Transformer } = require("@parcel/plugin");
const { default: SourceMap } = require("@parcel/source-map");
const { relativeUrl } = require("@parcel/utils");
const { compile, preprocess } = require("svelte/compiler.js");

Object.defineProperty(exports, "__esModule", { value: true });

exports.default = new Transformer({
  async loadConfig({ config, options, logger }) {
    const loaded = await config.getConfig([
      ".svelterc",
      "svelte.config.js",
      // Re-enable if/when `config.getConfig` supports loading mjs and cjs.
      // "svelte.config.mjs",
      // "svelte.config.cjs",
    ]);

    if (!loaded) return {};

    const { contents, filePath } = loaded;

    if (filePath.endsWith(".js")) {
      if (!contents.preprocess) {
        logger.warn({
          message:
            "WARNING: Using a JavaScript Svelte config file means losing " +
            "out on caching features of Parcel. Use a .svelterc(.json) " +
            "file whenever possible.",
        });
      }
      config.invalidateOnStartup();
    }

    if (contents.compiler) {
      logger.warn({
        message:
          'WARNING: The "compiler" option in .svelterc is deprecated, use ' +
          '"compilerOptions" instead.',
      });
      contents.compilerOptions = contents.compilerOptions || contents.compiler;
    }

    return {
      ...contents,
      compilerOptions: {
        css: false,
        ...contents.compilerOptions,
        dev: options.mode !== "production",
      },
    };
  },

  async transform({ asset, config, options }) {
    let source = await asset.getCode();
    const filename = relativeUrl(options.projectRoot, asset.filePath);

    if (config.preprocess) {
      const preprocessed = await handleError(filename, () =>
        preprocess(source, config.preprocess, { filename }),
      );
      source = preprocessed.toString();
    }

    const { js, css } = await handleError(filename, () =>
      compile(source, {
        ...config.compilerOptions,
        filename,
        name: generateName(filename),
      }),
    );

    return [
      {
        type: "js",
        content: js.code,
        uniqueKey: `${asset.id}-js`,
        map: extractSourceMaps(asset, js.map),
      },
      Boolean(css && css.code) && {
        type: "css",
        content: css.code,
        uniqueKey: `${asset.id}-css`,
        map: extractSourceMaps(asset, css.map),
      },
    ].filter(Boolean);
  },
});

async function handleError(sourceFileName, func) {
  try {
    return await func();
  } catch (error) {
    throw new Error(`Error in file ${sourceFileName}: ${error}`);
  }
}

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
  map.addVLQMap(sourceMap);
  return map;
}
