import { IRecording, IRelease, IReleaseGroup, MusicBrainzApi } from 'musicbrainz-api';
import { MBID } from './musicbrainz_types';
import { Cacher } from './cacher';
import { Listen } from './listenbrainz_types';
import { MediaPlayer, StreamingService } from './media_players';

export interface ArtistCredit {
	name: string;
	disambiguation?: string;
	mbid: MBID;
	joiner: string;
}

export interface NowPlayingRecording {
	username: string;
	recordingTitle: string;
	recordingMBID?: MBID;
	recordingDisambiguation?: string;
	credits: ArtistCredit[];
	releaseTitle?: string;
	releaseMBID?: MBID;
	releaseDisambiguation?: string;
	releaseYear?: number;
	releaseGroupTitle?: string;
	releaseGroupMBID?: MBID;
	releaseGroupDisambiguation?: string;
	releaseGroupYear?: number;
	coverArt?: string;
	durationSeconds?: number;
}

export interface NowPlaying extends NowPlayingRecording {
	historical: boolean;
	listenedAt?: string;
	musicService?: StreamingService;
	mediaPlayer?: MediaPlayer;
}
