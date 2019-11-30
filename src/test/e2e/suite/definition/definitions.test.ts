import { getDocUri, showFile, position, sleep, sameLineLocation } from '../util';
import { testDefinition } from './helper';

describe('SCSS Definition Test', () => {
	const docUri = getDocUri('definition/main.scss');

	before(async () => {
		showFile(docUri);
		await sleep(2000);
	});

	it('should find definition for variables', async () => {
		const expectedDocumentUri = getDocUri('definition/_variables.scss');
		const expectedLocation = sameLineLocation(expectedDocumentUri, 1, 1, 10);

		await testDefinition(docUri, position(2, 13), expectedLocation);
	});

	it('should find definition for functions', async () => {
		const expectedDocumentUri = getDocUri('definition/_functions.scss');
		const expectedLocation = sameLineLocation(expectedDocumentUri, 1, 1, 9);

		await testDefinition(docUri, position(2, 24), expectedLocation);
	});

	it('should find definition for mixins', async () => {
		const expectedDocumentUri = getDocUri('definition/_mixins.scss');
		const expectedLocation = sameLineLocation(expectedDocumentUri, 1, 1, 6);

		await testDefinition(docUri, position(4, 12), expectedLocation);
	});
});
