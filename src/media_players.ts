export interface MediaPlayer {
	name: string;
	url?: string;
}

export const mediaPlayers: Record<string, MediaPlayer> = {
	strawberry: {
		name: 'the Strawberry music player',
		url: 'https://www.strawberrymusicplayer.org/',
	},
	plex: {
		name: 'Plex',
		url: 'https://www.plex.tv/',
	},
};

export function convertMediaPlayerName(name: string): MediaPlayer {
	return (
		mediaPlayers[name] ?? {
			name,
		}
	);
}

export interface StreamingService {
	name?: string;
	url?: string;
}

export const streamingServices: Record<string, StreamingService> = {
	'spotify.com': {
		name: 'Spotify',
		url: 'https://www.spotify.com/',
	},
	'bandcamp.com': {
		name: 'Bandcamp',
		url: 'https://www.bandcamp.com/',
	},
	'youtube.com': {
		name: 'YouTube',
		url: 'https://www.youtube.com/',
	},
	'music.youtube.com': {
		name: 'YouTube Music',
		url: 'https://music.youtube.com/',
	},
	'deezer.com': {
		name: 'Deezer',
		url: 'https://www.deezer.com/',
	},
	'tidal.com': {
		name: 'Tidal',
		url: 'https://www.tidal.com/',
	},
	'music.apple.com': {
		name: 'Apple Music',
		url: 'https://music.apple.com/',
	},
	'archive.org': {
		name: 'Internet Archive',
		url: 'https://www.archive.org/',
	},
	'soundcloud.com': {
		name: 'SoundCloud',
		url: 'https://www.soundcloud.com/',
	},
	'jamendo.com': {
		name: 'Jamendo',
		url: 'https://www.jamendo.com/',
	},
	'siriusxm.com': {
		name: 'SiriusXM',
		url: 'https://www.siriusxm.com/',
	},
	'qobuz.com': {
		name: 'Qobuz',
		url: 'https://www.qobuz.com/',
	},
	'somafm.com': {
		name: 'SomaFM',
		url: 'https://www.somafm.com/',
	},
};

export const streamingServicesByName: Record<string, StreamingService> = (function () {
	const byName: Record<string, StreamingService> = {};
	for (const service of Object.values(streamingServices)) {
		const name = service.name;
		if (name != null) {
			byName[name] = service;
		}
	}
	return byName;
})();

export function convertStreamingService(id: string): StreamingService {
	return (
		streamingServices[id] ?? {
			name: id,
			url: `https://${id}/`,
		}
	);
}

export function convertStreamingServiceName(name: string): StreamingService {
	return (
		streamingServicesByName[name] ?? {
			name,
		}
	);
}
