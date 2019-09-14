import { Types } from "@arkecosystem/crypto";
declare class Network {
    private opts;
    private seeds;
    init(opts: {
        network: Types.NetworkName;
        peer: string;
    }): Promise<void>;
    sendGET({ path, query }: {
        path: string;
        query?: Record<string, any>;
    }): Promise<any>;
    sendPOST({ path, body }: {
        path: string;
        body: Record<string, any>;
    }): Promise<any>;
    private sendRequest;
    private getPeer;
    private getPeers;
    private loadSeeds;
}
export declare const network: Network;
export {};
