'use strict';
// Copied/mutated from https://github.com/sergiirocks/vscode-ext-color-highlight/tree/master/src/strategies

import * as Color from 'color';
import * as webColors from 'color-name';

const colorHex = /.?(\#([a-f0-9]{6}([a-f0-9]{2})?|[a-f0-9]{3}([a-f0-9]{1})?))\b/gi;
const colorFunctions = /((rgb|hsl)a?\([\d]{1,3}%?,\s*[\d]{1,3}%?,\s*[\d]{1,3}%?(,\s*\d?\.?\d+)?\))/gi;

const preparedRePart = Object.keys(webColors)
	.map(color => `\\b${color}\\b`)
	.join('|');

const colorWeb = new RegExp('.?(' + preparedRePart + ')(?!-)', 'g');

export function getVariableColor(value: string): string[] | null {
	const hex = findHex(value);
	const fn = findFn(value);
	const words = findWords(value);

	if (hex.length) {
		return hex;
	}
	if (fn.length) {
		return fn;
	}
	if (words.length) {
		return words;
	}

	return null;
}

/*
 * Find color from hexcode
 */
export function findHex(text: string): string[] {
	let match = colorHex.exec(text);
	const result = [];

	while (match !== null) {
		const matchedColor = match[1];

		try {
			const color = Color(matchedColor).hex();

			result.push(color);
		} catch (e) {
			console.error(e);
		}

		match = colorHex.exec(text);
	}

	return result;
}

/**
 * Find color from rgb/hsl
 */
export function findFn(text: string): string[] {
	let match = colorFunctions.exec(text);
	const result: string[] = [];

	while (match !== null) {
		const color = match[0];

		if (color !== undefined) {
			result.push(color);
		}

		match = colorFunctions.exec(text);
	}

	return result;
}

/**
 * Find color from words
 */
export function findWords(text: string): string[] {
	let match = colorWeb.exec(text);
	const result = [];

	while (match !== null) {
		const firstChar = match[0]?.[0];
		const matchedColor = match[1];

		if (firstChar && firstChar.length && /[-\\$@#]/.test(firstChar)) {
			match = colorWeb.exec(text);
			continue;
		}

		try {
			const color = Color(matchedColor).rgb().string();

			result.push(color);
		} catch (e) {
			console.error(e);
		}

		match = colorWeb.exec(text);
	}

	return result;
}
