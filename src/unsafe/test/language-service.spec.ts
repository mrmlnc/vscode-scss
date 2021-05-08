import * as assert from 'assert';

import * as sinon from 'sinon';
import { Position } from 'vscode-languageserver';

import * as ls from '../language-service';
import { makeDocument } from './helpers';

describe('LanguageService', () => {
	describe('.getLanguageService', () => {
		it('should return language service', () => {
			const actual = ls.getLanguageService();

			assert.notStrictEqual(actual.configure, undefined);
		});

		it('should return language service with completion participans', () => {
			const onCssPropertyValue = sinon.stub();
			const document = makeDocument('.test { content: ');

			const languageService = ls.getLanguageService([{ onCssPropertyValue }]);

			languageService.doComplete(document, Position.create(1, 17), languageService.parseStylesheet(document));

			assert.ok(onCssPropertyValue.calledOnce);
		});
	});
});
