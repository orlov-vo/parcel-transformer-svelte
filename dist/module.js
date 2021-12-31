import {Transformer as $h3sTQ$Transformer} from "@parcel/plugin";
import $h3sTQ$parcelsourcemap from "@parcel/source-map";
import {relativeUrl as $h3sTQ$relativeUrl} from "@parcel/utils";
import {preprocess as $h3sTQ$preprocess, compile as $h3sTQ$compile} from "svelte/compiler";
import $h3sTQ$parceldiagnostic from "@parcel/diagnostic";
import $h3sTQ$sveltepreprocess from "svelte-preprocess";







var $865fd9cd10eb2e95$export$2e2bcd8739ae039 = new $h3sTQ$Transformer({
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
        const filename = $h3sTQ$relativeUrl(options.projectRoot, asset.filePath);
        // If the preprocessor config is never defined in the svelte config, attempt
        // to import `svelte-preprocess`. If that is importable, use that to
        // preprocess the file. Otherwise, do not run any preprocessors.
        if (preprocessConf === undefined) {
            logger.verbose({
                message: "No preprocess specified; using `svelte-preprocess`."
            });
            preprocessConf = $h3sTQ$sveltepreprocess();
        }
        // Only preprocess if there is a config for it.
        if (preprocessConf) {
            logger.verbose({
                message: "Preprocessing svelte file."
            });
            const processed = await $865fd9cd10eb2e95$var$catchDiag(async ()=>await $h3sTQ$preprocess(source, preprocessConf, {
                    filename: filename
                })
            , source);
            source = processed.code;
        }
        logger.verbose({
            message: "Compiling svelte file."
        });
        const compiled = await $865fd9cd10eb2e95$var$catchDiag(async ()=>await $h3sTQ$compile(source, {
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
                map: $865fd9cd10eb2e95$var$extractSourceMaps(asset, compiled.js.map)
            }, 
        ];
        if (compiled.css && compiled.css.code) assets.push({
            type: "css",
            content: compiled.css.code,
            uniqueKey: `${asset.id}-css`,
            map: $865fd9cd10eb2e95$var$extractSourceMaps(asset, compiled.css.map)
        });
        // Forward any warnings from the svelte compiler to the parcel diagnostics.
        if (compiled.warnings.length > 0) for (const warning of compiled.warnings)logger.warn($865fd9cd10eb2e95$var$convertDiag(warning));
        return assets;
    }
});
function $865fd9cd10eb2e95$var$extractSourceMaps(asset, sourceMap) {
    if (!sourceMap) return;
    sourceMap.sources = [
        asset.filePath
    ];
    const map = new $h3sTQ$parcelsourcemap();
    map.addVLQMap(sourceMap);
    return map;
}
async function $865fd9cd10eb2e95$var$catchDiag(fn, code) {
    try {
        return await fn();
    } catch (e) {
        throw new $h3sTQ$parceldiagnostic({
            diagnostic: $865fd9cd10eb2e95$var$convertDiag(e, code)
        });
    }
}
function $865fd9cd10eb2e95$var$convertDiag(svelteDiag, code) {
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


export {$865fd9cd10eb2e95$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=module.js.map
