import path from 'path';
import { Transformer } from '@parcel/plugin';
import SourceMap from '@parcel/source-map';
import { relativeUrl } from '@parcel/utils';
import { compile, preprocess } from 'svelte/compiler.js';
import { load, preSerialize, postDeserialize } from './loadConfig';

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

function extractSourceMaps(projectRoot, asset, originalSourceMap, sourceMap) {
  if (!sourceMap) return originalSourceMap;

  sourceMap.sources = [asset.filePath];

  const map = new SourceMap(projectRoot);
  map.addVLQMap(sourceMap);

  if (originalSourceMap) {
    map.extends(originalSourceMap.toBuffer());
  }

  return map;
}

async function handleError(sourceFileName, func) {
  try {
    return await func();
  } catch (error) {
    throw new Error(`Error in file ${sourceFileName}: ${error}`);
  }
}

export default new Transformer({
  loadConfig({ config, options, logger }) {
    return load({ config, options, logger });
  },

  preSerializeConfig({ config }) {
    return preSerialize(config);
  },

  postDeserializeConfig({ config, options }) {
    return postDeserialize(config, options);
  },

  async transform({ asset, config, options }) {
    let code = await asset.getCode();
    const sourceFileName = relativeUrl(options.projectRoot, asset.filePath);
    const compilerOptions = {
      ...(config ? config.raw.compilerOptions : null),
      filename: sourceFileName,
      name: generateName(sourceFileName),
    };

    if (config && config.hydrated.preprocess) {
      const preprocessed = await handleError(sourceFileName, () =>
        preprocess(code, config.hydrated.preprocess, compilerOptions),
      );
      code = preprocessed.toString();
    }

    const { js, css } = await handleError(sourceFileName, () =>
      compile(code, compilerOptions),
    );

    return [
      {
        type: 'js',
        content: js.code,
        uniqueKey: `${asset.id}-js`,
        map: extractSourceMaps(
          options.projectRoot,
          asset,
          originalSourceMap,
          js.map,
        ),
      },
      Boolean(css && css.code) && {
        type: 'css',
        content: css.code,
        uniqueKey: `${asset.id}-css`,
        map: extractSourceMaps(
          options.projectRoot,
          asset,
          originalSourceMap,
          css.map,
        ),
      },
    ].filter(Boolean);
  },
});
