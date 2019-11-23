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

		assert.equal(getCurrentWord(text, 5), '.text');
		assert.equal(getCurrentWord(text, 8), '$a');
	});

	it('getTextBeforePosition', () => {
		const text = `\n.text($a) {}`;

		assert.equal(getTextBeforePosition(text, 6), '.text');
		assert.equal(getTextBeforePosition(text, 9), '.text($a');
	});

	it('getTextAfterPosition', () => {
		const text = `.text($a) {}`;

		assert.equal(getTextAfterPosition(text, 5), '($a) {}');
		assert.equal(getTextAfterPosition(text, 8), ') {}');
	});

	it('getLimitedString', () => {
		const text = `vscode`.repeat(24);

		assert.equal(getLimitedString(text).length, 141);
		assert.equal(getLimitedString(text, false).length, 140);
	});
});
