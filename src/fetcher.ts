import { IArtistCredit, MusicBrainzApi } from 'musicbrainz-api';
import { ListenBrainzClient, playingNowCacher, lbRecordingCacher, Listen } from './listenbrainz';
import { recordingCacher, releaseCacher, releaseGroupCacher, MBID } from './musicbrainz';
import { ArtistCredit, NowPlaying, NowPlayingRecording } from './now_playing';
import { convertMediaPlayerName, convertStreamingService, convertStreamingServiceName } from './media_players';

export class NowPlayingFetcher {
	private playingNow: ReturnType<typeof playingNowCacher>;
	private lbRecording: ReturnType<typeof lbRecordingCacher>;
	private recording: ReturnType<typeof recordingCacher>;
	private release: ReturnType<typeof releaseCacher>;
	private releaseGroup: ReturnType<typeof releaseGroupCacher>;

	constructor(namespace: KVNamespace, lb: ListenBrainzClient, mb: MusicBrainzApi) {
		this.playingNow = playingNowCacher(namespace, lb);
		this.lbRecording = lbRecordingCacher(namespace, lb);
		this.recording = recordingCacher(namespace, mb);
		this.release = releaseCacher(namespace, mb);
		this.releaseGroup = releaseGroupCacher(namespace, mb);
	}

	private static normalizeDisambiguation(disambiguation: string | undefined): string | undefined {
		if (disambiguation !== '') {
			return disambiguation;
		}
	}

	private static createCredits(credits: IArtistCredit[] | null | undefined): ArtistCredit[] {
		return (
			credits?.map((credit) => ({
				name: credit.name,
				disambiguation: NowPlayingFetcher.normalizeDisambiguation(credit.artist.disambiguation),
				mbid: credit.artist.id,
				joiner: credit.joinphrase,
			})) ?? []
		);
	}

	private async getDataForRecordingAndRelease(username: string, recordingMBID: MBID, releaseMBID: MBID): Promise<NowPlayingRecording> {
		const recording = await this.recording.get(recordingMBID);
		const release = await this.release.get(releaseMBID);
		const credits = NowPlayingFetcher.createCredits(recording['artist-credit']);
		// TODO: cover art
		return {
			username,
			recordingTitle: recording.title,
			recordingDisambiguation: NowPlayingFetcher.normalizeDisambiguation(recording.disambiguation),
			recordingMBID: recording.id,
			durationSeconds: recording.length,
			credits,
			releaseTitle: release.title,
			releaseDisambiguation: NowPlayingFetcher.normalizeDisambiguation(release.disambiguation),
			releaseMBID: release.id,
			// releaseYear: release.date // TODO: extract year from date
			releaseGroupTitle: release['release-group']!.title,
			releaseGroupDisambiguation: NowPlayingFetcher.normalizeDisambiguation(release['release-group']!.disambiguation),
			releaseGroupMBID: release['release-group']!.id,
			// releaseGroupYear: release['release-group']!.date // TODO: extract year from date
		};
	}

	private async getDataForRecordingAndReleaseGroup(
		username: string,
		recordingMBID: MBID,
		releaseGroupMBID: MBID,
	): Promise<NowPlayingRecording> {
		const recording = await this.recording.get(recordingMBID);
		const releaseGroup = await this.releaseGroup.get(releaseGroupMBID);
		const credits = NowPlayingFetcher.createCredits(recording['artist-credit']);
		// TODO: cover art
		return {
			username,
			recordingTitle: recording.title,
			recordingDisambiguation: NowPlayingFetcher.normalizeDisambiguation(recording.disambiguation),
			recordingMBID: recording.id,
			durationSeconds: recording.length,
			credits,
			releaseGroupTitle: releaseGroup.title,
			releaseGroupDisambiguation: NowPlayingFetcher.normalizeDisambiguation(releaseGroup.disambiguation),
			releaseGroupMBID: releaseGroup.id,
			// releaseGroupYear: releaseGroup.date // TODO: extract year from date
		};
	}

	private async getDataForRecording(username: string, recordingMBID: MBID): Promise<NowPlayingRecording> {
		const recording = await this.recording.get(recordingMBID);
		const credits = NowPlayingFetcher.createCredits(recording['artist-credit']);
		// TODO: cover art
		return {
			username,
			recordingTitle: recording.title,
			recordingDisambiguation: NowPlayingFetcher.normalizeDisambiguation(recording.disambiguation),
			recordingMBID: recording.id,
			durationSeconds: recording.length,
			credits,
		};
	}

