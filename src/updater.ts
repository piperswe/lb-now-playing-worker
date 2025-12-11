import { playingNowCacher } from './cacher';
import { ListenbrainzClient } from './listenbrainz';
import { ListensResponse } from './listenbrainz_types';

export async function updateKV(env: Env) {
	const usernames = ['piperswe', 'kutx'];
	const client = new ListenbrainzClient();
	const cacher = playingNowCacher(env.LB_NOW_PLAYING, client);
	await Promise.all(
		usernames.map(async (username) => {
			await cacher.put(username);
		}),
	);
}
