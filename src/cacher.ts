import { ListenbrainzClient } from './listenbrainz';
import { ListensResponse } from './listenbrainz_types';

export class Cacher<T> {
	constructor(
		private namespace: KVNamespace,
		private prefix: string,
		private fetcher: (key: string) => T | Promise<T>,
		private ttl: number, // seconds
	) {}

	private kvKey(key: string): string {
		return `${this.prefix}:${key}`;
	}

	async get(key: string): Promise<T> {
		const kvKey = this.kvKey(key);
		const kvValue = await this.namespace.get(kvKey);
		if (kvValue == null) {
			return await this.put(key);
		}
		return JSON.parse(kvValue);
	}

	async put(key: string): Promise<T> {
		const kvKey = this.kvKey(key);
		const fetched = await this.fetcher(key);
		await this.namespace.put(kvKey, JSON.stringify(fetched), { expirationTtl: this.ttl });
		return fetched;
	}
}

export function playingNowCacher(namespace: KVNamespace, client: ListenbrainzClient): Cacher<ListensResponse> {
	return new Cacher(
		namespace,
		'playing-now',
		(username) => client.playingNow(username),
		2 * 60, // 2 minutes
	);
}
