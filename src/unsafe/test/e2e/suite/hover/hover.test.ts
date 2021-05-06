import { getDocUri, showFile, position, sleep } from '../util';
import { testHover } from './helper';

describe('SCSS Hover Test', () => {
	const docUri = getDocUri('hover/main.scss');
	const vueDocUri = getDocUri('hover/AppButton.vue');

	before(async () => {
		await showFile(docUri);
		await showFile(vueDocUri);
		await sleep(2000);
	});

	it('shows hover for variables', async () => {
		await testHover(docUri, position(2, 13), {
			contents: ['```scss\n$variable: \'value\';\n@import "../_variables.scss" (implicitly)\n```']
		});
	});

	it('shows hover for functions', async () => {
		await testHover(docUri, position(2, 24), {
			contents: ['```scss\n@function function() {…}\n@import "../_functions.scss" (implicitly)\n```']
		});
	});

	it('shows hover for mixins', async () => {
		await testHover(docUri, position(4, 12), {
			contents: ['```scss\n@mixin mixin() {…}\n@import "../_mixins.scss" (implicitly)\n```']
		});
	});

	it('shows hover for variables on vue file', async () => {
		await testHover(vueDocUri, position(13, 13), {
			contents: ['```scss\n$variable: \'value\';\n@import "../_variables.scss" (implicitly)\n```']
		});
	});

	it('shows hover for functions on vue file', async () => {
		await testHover(vueDocUri, position(13, 24), {
			contents: ['```scss\n@function function() {…}\n@import "../_functions.scss" (implicitly)\n```']
		});
	});

	it('shows hover for mixins on vue file', async () => {
		await testHover(vueDocUri, position(15, 12), {
			contents: ['```scss\n@mixin mixin() {…}\n@import "../_mixins.scss" (implicitly)\n```']
		});
	});
});
