import * as path from 'path';
import * as cp from 'child_process';

import { runTests, downloadAndUnzipVSCode, resolveCliPathFromVSCodeExecutablePath } from 'vscode-test';

async function main() {
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../../../');

		// The path to the extension test script
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './suite/index');

		const workspaceDir = path.resolve(__dirname, '../../../../fixtures/e2e');

		// Download VS Code, unzip it and run the integration test
		const vscodeExecutablePath = await downloadAndUnzipVSCode('insiders');

		const cliPath = resolveCliPathFromVSCodeExecutablePath(vscodeExecutablePath);

		cp.spawnSync(cliPath, ['--install-extension', 'octref.vetur'], {
			encoding: 'utf-8',
			stdio: 'inherit'
		});

		await runTests({
			vscodeExecutablePath,
			version: 'insiders',
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: [workspaceDir]
		});
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();
