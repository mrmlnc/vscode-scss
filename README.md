# vscode-scss

> SCSS IntelliSense (Variables, Mixins and Functions) for all files in the workspace.

> **Disclaimer**
>
> This is a preview release that may contain errors. This plugin works fine on my machine (SSD) with 1000+ Bootstrap files (SCSS, 3.3.7).
>
> Please read this README file.

## Donate

If you want to thank me, or promote your Issue.

[![Gratipay User](https://img.shields.io/gratipay/user/mrmlnc.svg?style=flat-square)](https://gratipay.com/~mrmlnc)

> Sorry, but I have work and support for plugins requires some time after work. I will be glad of your support.

## Install

Plugin installation is performed in several stages:

  * Press <kbd>F1</kbd> and select `Extensions: Install Extensions`.
  * Search and choose `vscode-scss`.

See the [extension installation guide](https://code.visualstudio.com/docs/editor/extension-gallery) for details.

## Usage

Just install the plugin and use it.

## Supported features

  * Code Completion Proposals (variables, mixins, functions) — [description](http://code.visualstudio.com/docs/extensions/language-support#_show-code-completion-proposals)
  * Hover (variables, mixins, functions) — [description](http://code.visualstudio.com/docs/extensions/language-support#_show-hovers)
  * Signature Help (mixins, functions) — [description](http://code.visualstudio.com/docs/extensions/language-support#_help-with-function-and-method-signatures)
  * Code navigation
    * Go to (variables, mixins, functions) — [description](http://code.visualstudio.com/docs/extensions/language-support#_show-definitions-of-a-symbol)
    * Show all All Symbol Definitions in Folder (variables, mixin, functions) — [description](http://code.visualstudio.com/docs/extensions/language-support#_show-all-all-symbol-definitions-in-folder)
  * Visual Studio reference comments: `// <reference path="./variable.scss" />`.
  * Import files by `@import "filepath";` from anywhere. Even outside of the open workspace.

## Supported settings

#### scss.scannerDepth

  * Type: `number`
  * Default: `30`

The maximum number of nested directories to scan.

#### scss.scannerExclude

  * Type: `string[]`
  * Default: `[".git", "**/node_modules", "**/bower_components"]`

List of Glob-patterns for directories that are excluded when scanning.

#### scss.scanImportedFiles

  * Type: `boolean`
  * Default: `true`

Allows scan imported files.

#### scss.scanImportedFilesDepth

  * Type: `number`
  * Default: `50`

The maximum number of imported files to scan. Prevent an infinite recursion and very deep `@import`.

#### scss.implicitlyLabel

  * Type: `string|null`
  * Default: `(implicitly)`

The text of a label that the file imported implicitly. If `null` then label not displayed.

#### scss.showErrors

  * Type: `boolean`
  * Default: `false`

Allows to display errors.

#### scss.suggestVariables

  * Type: `boolean`
  * Default: `true`

Allows prompt Variables.

#### scss.suggestMixins

  * Type: `boolean`
  * Default: `true`

Allows prompt Mixins.

#### scss.suggestFunctions

  * Type: `boolean`
  * Default: `true`

Allows prompt Functions.

#### scss.suggestFunctionsInStringContextAfterSymbols

  * Type: `boolean`
  * Default: ` (+-*%`

Allows prompt Functions in String context after specified symbols. For example, if you add the `/` symbol, then `background: url(images/he|)` will be suggest `hello()` function if it is defined.

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
