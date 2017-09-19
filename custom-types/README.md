rminster 2/13/2017

Ideally this directory would work as a typeRoot in tsconfig.json, but
due to https://github.com/TypeStrong/ts-node/issues/216 this does not work on
Windows.  Also, vscode has trouble navigating to typedef files in custom
typeRoot directories.

As a workaround, npm install (actually postinstall) copies all directories from
custom-types/@types into node_modules/@types.

nightmare is based on npm's @types/nightmare, but customized to include
better typing.
