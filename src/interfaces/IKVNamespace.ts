export interface IKVNamespace {
	get(key: string, options?: { cacheTtl?: number }): Promise<string | null | undefined>;
	put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}
