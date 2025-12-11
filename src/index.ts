/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { NowPlayingFetcher } from './fetcher';
import { ListenBrainzClient } from './listenbrainz';
import { getMusicBrainzAPI } from './musicbrainz';
import { updateKV } from './updater';
import { AutoRouter, IRequestStrict } from 'itty-router';

export interface Environment extends Env {
	LISTENBRAINZ_API_KEY: string;
}

const router = AutoRouter<IRequestStrict, [Environment, ExecutionContext]>();

router.get('/update', async function (_, env) {
	try {
		await updateKV(env);
	} catch (e) {
		return new Response(`${e}`, { status: 500 });
	}
	return new Response('OK');
});
router.get('/user/:username', async function ({ params: { username } }, env) {
	const fetcher = new NowPlayingFetcher(env.LB_NOW_PLAYING, new ListenBrainzClient(env.LISTENBRAINZ_API_KEY), getMusicBrainzAPI());
	return await fetcher.getNowPlaying(username);
});

export default {
	fetch: router.fetch.bind(router),
	async scheduled(controller, env, ctx) {
		await updateKV(env as Environment);
	},
} satisfies ExportedHandler<Env>;
