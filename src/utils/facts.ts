'use strict';

export const colorProposals = [
	'red',
	'green',
	'blue',
	'mix',
	'hue',
	'saturation',
	'lightness',
	'adjust-hue',
	'lighten',
	'darken',
	'saturate',
	'desaturate',
	'grayscale',
	'complement',
	'invert',
	'alpha',
	'opacity',
	'rgba',
	'opacify',
	'fade-in',
	'transparentize',
	'adjust-color',
	'scale-color',
	'change-color',
	'ie-hex-str'
];

export const selectorFunctions = [
	'selector-nest',
	'selector-append',
	'selector-extend',
	'selector-replace',
	'selector-unify',
	'is-superselector',
	'simple-selectors',
	'selector-parse'
];

export const builtInFunctions = [
	'unquote',
	'quote',
	'str-length',
	'str-insert',
	'str-index',
	'str-slice',
	'to-upper-case',
	'to-lower-case',
	'percentage',
	'round',
	'ceil',
	'floor',
	'abs',
	'min',
	'max',
	'random',
	'length',
	'nth',
	'set-nth',
	'join',
	'append',
	'zip',
	'index',
	'list-separator',
	'map-get',
	'map-merge',
	'map-remove',
	'map-keys',
	'map-values',
	'map-has-key',
	'keywords',
	'feature-exists',
	'variable-exists',
	'global-variable-exists',
	'function-exists',
	'mixin-exists',
	'inspect',
	'type-of',
	'unit',
	'unitless',
	'comparable',
	'call'
];

export function hasInFacts(word: string): boolean {
	return (
		colorProposals.indexOf(word) !== -1 ||
		selectorFunctions.indexOf(word) !== -1 ||
		builtInFunctions.indexOf(word) !== -1
	);
}
