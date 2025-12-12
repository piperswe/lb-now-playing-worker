import z from 'zod';
import { MBID } from '../musicbrainz';
import { ReleaseResponse } from './ReleaseResponse';

export const ImageSize = z.union([
	z.literal(250),
	z.literal(500),
	z.literal(1200),
	z.null(), // full size
]);
export type ImageSize = z.infer<typeof ImageSize>;

export interface ICoverArtArchiveClient {
	/**
	 * Fetch a listing of available cover art for a MusicBrainz release
	 */
	getReleaseCoverArt(id: MBID): Promise<ReleaseResponse>;

	/**
	 * Fetch the image that is most suitable to be called the "front" of a release. This is
	 * intentionally vague, and users will help curate this data into something that is meaningful, but here you'll
	 * find the artwork that users would most likely expect to see in:
	 *
	 * - Digital shops when searching for the release
	 * - Their portable media player
	 * - The folder icon in their file browser, if supported
	 * - What they would expect to find if they were looking for this release in a shop.
	 *
	 * Returns the URL to the cover art, or undefined if there is either no release with this MBID, or the community have not
	 * chosen an image to represent the front of a release.
	 */
	getReleaseFrontArt(id: MBID, size: ImageSize): Promise<string | undefined>;

	/**
	 * Fetch the image that is most suitable to be called the "front" of a release. This is
	 * intentionally vague, and users will help curate this data into something that is meaningful, but here you'll
	 * find the artwork that users would most likely expect to show:
	 *
	 * - A tracklisting, barcode, and label
	 * - What users would expect to find on the back cover if they were looking for this release in a shop.
	 *
	 * Returns the URL to the cover art, or undefined if there is either no release with this MBID, or the community have not
	 * chosen an image to represent the front of a release.
	 */
	getReleaseBackArt(id: MBID, size: ImageSize): Promise<string | undefined>;

	/**
	 * Fetch a listing of available cover art for a MusicBrainz release group
	 */
	getReleaseGroupCoverArt(id: MBID): Promise<ReleaseResponse>;

	/**
	 * Fetch the image that is most suitable to be called the "front" of a release group. This is
	 * intentionally vague, and users will help curate this data into something that is meaningful, but here you'll
	 * find the artwork that users would most likely expect to see in:
	 *
	 * - Digital shops when searching for the release
	 * - Their portable media player
	 * - The folder icon in their file browser, if supported
	 * - What they would expect to find if they were looking for this release in a shop.
	 *
	 * Returns the URL to the cover art, or undefined if there is either no release group with this MBID, or the community have not
	 * chosen an image to represent the front of a release group.
	 */
	getReleaseGroupFrontArt(id: MBID, size: ImageSize): Promise<string | undefined>;
}
