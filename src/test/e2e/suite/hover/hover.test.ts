import { getDocUri, showFile, position, sleep } from '../util';
import { testHover } from './helper';

describe('SCSS Hover Test', () => {
	const docUri = getDocUri('hover/main.scss');

	before(async () => {
		showFile(docUri);
		await sleep(2000);
	});

	it('shows hover for variables', async () => {
		await testHover(docUri, position(2, 13), {
			contents: ['\n```scss\n$variable: \'value\';\n@import "_variables.scss" (implicitly)\n```\n']
		});
	});

	it('shows hover for functions', async () => {
		await testHover(docUri, position(2, 24), {
			contents: ['\n```scss\n@function function() {…}\n@import "_functions.scss" (implicitly)\n```\n']
		});
	});

	it('shows hover for mixins', async () => {
		await testHover(docUri, position(4, 12), {
			contents: ['\n```scss\n@mixin mixin() {…}\n@import "_mixins.scss" (implicitly)\n```\n']
		});
	});
});
