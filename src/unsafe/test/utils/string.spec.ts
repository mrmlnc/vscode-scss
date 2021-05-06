'use strict';

import * as assert from 'assert';

import {
	getCurrentWord,
	getTextBeforePosition,
	getTextAfterPosition,
	getLimitedString
} from '../../utils/string';

describe('Utils/String', () => {
	it('getCurrentWord', () => {
		const text = `.text($a) {}`;

		assert.strictEqual(getCurrentWord(text, 5), '.text');
		assert.strictEqual(getCurrentWord(text, 8), '$a');
	});

	it('getTextBeforePosition', () => {
		const text = `\n.text($a) {}`;

		assert.strictEqual(getTextBeforePosition(text, 6), '.text');
		assert.strictEqual(getTextBeforePosition(text, 9), '.text($a');
	});

	it('getTextAfterPosition', () => {
		const text = `.text($a) {}`;

		assert.strictEqual(getTextAfterPosition(text, 5), '($a) {}');
		assert.strictEqual(getTextAfterPosition(text, 8), ') {}');
	});

	it('getLimitedString', () => {
		const text = `vscode`.repeat(24);

		assert.strictEqual(getLimitedString(text).length, 141);
		assert.strictEqual(getLimitedString(text, false).length, 140);
	});
});
