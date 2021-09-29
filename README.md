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

## Configuration

You can change Svelte options though a `.svelterc`, `svelte.config.js` file or `svelte` field
in `package.json`.

For documentation on which options you can use look at the official
[svelte docs](https://github.com/sveltejs/svelte).

When using svelte without preprocessors, you can use `.svelterc` to configure.
This has caching benefits that are not possible with `svelte.config.js`;
however, it is not possible to configure preprocessors without using the
javascript config.

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
