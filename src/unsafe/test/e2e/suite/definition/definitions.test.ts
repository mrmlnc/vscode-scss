import { getDocUri, showFile, position, sleep, sameLineLocation } from '../util';
import { testDefinition } from './helper';

describe('SCSS Definition Test', () => {
	const docUri = getDocUri('definition/main.scss');
	const vueDocUri = getDocUri('definition/AppButton.vue');

	before(async () => {
		await showFile(docUri);
		await showFile(vueDocUri);
		await sleep(2000);
	});

	it('should find definition for variables', async () => {
		const expectedDocumentUri = getDocUri('_variables.scss');
		const expectedLocation = sameLineLocation(expectedDocumentUri, 1, 1, 10);

		await testDefinition(docUri, position(2, 13), expectedLocation);
	});

	it('should find definition for functions', async () => {
		const expectedDocumentUri = getDocUri('_functions.scss');
		const expectedLocation = sameLineLocation(expectedDocumentUri, 1, 1, 9);

		await testDefinition(docUri, position(2, 24), expectedLocation);
	});

	it('should find definition for mixins', async () => {
		const expectedDocumentUri = getDocUri('_mixins.scss');
		const expectedLocation = sameLineLocation(expectedDocumentUri, 1, 1, 6);

		await testDefinition(docUri, position(4, 12), expectedLocation);
	});

	it('should find definition for variables on vue file', async () => {
		const expectedDocumentUri = getDocUri('_variables.scss');
		const expectedLocation = sameLineLocation(expectedDocumentUri, 1, 1, 10);

		await testDefinition(vueDocUri, position(13, 13), expectedLocation);
	});

	it('should find definition for functions on vue file', async () => {
		const expectedDocumentUri = getDocUri('_functions.scss');
		const expectedLocation = sameLineLocation(expectedDocumentUri, 1, 1, 9);

		await testDefinition(vueDocUri, position(13, 24), expectedLocation);
	});

	it('should find definition for mixins on vue file', async () => {
		const expectedDocumentUri = getDocUri('_mixins.scss');
		const expectedLocation = sameLineLocation(expectedDocumentUri, 1, 1, 6);

		await testDefinition(vueDocUri, position(15, 12), expectedLocation);
	});
});
