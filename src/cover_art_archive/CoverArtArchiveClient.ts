import { HTTPClient } from '../HTTPClient';
import { MBID } from '../musicbrainz';
import { ICoverArtArchiveClient, ImageSize } from './ICoverArtArchiveClient';
import { ReleaseResponse } from './ReleaseResponse';

function releasePath(id: MBID): string {
	return `/release/${encodeURIComponent(id)}`;
}

function releaseGroupPath(id: MBID): string {
	return `/release-group/${encodeURIComponent(id)}`;
}

export class CoverArtArchiveClient extends HTTPClient implements ICoverArtArchiveClient {
	constructor(baseURL: string = 'https://coverartarchive.org') {
		super(baseURL);
	}

	async getReleaseCoverArt(id: MBID): Promise<ReleaseResponse> {
		console.log('getting release cover art', { id });
		return await this.getJson(ReleaseResponse, releasePath(id));
	}

	async getReleaseFrontArt(id: MBID, size: ImageSize): Promise<string | undefined> {
		console.log('getting release front art', { id, size });
		let path = `${releasePath(id)}/front`;
		if (size != null) {
			path += `-${size}`;
		}
		return await this.getRedirectPath(path);
	}

	async getReleaseBackArt(id: MBID, size: ImageSize): Promise<string | undefined> {
		console.log('getting release back art', { id, size });
		let path = `${releasePath(id)}/back`;
		if (size != null) {
			path += `-${size}`;
		}
		return await this.getRedirectPath(path);
	}

	async getReleaseGroupCoverArt(id: MBID): Promise<ReleaseResponse> {
		console.log('getting release group cover art', { id });
		return await this.getJson(ReleaseResponse, releaseGroupPath(id));
	}

	async getReleaseGroupFrontArt(id: MBID, size: ImageSize): Promise<string | undefined> {
		console.log('getting release group front art', { id, size });
		let path = `${releaseGroupPath(id)}/front`;
		if (size != null) {
			path += `-${size}`;
		}
		return await this.getRedirectPath(path);
	}
}