	private async getDataForReleaseGroup(username: string, releaseGroupMBID: MBID, trackName: string): Promise<NowPlayingRecording> {
		const releaseGroup = await this.releaseGroup.get(releaseGroupMBID);
		const credits = NowPlayingFetcher.createCredits(releaseGroup['artist-credit']);
		// TODO: cover art
		return {
			username,
			recordingTitle: trackName,
			credits,
			releaseGroupTitle: releaseGroup.title,
			releaseGroupDisambiguation: NowPlayingFetcher.normalizeDisambiguation(releaseGroup.disambiguation),
			releaseGroupMBID: releaseGroup.id,
			// releaseGroupYear: releaseGroup.date // TODO: extract year from date
		};
	}

	private async getRawNowPlaying(username: string, listen: Listen): Promise<NowPlayingRecording> {
		const additionalInfo = listen.track_metadata.additional_info;
		const recordingMBID = additionalInfo?.recording_mbid;
		const releaseMBID = additionalInfo?.release_mbid;
		const releaseGroupMBID = additionalInfo?.release_group_mbid;
		if (recordingMBID != null && releaseMBID != null) {
			console.log('have recording and release MBIDs');
			return this.getDataForRecordingAndRelease(username, recordingMBID, releaseMBID);
		} else if (recordingMBID != null && releaseGroupMBID != null) {
			console.log('have recording and release group MBIDs');
			return this.getDataForRecordingAndReleaseGroup(username, recordingMBID, releaseGroupMBID);
		} else if (recordingMBID != null) {
			console.log('have recording MBID');
			return this.getDataForRecording(username, recordingMBID);
		} else {
			const artistName = listen.track_metadata.artist_name;
			const trackName = listen.track_metadata.track_name;
			const releaseName = listen.track_metadata.release_name ?? null;
			console.log('no MBIDs, looking up', { artistName, trackName, releaseName });
			const matched = await this.lbRecording.get({ artistName, trackName, releaseName });
			console.log('matched', matched);
			const matchedRecordingMBID = matched.recording_mbid;
			const matchedReleaseMBID = matched.release_mbid;
			if (matchedReleaseMBID != null) {
				const release = await this.release.get(matchedReleaseMBID);
				const matchedReleaseGroupMBID = release['release-group']!.id;
				if (matchedRecordingMBID != null) {
					console.log('getting data for recording and release group', { matchedRecordingMBID, matchedReleaseGroupMBID });
					return await this.getDataForRecordingAndReleaseGroup(username, matchedRecordingMBID, matchedReleaseGroupMBID);
				} else {
					console.log('getting data for release group only', { matchedReleaseGroupMBID });
					return await this.getDataForReleaseGroup(username, matchedReleaseGroupMBID, trackName);
				}
			} else {
				console.log('no match');
				const releaseName = listen.track_metadata.release_name ?? '';
				return {
					username,
					credits: [],
					releaseGroupTitle: releaseName,
					recordingTitle: listen.track_metadata.track_name,
				};
			}
		}
	}

	async getNowPlaying(username: string): Promise<NowPlaying | null> {
		const playingNow = await this.playingNow.get(username);
		if (playingNow == null) {
			console.warn('playingNow is null');
			return null;
		}
		const listen = playingNow.payload.listens[0];
		if (listen == null) {
			console.warn('listen is null', playingNow);
			return null;
		}
		console.log('got now playing', { listen });
		const np = await this.getRawNowPlaying(username, listen);
		if (np == null) {
			console.warn('np is null');
			return null;
		}
		// Only mark as historical if it was actually a while ago
		const DURATION_MULTIPLIER = 1.2;
		const durationSeconds = np.durationSeconds;
		let historical = false;
		let listenedAt: string | undefined = undefined;
		let listenedAtTS = listen['listened_at'];
		if (listenedAtTS != null) {
			listenedAtTS /= 1000;
			historical =
				np.durationSeconds == 0 || (durationSeconds != null && listenedAtTS < new Date().getTime() - durationSeconds * DURATION_MULTIPLIER);
			listenedAt = new Date(listenedAtTS).toLocaleString();
		}

		const nowPlaying: NowPlaying = { ...np, historical, listenedAt };

		const musicService = listen.track_metadata.additional_info?.music_service;
		const musicServiceName = listen.track_metadata.additional_info?.music_service_name;
		const originURL = listen.track_metadata.additional_info?.origin_url;
		const mediaPlayer = listen.track_metadata.additional_info?.media_player;

		if (musicService != null) {
			nowPlaying.musicService = convertStreamingService(musicService);
		} else if (musicServiceName != null) {
			nowPlaying.musicService = convertStreamingServiceName(musicServiceName);
		}

		if (originURL != null) {
			if (nowPlaying.musicService == null) {
				nowPlaying.musicService = {
					url: originURL,
				};
			} else {
				nowPlaying.musicService!.url = originURL;
			}
		}
		if (mediaPlayer != null) {
			nowPlaying.mediaPlayer = convertMediaPlayerName(mediaPlayer);
		}

		return nowPlaying;
	}
}
