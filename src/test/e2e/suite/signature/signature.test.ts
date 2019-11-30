import { getDocUri, showFile, position, sleep } from '../util';
import { testSignature } from './helper';

describe('SCSS Signature Help Test', () => {
	const docUri = getDocUri('signature/main.scss');

	before(async () => {
		await showFile(docUri);
		await sleep(2000);
	});

	describe('Mixin', () => {
		it('should suggest all parameters of mixin', async () => {
			await testSignature(docUri, position(2, 19), {
				activeParameter: 0,
				activeSignature: 0,
				signatures: [
					{
						label: 'square ($size: null, $radius: 0)',
						parameters: [{ label: '$size' }, { label: '$radius' }]
					}
				]
			});
		});

		it('should suggest the second parameter of mixin', async () => {
			await testSignature(docUri, position(3, 21), {
				activeParameter: 1,
				activeSignature: 0,
				signatures: [
					{
						label: 'square ($size: null, $radius: 0)',
						parameters: [{ label: '$size' }, { label: '$radius' }]
					}
				]
			});
		});
	});

	describe('Function', () => {
		it('should suggest all parameters of function', async () => {
			await testSignature(docUri, position(5, 16), {
				activeParameter: 0,
				activeSignature: 0,
				signatures: [
					{
						label: 'pow ($base: null, $exponent: null)',
						parameters: [{ label: '$base' }, { label: '$exponent' }]
					}
				]
			});
		});

		it('should suggest the second parameter of function', async () => {
			await testSignature(docUri, position(5, 26), {
				activeParameter: 1,
				activeSignature: 0,
				signatures: [
					{
						label: 'pow ($base: null, $exponent: null)',
						parameters: [{ label: '$base' }, { label: '$exponent' }]
					}
				]
			});
		});
	});
});
