import * as z from 'zod';
import { ListensResponse, LookupResponse, IListenBrainzClient } from '.';
import { HTTPClient } from '../HTTPClient';

export class ListenBrainzClient extends HTTPClient implements IListenBrainzClient {
	constructor(
		private apiToken: string | null = null,
		baseURL: string = 'https://api.listenbrainz.org',
	) {
		super(baseURL);
	}

	protected override addHeaders(headers: Headers): void {
		if (this.apiToken != null) {
			headers.append('Authorization', `Token ${this.apiToken}`);
		}
	}

	async lookupRecording(artist: string, track: string, release: string | null = null): Promise<LookupResponse> {
		console.log('looking up recording', { artist, track, release });
		const path = '/1/metadata/lookup';
		const search: Record<string, string> = {
			artist_name: artist,
			recording_name: track,
		};
		if (release != null) {
			search.release_name = release;
		}
		return await this.getJson(LookupResponse, path, search);
	}

	async playingNow(username: string): Promise<ListensResponse> {
		console.log('getting playing now', { username });
		const path = `/1/user/${encodeURIComponent(username)}/playing-now`;
		return await this.getJson(ListensResponse, path);
	}

	async listens(username: string, count: number): Promise<ListensResponse> {
		console.log('getting listens', { username, count });
		const path = `/1/user/${encodeURIComponent(username)}/listens`;
		const search = {
			count: `${count}`,
		};
		return await this.getJson(ListensResponse, path, search);
	}
}
