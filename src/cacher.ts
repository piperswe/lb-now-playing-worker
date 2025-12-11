export class Cacher<T, Key = string> {
	constructor(
		private namespace: KVNamespace,
		private prefix: string,
		private fetcher: (key: Key) => T | Promise<T>,
		private ttl: number, // seconds
		private coloCacheTtl: number = ttl, // seconds to cache locally in the colo's cache
	) {}

	private kvKey(key: Key): string {
		return `${this.prefix}:${JSON.stringify(key)}`;
	}

	async get(key: Key): Promise<T> {
		const kvKey = this.kvKey(key);
		const kvValue = await this.namespace.get(kvKey, { cacheTtl: this.coloCacheTtl });
		if (kvValue == null) {
			console.log('cache miss', { kvKey });
			return await this.put(key);
		}
		console.log('cache hit', { kvKey });
		return JSON.parse(kvValue);
	}

	async put(key: Key): Promise<T> {
		const kvKey = this.kvKey(key);
		const fetched = await this.fetcher(key);
		await this.namespace.put(kvKey, JSON.stringify(fetched), { expirationTtl: this.ttl });
		return fetched;
	}
}
