import { Environment } from '.';
import { NowPlayingFetcher } from './fetcher';
import { ListenbrainzClient } from './listenbrainz';
import { getMusicBrainzAPI } from './musicbrainz';

export async function updateKV(env: Environment) {
	const usernames = ['piperswe', 'kutx'];
	const fetcher = new NowPlayingFetcher(env.LB_NOW_PLAYING, new ListenbrainzClient(env.LISTENBRAINZ_API_KEY), getMusicBrainzAPI());
	await Promise.all(
		usernames.map(async (username) => {
			await fetcher.getNowPlaying(username);
		}),
	);
}
