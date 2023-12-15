# parcel-transformer-svelte

A Parcel 2 transformer for Svelte 3.

## Installation

```bash
npm install parcel-transformer-svelte -D
```

After this you should configure in `.parcelrc` the transformation for Svelte files:

```json
{
  "extends": ["@parcel/config-default"],
  "transformers": {
    "*.svelte": ["parcel-transformer-svelte"]
  }
}
```

> [!IMPORTANT]
> To enable Svelte 4 support, you must also enable the [Exports Map feature in Parcel 2.9+](https://parceljs.org/blog/v2-9-0/#new-resolver) by padding this to package.json

```json
	"@parcel/resolver-default": {
		"packageExports": true
	},
```

## Configuration

You can change Svelte options though a `.svelterc`, `svelte.config.js` file or `svelte` field
in `package.json`.

For documentation on which options you can use look at the official
[svelte docs](https://github.com/sveltejs/svelte).

```js
// Options used by svelte.compile
compilerOptions: {
  ...
},
// Preprocessors for svelte.preprocess
preprocessors: {
  ...
}
```

## License

MIT License
