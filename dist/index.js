var $0lj1i$parcelplugin = require("@parcel/plugin");
var $0lj1i$parcelsourcemap = require("@parcel/source-map");
var $0lj1i$parcelutils = require("@parcel/utils");
var $0lj1i$sveltecompiler = require("svelte/compiler");
var $0lj1i$parceldiagnostic = require("@parcel/diagnostic");
var $0lj1i$sveltepreprocess = require("svelte-preprocess");

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
function $parcel$defineInteropFlag(a) {
  Object.defineProperty(a, '__esModule', {value: true, configurable: true});
}
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "default", () => $fe9c67c6604b403f$export$2e2bcd8739ae039);






var $fe9c67c6604b403f$export$2e2bcd8739ae039 = new $0lj1i$parcelplugin.Transformer({
    async loadConfig ({ config: config , options: options , logger: logger  }) {
        const svelteConfig = await config.getConfig([
            ".svelterc",
            ".svelterc.json",
            "svelte.config.js", 
        ]);
        if (!svelteConfig) return {
        };
        if (svelteConfig.filePath.endsWith(".js")) {
            // TODO: Is there a better way of handling this warning? Probably just
            // mention it in the documentation and silently invalidate.
            logger.warn({
                message: "WARNING: Using a JavaScript Svelte config file means losing out on caching features of Parcel. Use a .svelterc(.json) file whenever possible."
            });
            config.invalidateOnStartup();
        }
        return {
            ...svelteConfig.contents,
            compilerOptions: {
                css: false,
                ...svelteConfig.contents.compilerOptions,
                dev: options.mode !== "production"
            }
        };
    },
    async transform ({ asset: asset , config: { preprocess: preprocessConf , compilerOptions: compilerOptions  } , options: options , logger: logger ,  }) {
        let source = await asset.getCode();
        const filename = $0lj1i$parcelutils.relativeUrl(options.projectRoot, asset.filePath);
        // If the preprocessor config is never defined in the svelte config, attempt
        // to import `svelte-preprocess`. If that is importable, use that to
        // preprocess the file. Otherwise, do not run any preprocessors.
        if (preprocessConf === undefined) {
            logger.verbose({
                message: "No preprocess specified; using `svelte-preprocess`."
            });
            preprocessConf = ($parcel$interopDefault($0lj1i$sveltepreprocess))();
        }
        // Only preprocess if there is a config for it.
        if (preprocessConf) {
            logger.verbose({
                message: "Preprocessing svelte file."
            });
            const processed = await $fe9c67c6604b403f$var$catchDiag(async ()=>await $0lj1i$sveltecompiler.preprocess(source, preprocessConf, {
                    filename: filename
                })
            , source);
            source = processed.code;
        }
        logger.verbose({
            message: "Compiling svelte file."
        });
        const compiled = await $fe9c67c6604b403f$var$catchDiag(async ()=>await $0lj1i$sveltecompiler.compile(source, {
                ...compilerOptions,
                filename: filename
            })
        , source);
        // Create the new assets from the compilation result.
        const assets = [
            {
                type: "js",
                content: compiled.js.code,
                uniqueKey: `${asset.id}-js`,
                map: $fe9c67c6604b403f$var$extractSourceMaps(asset, compiled.js.map)
            }, 
        ];
        if (compiled.css && compiled.css.code) assets.push({
            type: "css",
            content: compiled.css.code,
            uniqueKey: `${asset.id}-css`,
            map: $fe9c67c6604b403f$var$extractSourceMaps(asset, compiled.css.map)
        });
        // Forward any warnings from the svelte compiler to the parcel diagnostics.
        if (compiled.warnings.length > 0) for (const warning of compiled.warnings)logger.warn($fe9c67c6604b403f$var$convertDiag(warning));
        return assets;
    }
});
function $fe9c67c6604b403f$var$extractSourceMaps(asset, sourceMap) {
    if (!sourceMap) return;
    sourceMap.sources = [
        asset.filePath
    ];
    const map = new ($parcel$interopDefault($0lj1i$parcelsourcemap))();
    map.addVLQMap(sourceMap);
    return map;
}
async function $fe9c67c6604b403f$var$catchDiag(fn, code) {
    try {
        return await fn();
    } catch (e) {
        throw new ($parcel$interopDefault($0lj1i$parceldiagnostic))({
            diagnostic: $fe9c67c6604b403f$var$convertDiag(e, code)
        });
    }
}
function $fe9c67c6604b403f$var$convertDiag(svelteDiag, code) {
    const codeFrame = {
        filePath: svelteDiag.filename,
        code: code,
        codeHighlights: [
            {
                start: svelteDiag.start,
                end: svelteDiag.end
            }, 
        ]
    };
    return {
        message: svelteDiag.message,
        codeFrames: [
            codeFrame
        ]
    };
}


//# sourceMappingURL=index.js.map
