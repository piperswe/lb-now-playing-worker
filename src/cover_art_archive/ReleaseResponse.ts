import z from 'zod';
import { Image } from './Image';
import { MBID } from '../musicbrainz';

export const ReleaseResponse = z.object({
	images: z.array(Image),
	release: MBID,
});
export type ReleaseResponse = z.infer<typeof ReleaseResponse>;
