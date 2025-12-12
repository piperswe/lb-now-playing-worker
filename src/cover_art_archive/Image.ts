import z from 'zod';

export const Image = z.object({
	types: z.optional(z.array(z.string())),
	front: z.optional(z.boolean()),
	back: z.optional(z.boolean()),
	edit: z.optional(z.int()),
	image: z.optional(z.string()),
	comment: z.optional(z.string()),
	approved: z.optional(z.boolean()),
	id: z.optional(z.string()),
	thumbnails: z.optional(z.record(z.string(), z.string())),
});
export type Image = z.infer<typeof Image>;
