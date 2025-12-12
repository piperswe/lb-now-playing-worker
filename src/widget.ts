import htm from 'htm';
import vhtml from 'vhtml';
import { NowPlaying } from './now_playing';

const html = htm.bind(vhtml);

export function render(np: NowPlaying): string {
	const {
		username,
		coverArt,
		releaseGroupMBID,
		releaseGroupYear,
		releaseMBID,
		releaseTitle,
		releaseDisambiguation,
		historical,
		listenedAt,
		recordingTitle,
		recordingMBID,
		recordingDisambiguation,
		credits,
		musicService,
		mediaPlayer,
	} = np;
	const { name: musicServiceName, url: musicServiceURL } = musicService ?? {};
	const { name: mediaPlayerName, url: mediaPlayerURL } = mediaPlayer ?? {};
	const musicServiceLink = musicServiceURL ? html`<a href="${musicServiceURL}" rel="noopener">${musicServiceName}</a>` : musicServiceName;
	const mediaPlayerLink = mediaPlayerURL ? html`<a href="${mediaPlayerURL}" rel="noopener">${mediaPlayerName}</a>` : mediaPlayerName;
	return html`<div class="now-playing-widget">
		${coverArt
			? html`<a
						href="${releaseMBID
							? `https://musicbrainz.org/release/${releaseMBID}`
							: releaseGroupMBID
								? `https://musicbrainz.org/release-group/${releaseGroupMBID}`
								: '#'}"
						rel="noopener"
					>
						<!--suppress HtmlDeprecatedAttribute -->
						<img
							class="album-art"
							decoding="async"
							loading="lazy"
							src="${coverArt}"
							alt="Album art for ${releaseTitle}"
							onerror="this.style.display='none'; this.parentElement.nextElementSibling.style.display='flex';"
						/>
					</a>
					<div class="album-art-placeholder" style="display:none;">♪</div>`
			: html`<div class="album-art-placeholder">♪</div>`}
		<div class="track-info">
			${historical ? html`<div class="not-playing">Not live, last played ${listenedAt}</div>` : ''}
			${recordingTitle
				? html`<div class="track" title="Track/Recording">
						${recordingMBID
							? html` <a href="https://musicbrainz.org/recording/${recordingMBID}" rel="noopener">${recordingTitle}</a>`
							: ` ${recordingTitle}`}
						${recordingDisambiguation ? html` <span class="disambiguation">(${recordingDisambiguation})</span>` : ''}
					</div>`
				: ''}
			${credits.length > 0
				? html`<div class="artist" title="Artist">
						by
						${credits.map(
							(credit) => html`
								${credit.mbid
									? html` <a href="https://musicbrainz.org/artist/${credit.mbid}" rel="noopener">${credit.name}</a>`
									: ` ${credit.name}`}
								${credit.disambiguation ? html` <span class="disambiguation">(${credit.disambiguation})</span>` : ''} ${credit.joiner}
							`,
						)}
					</div> `
				: ''}
			${releaseTitle
				? html`<div class="album" title="Album/Release">
						on
						${releaseMBID
							? html` <a href="https://musicbrainz.org/release/${releaseMBID}" rel="noopener">${releaseTitle}</a>`
							: ` ${releaseTitle}`}
						${releaseDisambiguation ? html` <span class="disambiguation">${releaseDisambiguation}</span>` : ''}
						${releaseGroupYear ? html` <span class="year">${releaseGroupYear}</span>` : ''}
					</div>`
				: ''}
			<div class="attribution">
				${musicServiceLink && mediaPlayerLink
					? html`Streaming from ${musicServiceLink} via ${mediaPlayerLink}. `
					: musicServiceLink
						? html`Streaming from ${musicServiceLink}. `
						: mediaPlayerLink
							? html`Playing via ${mediaPlayerLink}. `
							: ''}
				<a href="https://github.com/piperswe/lb-now-playing-worker/">Widget</a> written by${' '}
				<a href="https://www.piperswe.me" rel="noopener">Piper McCorkle</a> and licensed under the${' '}
				<a href="https://interoperable-europe.ec.europa.eu/collection/eupl/eupl-text-eupl-12" rel="noopener">EUPL 1.2 license</a>.${' '}
				Music metadata is compiled under the${' '}
				<a href="https://musicbrainz.org/doc/About/Data_License" rel="noopener">CC0 license</a> by${' '}
				<a href="https://musicbrainz.org/" rel="noopener">MusicBrainz</a>. Live "now playing" data is provided under the CC0 license${' '}
				by <a href="https://listenbrainz.org/user/${username}" rel="noopener">ListenBrainz</a>. Cover art is provided by the${' '}
				<a href="https://coverartarchive.org/" rel="noopener">Cover Art Archive</a>, all rights reserved by the original artist(s).
			</div>
		</div>
	</div>` as string;
}

export function renderIFrame(np: NowPlaying): string {
	return html`
		<html lang="en-US">
			<head>
				<title>Now Playing Widget for ${np.username}</title>
				<script
					dangerouslySetInnerHTML=${{
						__html: `'use strict';
				// soft refresh, to avoid flicker
				const url = new URL(location.href);
				url.searchParams.delete('iframe');
				setInterval(async () => {
					const res = await fetch(url.toString());
					if (res.ok) {
						const widget = document.querySelector('.now-playing-widget');
						widget.outerHTML = await res.text();
					}
				}, 30000);`,
					}}
				></script>
				<style>
					body {
						width: 100vw;
						height: 100vh;
						margin: 0;
					}

					.now-playing-widget {
						width: 100vw;
						height: 100vh;
						display: flex;
						align-items: center;
						gap: 15px;
						font-family: sans-serif;
						line-height: 0.9;
					}

					.now-playing-widget .album-art {
						width: 100vh;
						height: 100vh;
						border-radius: 4px;
						object-fit: cover;
						flex-shrink: 0;
						font-size: 0;
					}

					.now-playing-widget .album-art-placeholder {
						width: 100vh;
						height: 100vh;
						border-radius: 4px;
						background: #e0e0e0;
						flex-shrink: 0;
						display: flex;
						align-items: center;
						justify-content: center;
						color: #999;
					}

					.now-playing-widget .track-info {
						flex: 1;
					}

					.now-playing-widget .track {
						font-weight: bold;
						color: #333;
					}

					.now-playing-widget .artist {
						color: #666;
						margin-top: 5px;
					}

					.now-playing-widget .album {
						color: #999;
						font-size: 0.9em;
						margin-top: 5px;
					}

					.now-playing-widget .not-playing {
						color: #999;
						font-size: 0.75em;
						font-style: italic;
						margin-bottom: 8px;
					}

					.now-playing-widget .error {
						color: #d00;
					}

					.now-playing-widget .attribution {
						color: #999;
						font-size: 0.65em;
						margin-top: 8px;
						line-height: 1.1;
					}

					.now-playing-widget .disambiguation,
					.now-playing-widget .year {
						color: #ccc;
						font-size: 0.75em;
						font-weight: normal;
					}

					.now-playing-widget a {
						color: inherit;
						text-decoration: underline;
						text-decoration-style: dotted;
					}

					.now-playing-widget a:hover {
						text-decoration: underline;
					}
				</style>
			</head>
			<body>
				${render(np)}
			</body>
		</html>
	` as string;
}
