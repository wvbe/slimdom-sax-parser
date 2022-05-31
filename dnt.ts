/**
 * Running this script rebuilds it as a NodeJS compatible npm package.
 */

import { build, BuildOptions, emptyDir } from 'https://deno.land/x/dnt/mod.ts';

const VERSION = Deno.args[0];
if (!VERSION) {
	throw new Error('Please specify a version, eg. "deno run dnt.ts 1.0.0');
}
console.log(`Creating npm package for version ${VERSION}`);

const dependencyMapping: BuildOptions['mappings'] = {
	// 'https://esm.sh/comment-parser@1.3.0': {
	// 	name: 'comment-parser',
	// 	version: '1.3.0'
	// },
	// 'https://esm.sh/prettier@2.5.0': {
	// 	name: 'prettier',
	// 	version: '2.5.0'
	// },
	// 'https://esm.sh/prettier@2.5.0/parser-markdown': {
	// 	name: 'prettier',
	// 	version: '2.5.0',
	// 	subPath: 'parser-markdown.js'
	// }
};

const packageJson: BuildOptions['package'] = {
	// package.json properties
	name: 'slimdom-sax-parser',
	version: VERSION,
	description:
		'Parse an XML string to a light-weight spec-compliant document object model, for browser and Node',
	author: {
		name: 'Wybe Minnebo',
		email: 'wybe@x-54.com',
		url: 'https://github.com/wvbe',
	},
	contributors: [
		{
			name: 'tnarik',
			email: 'tnarik@lecafeautomatique.co.uk',
			url: 'https://github.com/tnarik',
		},
	],
	homepage: 'https://github.com/wvbe/slimdom-sax-parser',
	repository: {
		type: 'git',
		url: 'git+https://github.com/wvbe/slimdom-sax-parser.git',
	},
	bugs: {
		url: 'https://github.com/wvbe/slimdom-sax-parser/issues',
	},
	license: 'MIT',
	keywords: ['xml', 'parse', 'sax', 'slimdom', 'jsdom', 'dom'],
	type: 'module',
	main: 'script/index.js',
	module: 'esm/index.js',
	typings: 'esm/index.d.ts',
};

await emptyDir('./npm');

await build({
	entryPoints: ['./src/index.ts'],
	outDir: './npm',
	typeCheck: false,
	test: false,
	skipSourceOutput: true,
	shims: {
		deno: true,
	},
	mappings: dependencyMapping,
	package: packageJson,
});

// Use the npm-friendly README.md
await Deno.copyFile('README.md', 'npm/README.md');
