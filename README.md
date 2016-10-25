# vscode-scss (WIP)

> SCSS intellisense for Variables and Mixins in all SCSS files.

> **Disclaimer**
>
> This is a preview release that may contain errors. This plugin works fine on my machine (SSD) with 1000+ Bootstrap files (SCSS, 3.3.7).
>
> Please read this README file.

## Install

Plugin installation is performed in several stages:

  * Press <kbd>F1</kbd> and select `Extensions: Install Extensions`.
  * Search and choose `vscode-scss`.

See the [extension installation guide](https://code.visualstudio.com/docs/editor/extension-gallery) for details.

## Usage

Just install the plugin and use it.

## Supported features

**Intellisense for Variables**

![SCSS Intellisense VS Code](https://cloud.githubusercontent.com/assets/7034281/19685974/c2c3aee4-9ac7-11e6-9dca-4590c8785b23.png)

**Hover for Variables**

![SCSS Intellisense VS Code](https://cloud.githubusercontent.com/assets/7034281/19685947/9d34f6b0-9ac7-11e6-8f91-ae9b4e775959.png)

**Intellisense for Mixins**

![SCSS Intellisense VS Code](https://cloud.githubusercontent.com/assets/7034281/19685869/3f234860-9ac7-11e6-8e27-c87015b5b5cb.png)

**Hover for Mixins**

![SCSS Intellisense VS Code](https://cloud.githubusercontent.com/assets/7034281/19685901/6bb002b0-9ac7-11e6-84a5-3659c72305b3.png)

**Signature Help**

![SCSS Intellisense VS Code](https://cloud.githubusercontent.com/assets/7034281/19685885/5608efb2-9ac7-11e6-9050-f0d4f91307ed.png)

## Supported settings

**scss.scannerDepth**

  * Type: `number`
  * Default: `30`

The maximum number of nested directories to scan.

**scss.scannerExclude**

  * Type: `string[]`
  * Default: `[".git", "**/node_modules", "**/bower_components"]`

List of Glob-patterns for directories that are excluded when scanning.

**scss.scanImportedFiles**

  * Type: `boolean`
  * Default: `true`

Allows scan imported files.

**scss.scanImportedFilesDepth**

  * Type: `number`
  * Default: `50`

The maximum number of imported files to scan. Prevent an infinite recursion and very deep `@import`.

**scss.showErrors**

  * Type: `boolean`
  * Default: `false`

Allows to display errors.

**scss.suggestVariables**

  * Type: `boolean`
  * Default: `true`

Allows prompt Variables.

**scss.suggestMixins**

  * Type: `boolean`
  * Default: `true`

Allows prompt Mixins.

**scss.suggestFunctions**

  * Type: `boolean`
  * Default: `true`

Allows prompt Functions.

## What's next?

See Issues with [`feature-request`](https://github.com/mrmlnc/vscode-scss/issues?q=is%3Aissue+is%3Aopen+label%3Afeature-request) and [`next-iteration`](https://github.com/mrmlnc/vscode-scss/issues?q=is%3Aissue+is%3Aopen+label%3Anext-iteration) labels.

## Questions

**I don't see suggestions in the SCSS files.**

You must perform several steps:

  * Set `scss.showErrors` option in settings of Editor.
  * Restart VS Code.
  * Try to reproduce your problem.
  * Open `Help -> Toggle Developer Tools` and copy errors.
  * Create Issue on GitHub.

## Changelog

See the [Releases section of our GitHub project](https://github.com/mrmlnc/vscode-scss/releases) for changelogs for each release version.

## License

This software is released under the terms of the MIT license.
