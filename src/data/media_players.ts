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
