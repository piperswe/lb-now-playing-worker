import { IKVNamespace } from '../interfaces';

export interface MockKVEntry {
	key: string;
	value: string;
	expirationTtl?: number;
}

export class MockKVNamespace implements IKVNamespace {
	entries: Map<string, MockKVEntry> = new Map();
	async get(key: string, options?: { cacheTtl?: number }): Promise<string | undefined> {
		return this.entries.get(key)?.value;
	}
	async put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void> {
		this.entries.set(key, {
			key,
			value,
			expirationTtl: options?.expirationTtl,
		});
	}
}
