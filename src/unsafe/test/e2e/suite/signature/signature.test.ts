import { getDocUri, showFile, position, sleep } from '../util';
import { testSignature } from './helper';

describe('SCSS Signature Help Test', () => {
	const docUri = getDocUri('signature/main.scss');
	const vueDocUri = getDocUri('signature/AppButton.vue');
	const svelteDocUri = getDocUri('signature/AppButton.svelte');

	before(async () => {
		await showFile(docUri);
		await showFile(vueDocUri);
		await showFile(svelteDocUri);
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

		it('should suggest all parameters of mixin on vue file', async () => {
			await testSignature(vueDocUri, position(13, 19), {
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

		it('should suggest the second parameter of mixin on vue file', async () => {
			await testSignature(vueDocUri, position(14, 21), {
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

		it('should suggest all parameters of mixin on svelte file', async () => {
			await testSignature(svelteDocUri, position(5, 19), {
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

		it('should suggest the second parameter of mixin on svelte file', async () => {
			await testSignature(svelteDocUri, position(6, 21), {
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

		it('should suggest all parameters of function on vue file', async () => {
			await testSignature(vueDocUri, position(16, 16), {
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

		it('should suggest the second parameter of function on vue file', async () => {
			await testSignature(vueDocUri, position(16, 26), {
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

		it('should suggest all parameters of function on svelte file', async () => {
			await testSignature(svelteDocUri, position(8, 16), {
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

		it('should suggest the second parameter of function on svelte file', async () => {
			await testSignature(svelteDocUri, position(8, 26), {
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
