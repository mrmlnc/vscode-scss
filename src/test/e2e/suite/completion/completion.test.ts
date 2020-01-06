import { getDocUri, showFile, position, sleep } from '../util';
import { testCompletion } from './helper';

describe('SCSS Completion Test', () => {
	const docUri = getDocUri('completion/main.scss');
	const vueDocUri = getDocUri('completion/AppButton.vue');

	before(async () => {
		await showFile(docUri);
		await showFile(vueDocUri);
		await sleep(2000);
	});

	it('Offers variable completions', async () => {
		await testCompletion(docUri, position(5, 11), ['$color', '$fonts']);
	});

	it('Offers completions from tilde imports', async () => {
		await testCompletion(docUri, position(11, 11), [{ label: '$tilde', detail: 'node_modules/foo/bar.scss' }]);
	});

	it('Offers completions from partial file', async () => {
		await testCompletion(docUri, position(17, 11), [{ label: '$partial', detail: '_partial.scss' }]);
	});

	it('no completions on vue file outside scss regions', async () => {
		await testCompletion(vueDocUri, position(2, 9), []);
		await testCompletion(vueDocUri, position(6, 8), []);
	});

	it('Offers variable completions on vue file', async () => {
		await testCompletion(vueDocUri, position(16, 11), ['$color', '$fonts']);
	});

	it('Offers completions from tilde imports on vue file', async () => {
		await testCompletion(vueDocUri, position(22, 11), [{ label: '$tilde', detail: 'node_modules/foo/bar.scss' }]);
	});

	it('Offers completions from partial file on vue file', async () => {
		await testCompletion(vueDocUri, position(28, 11), [{ label: '$partial', detail: '_partial.scss' }]);
	});
});
