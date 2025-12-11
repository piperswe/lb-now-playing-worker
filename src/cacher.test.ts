import { describe, it, beforeEach, expect, vi } from 'vitest';
import { MockKVNamespace } from './mocks';
import { Cacher } from './cacher';
import { SECOND } from './time';

describe('Cacher', () => {
	let namespace = new MockKVNamespace();

	beforeEach(() => {
		namespace = new MockKVNamespace();
	});

	it('should construct', () => {
		const cacher = new Cacher(namespace, 'items', (key) => key, 10 * SECOND);
		expect(cacher).toBeTruthy();
	});

	it('should call the fetcher', async () => {
		const fetcher = vi.fn((key) => key);
		const cacher = new Cacher(namespace, 'items', fetcher, 10 * SECOND);
		const received = await cacher.get('key');
		expect(received).toBe('key');
		expect(fetcher).toHaveBeenCalledExactlyOnceWith('key');
	});

	it('should set the ttl correctly', async () => {
		const fetcher = vi.fn((key) => key);
		const cacher = new Cacher(namespace, 'items', fetcher, 10 * SECOND);
		await cacher.get('key');
		expect(namespace.entries.has('items:"key"')).toBeTruthy();
		expect(namespace.entries.get('items:"key"')?.expirationTtl).toBe(10 * SECOND);
	});
});
