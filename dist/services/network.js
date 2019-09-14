"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("@arkecosystem/crypto");
const got_1 = __importDefault(require("got"));
const is_reachable_1 = __importDefault(require("is-reachable"));
const lodash_sample_1 = __importDefault(require("lodash.sample"));
const logger_1 = require("./logger");
class Network {
    constructor() {
        this.seeds = [];
    }
    async init(opts) {
        this.opts = opts;
        crypto_1.Managers.configManager.setFromPreset(opts.network);
        await this.loadSeeds();
    }
    async sendGET({ path, query = {} }) {
        return this.sendRequest("get", path, { query });
    }
    async sendPOST({ path, body = {} }) {
        return this.sendRequest("post", path, { body });
    }
    async sendRequest(method, url, opts, tries = 0, useSeed = false) {
        try {
            const peer = await this.getPeer(useSeed);
            const uri = `http://${peer.ip}:${peer.port}/api/${url}`;
            logger_1.logger.info(`Sending request on "${this.opts.network}" to "${uri}"`);
            if (opts.body && typeof opts.body !== "string") {
                opts.body = JSON.stringify(opts.body);
            }
            const { body } = await got_1.default[method](uri, {
                ...opts,
                ...{
                    headers: {
                        Accept: "application/vnd.core-api.v2+json",
                        "Content-Type": "application/json",
                    },
                    timeout: 3000,
                },
            });
            return JSON.parse(body);
        }
        catch (error) {
            logger_1.logger.error(error.message);
            tries++;
            if (tries > 2) {
                logger_1.logger.error(`Failed to find a responsive peer after 3 tries.`);
                return undefined;
            }
            return this.sendRequest(method, url, opts, tries);
        }
    }
    async getPeer(useSeed = false) {
        if (this.opts.peer) {
            return { ip: this.opts.peer, port: 4003 };
        }
        if (useSeed) {
            return lodash_sample_1.default(this.seeds);
        }
        const peer = lodash_sample_1.default(await this.getPeers());
        const reachable = await is_reachable_1.default(`${peer.ip}:${peer.port}`);
        if (!reachable) {
            logger_1.logger.warn(`${peer.ip}:${peer.port} is unresponsive. Choosing new peer.`);
            return this.getPeer();
        }
        return peer;
    }
    async getPeers() {
        const { data } = await this.sendRequest("get", "peers", {}, 0, true);
        if (!data || !data.length) {
            return this.seeds;
        }
        const peers = [];
        for (const peer of data) {
            const pluginName = Object.keys(peer.ports).find((key) => key.split("/")[1] === "core-api");
            if (pluginName) {
                const port = peer.ports[pluginName];
                if (port >= 1 && port <= 65535) {
                    peers.push({ ip: peer.ip, port });
                }
            }
        }
        return peers;
    }
    async loadSeeds() {
        const { body } = await got_1.default.get(`https://raw.githubusercontent.com/ArkEcosystem/peers/master/${this.opts.network}.json`);
        const seeds = JSON.parse(body);
        if (!seeds.length) {
            throw new Error("No seeds found");
        }
        for (const seed of seeds) {
            seed.port = 4003;
        }
        this.seeds = seeds;
    }
}
exports.network = new Network();
//# sourceMappingURL=network.js.map