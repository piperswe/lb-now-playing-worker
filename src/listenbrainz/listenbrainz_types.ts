import * as z from 'zod';
import { MBID } from '../musicbrainz';

export const AdditionalInfo = z.object({
	artist_mbids: z.optional(z.array(MBID)),
	release_group_mbid: z.optional(MBID),
	release_mbid: z.optional(MBID),
	recording_mbid: z.optional(MBID),
	track_mbid: z.optional(MBID),
	work_mbids: z.optional(z.array(MBID)),
	track_number: z.any(),
	isrc: z.optional(z.string()),
	spotify_id: z.optional(z.string()),
	tags: z.optional(z.array(z.string())),
	media_player: z.optional(z.string()),
	media_player_version: z.optional(z.string()),
	listening_from: z.optional(z.string()),
	submission_client: z.optional(z.string()),
	submission_client_version: z.optional(z.string()),
	music_service: z.optional(z.string()),
	music_service_name: z.optional(z.string()),
	origin_url: z.optional(z.string()),
	duration_ms: z.optional(z.number()),
	duration: z.optional(z.number()),
});
export type AdditionalInfo = z.infer<typeof AdditionalInfo>;

export const TrackMetadata = z.object({
	artist_name: z.string(),
	track_name: z.string(),
	release_name: z.optional(z.string()),
	additional_info: z.optional(AdditionalInfo),
});
export type TrackMetadata = z.infer<typeof TrackMetadata>;

export const Listen = z.object({
	track_metadata: TrackMetadata,
	playing_now: z.optional(z.boolean()),
	listened_at: z.optional(z.number()),
});
export type Listen = z.infer<typeof Listen>;

export const ListensPayload = z.object({
	count: z.int(),
	playing_now: z.boolean(),
	user_id: z.string(),
	listens: z.array(Listen),
});
export type ListensPayload = z.infer<typeof ListensPayload>;

export const ListenType = z.enum(['single', 'playing_now', 'import']);
export type ListenType = z.infer<typeof ListenType>;

export const ListenSubmission = z.object({
	listen_type: ListenType,
	payload: z.array(Listen),
});
export type ListenSubmission = z.infer<typeof ListenSubmission>;

export const ListensResponse = z.object({
	payload: ListensPayload,
});
export type ListensResponse = z.infer<typeof ListensResponse>;

export const LookupResponse = z.object({
	artist_credit_name: z.string(),
	artist_mbids: z.array(MBID),
	recording_mbid: MBID,
	recording_name: z.string(),
	release_mbid: z.optional(MBID),
	release_name: z.optional(z.string()),
});
export type LookupResponse = z.infer<typeof LookupResponse>;
