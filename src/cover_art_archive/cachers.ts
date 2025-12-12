import { Cacher } from '../cacher';
import { WEEK } from '../time';
import { ICoverArtArchiveClient } from '.';

export function releaseFrontCacher(namespace: KVNamespace, client: ICoverArtArchiveClient): Cacher<string | undefined> {
	return new Cacher(namespace, 'playing-now', (mbid) => client.getReleaseFrontArt(mbid, 500), WEEK);
}

export function releaseGroupFrontCacher(namespace: KVNamespace, client: ICoverArtArchiveClient): Cacher<string | undefined> {
	return new Cacher(namespace, 'playing-now', (mbid) => client.getReleaseGroupFrontArt(mbid, 500), WEEK);
}
