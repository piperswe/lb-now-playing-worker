import { StatusCodes } from 'http-status-codes';
import z from 'zod';

export class HTTPClient {
	constructor(private baseURL: string) {}

	protected addHeaders(headers: Headers) {}

	protected async get(
		path: string,
		searchParams: URLSearchParams | ConstructorParameters<typeof URLSearchParams>[0] = new URLSearchParams(),
		requestInit: RequestInit = {},
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
				...(requestInit.headers ?? {}),
			},
			...requestInit,
		});
		this.addHeaders(req.headers);
		return await fetch(req);
	}

	protected async getJson<T extends z.ZodType>(
		outputType: T,
		path: string,
		searchParams: URLSearchParams | ConstructorParameters<typeof URLSearchParams>[0] = new URLSearchParams(),
	): Promise<z.output<T>> {
		const response = await this.get(path, searchParams);
		if (!response.ok) {
			throw new Error(`got error code ${response.status}, expected 200. body: ${await response.text()}`);
		}
		const json = await response.json();
		const parsed = await outputType.parseAsync(json);
		return parsed;
	}

	protected async getRedirectPath(
		path: string,
		searchParams: URLSearchParams | ConstructorParameters<typeof URLSearchParams>[0] = new URLSearchParams(),
	): Promise<string | undefined> {
		const response = await this.get(path, searchParams, { redirect: 'manual' });
		switch (response.status) {
			case StatusCodes.TEMPORARY_REDIRECT:
				return response.headers.get('Location') ?? undefined;
			case StatusCodes.NOT_FOUND:
				return undefined;
			default:
				throw new Error(`got error code ${response.status}, expected ${StatusCodes.TEMPORARY_REDIRECT}. body: ${await response.text()}`);
		}
	}
}
