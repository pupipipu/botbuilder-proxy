export declare class OpenIdMetadata {
    private url;
    private proxy;
    private lastUpdated;
    private keys;
    constructor(url: string, proxy?: string);
    getKey(keyId: string, cb: (key: IOpenIdMetadataKey) => void): void;
    private refreshCache(cb);
    private findKey(keyId);
}
export interface IOpenIdMetadataKey {
    key: string;
    endorsements?: string[];
}
