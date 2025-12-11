import * as z from 'zod';

export const MBID = z.uuid();
export type MBID = z.infer<typeof MBID>;
