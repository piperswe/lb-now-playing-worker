import * as z from 'zod';
import { ListensResponse, LookupResponse } from './listenbrainz_types';

export class ListenbrainzClient {
	private baseURL: string;
	private apiToken: string | null;

	constructor(baseURL: string = 'https://api.listenbrainz.org', apiToken: string | null = null) {
		this.baseURL = baseURL;
		this.apiToken = apiToken;
	}

	private async get(
		path: string,
		searchParams: URLSearchParams | ConstructorParameters<typeof URLSearchParams>[0] = new URLSearchParams(),
	): Promise<Response> {
		const urlString = `${this.baseURL}${path}`;
		const url = new URL(urlString);
		const newSearchParams = searchParams instanceof URLSearchParams ? searchParams : new URLSearchParams(searchParams);
		newSearchParams.forEach((value, key) => {
			url.searchParams.append(key, value);
		});
		const req = new Request(url, {
			headers: {
				'User-Agent': 'github.com/piperswe/lb-now-playing-worker',
			},
		});
		if (this.apiToken != null) {
			req.headers.append('Authorization', `Token ${this.apiToken}`);
		}
		return await fetch(req);
	}

	private async getJson<T extends z.ZodType>(
		outputType: T,
		path: string,
		searchParams: URLSearchParams | ConstructorParameters<typeof URLSearchParams>[0] = new URLSearchParams(),
	): Promise<z.output<T>> {
		const response = await this.get(path, searchParams);
		if (!response.ok) {
			throw new Error(`got error code ${response.status}, expected 200`);
		}
		const json = await response.json();
		const parsed = await outputType.parseAsync(json);
		return parsed;
	}

	async lookupRecording(artist: string, track: string, release: string | null = null): Promise<LookupResponse> {
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
		const path = `/1/user/${encodeURIComponent(username)}/playing-now`;
		return await this.getJson(ListensResponse, path);
	}

	async listens(username: string, count: number): Promise<ListensResponse> {
		const path = `/1/user/${encodeURIComponent(username)}/listens`;
		const search = {
			count: `${count}`,
		};
		return await this.getJson(ListensResponse, path, search);
	}
}
