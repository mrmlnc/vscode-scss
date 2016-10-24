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

![Less Intellisense VS Code](https://cloud.githubusercontent.com/assets/7034281/19413624/2d794d5a-933b-11e6-837d-66b86e873004.png)

**Hover for Variables**

![Less Intellisense VS Code](https://cloud.githubusercontent.com/assets/7034281/19413666/40bc63c4-933c-11e6-92c7-3f5ed0cf0d3d.png)

**Intellisense for Mixins**

![Less Intellisense VS Code](https://cloud.githubusercontent.com/assets/7034281/19413672/795d40fe-933c-11e6-919d-de14532ee49a.png)

**Hover for Mixins**

![Less Intellisense VS Code](https://cloud.githubusercontent.com/assets/7034281/19413681/a3789ed8-933c-11e6-81ea-0fd853bb5a00.png)

**Signature Help**

![Less Intellisense VS Code](https://cloud.githubusercontent.com/assets/7034281/19627576/753228e8-9952-11e6-9d10-6089b878a118.png)

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
