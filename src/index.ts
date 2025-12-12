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
import { render, renderIFrame } from './widget';
import { CoverArtArchiveClient } from './cover_art_archive';

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
	const iframe = username.endsWith('.iframe.html');
	const html = username.endsWith('.html');
	const strippedUsername = username.replace(/(\.iframe)?\.html$/, '');
	const fetcher = new NowPlayingFetcher(
		env.LB_NOW_PLAYING,
		new ListenBrainzClient(env.LISTENBRAINZ_API_KEY),
		getMusicBrainzAPI(),
		new CoverArtArchiveClient(),
	);
	const data = await fetcher.getNowPlaying(strippedUsername);
	if (data == null) {
		return new Response('not found', { status: 404 });
	}
	if (iframe) {
		return new Response(renderIFrame(data), {
			headers: {
				'Content-Type': 'text/html; charset=utf-8',
			},
		});
	} else if (html) {
		return new Response(render(data), {
			headers: {
				'Content-Type': 'text/html; charset=utf-8',
			},
		});
	} else {
		return data;
	}
});

export default {
	fetch: router.fetch.bind(router),
	async scheduled(controller, env, ctx) {
		await updateKV(env as Environment);
	},
} satisfies ExportedHandler<Env>;
