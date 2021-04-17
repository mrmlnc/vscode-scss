'use strict';

import * as assert from 'assert';

import { hasInFacts } from '../../utils/facts';

describe('Utils/Facts', () => {
	it('Contains', () => {
		assert.ok(hasInFacts('rgba'));
		assert.ok(hasInFacts('selector-nest'));
		assert.ok(hasInFacts('quote'));
	});

	it('Not contains', () => {
		assert.ok(!hasInFacts('hello'));
		assert.ok(!hasInFacts('from'));
		assert.ok(!hasInFacts('panda'));
	});
});
