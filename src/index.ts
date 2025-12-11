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

import { playingNowCacher } from './cacher';
import { ListenbrainzClient } from './listenbrainz';
import { updateKV } from './updater';
import { AutoRouter, IRequestStrict } from 'itty-router';

const router = AutoRouter<IRequestStrict, [Env, ExecutionContext]>();

router.get('/update', async function (_, env) {
	try {
		await updateKV(env);
	} catch (e) {
		return new Response(`${e}`, { status: 500 });
	}
	return new Response('OK');
});
router.get('/user/:username', async function ({ params: { username } }, env) {
	const cacher = playingNowCacher(env.LB_NOW_PLAYING, new ListenbrainzClient());
	return await cacher.get(username);
});

export default {
	fetch: router.fetch.bind(router),
	async scheduled(controller, env, ctx) {
		await updateKV(env);
	},
} satisfies ExportedHandler<Env>;
