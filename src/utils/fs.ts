'use strict';

import * as fs from 'fs';

import * as fg from 'fast-glob';

export function findFiles(pattern: string, options: fg.Options): Promise<string[]> {
	return fg(pattern, {
		...options,
		absolute: true,
		dot: true,
		suppressErrors: true
	});
}

export function fileExists(filepath: string): Promise<boolean> {
	return new Promise(resolve => {
		fs.access(filepath, fs.constants.F_OK, error => {
			return resolve(error === null);
		});
	});
}

export function fileExistsSync(filepath: string): boolean {
	return fs.existsSync(filepath);
}

/**
 * Read file by specified filepath;
 */
export function readFile(filepath: string): Promise<string> {
	return new Promise((resolve, reject) => {
		fs.readFile(filepath, (err, data) => {
			if (err) {
				return reject(err);
			}

			resolve(data.toString());
		});
	});
}

/**
 * Read file by specified filepath;
 */
export function statFile(filepath: string): Promise<fs.Stats> {
	return new Promise((resolve, reject) => {
		fs.stat(filepath, (err, stat) => {
			if (err) {
				return reject(err);
			}

			resolve(stat);
		});
	});
}
