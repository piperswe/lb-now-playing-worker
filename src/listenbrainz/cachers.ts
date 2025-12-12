import { Cacher } from '../cacher';
import { MINUTE, MONTH, SECOND } from '../time';
import { ILookupRecording, IPlayingNow, ListensResponse, LookupResponse } from '.';

export function playingNowCacher(namespace: KVNamespace, client: IPlayingNow): Cacher<ListensResponse> {
	return new Cacher(namespace, 'playing-now', (username) => client.playingNow(username), 60 * SECOND);
}

export interface LBRecordingKey {
	artistName: string;
	trackName: string;
	releaseName: string | null;
}

export function lbRecordingCacher(namespace: KVNamespace, client: ILookupRecording): Cacher<LookupResponse, LBRecordingKey> {
	return new Cacher(
		namespace,
		'lb-recording',
		({ artistName, trackName, releaseName }) => client.lookupRecording(artistName, trackName, releaseName),
		MONTH,
	);
}
