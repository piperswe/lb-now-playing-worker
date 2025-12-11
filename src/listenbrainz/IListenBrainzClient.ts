import { ListensResponse, LookupResponse } from '.';

export interface ILookupRecording {
	lookupRecording(artist: string, track: string, release: string | null): Promise<LookupResponse>;
}

export interface IPlayingNow {
	playingNow(username: string): Promise<ListensResponse>;
}

export interface IListens {
	listens(username: string, count: number): Promise<ListensResponse>;
}

export interface IListenBrainzClient extends ILookupRecording, IPlayingNow, IListens {}
