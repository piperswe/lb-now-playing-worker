import { IRecording, IRelease, IReleaseGroup, MusicBrainzApi } from 'musicbrainz-api';
import { Cacher } from './cacher';
import { MONTH } from './time';

export function getMusicBrainzAPI(): MusicBrainzApi {
	return new MusicBrainzApi({
		appName: 'lbnp.piperswe.me',
		appContactInfo: 'github.com/piperswe/lb-now-playing-worker',
	});
}

export function recordingCacher(namespace: KVNamespace, client: MusicBrainzApi): Cacher<IRecording> {
	return new Cacher(namespace, 'mb-recording', (mbid) => client.lookup('recording', mbid, ['artists']), MONTH);
}

export function releaseCacher(namespace: KVNamespace, client: MusicBrainzApi): Cacher<IRelease> {
	return new Cacher(namespace, 'mb-release', (mbid) => client.lookup('release', mbid, ['release-groups']), MONTH);
}

export function releaseGroupCacher(namespace: KVNamespace, client: MusicBrainzApi): Cacher<IReleaseGroup> {
	return new Cacher(namespace, 'mb-release-group', (mbid) => client.lookup('release-group', mbid), MONTH);
}
