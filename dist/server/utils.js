"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("@arkecosystem/crypto");
const wif_1 = __importDefault(require("wif"));
const database_1 = require("../services/database");
const logger_1 = require("../services/logger");
const network_1 = require("../services/network");
exports.getBIP38Wallet = async (userId, bip38password) => {
    const encryptedWif = await database_1.database.get(crypto_1.Crypto.HashAlgorithms.sha256(Buffer.from(userId)).toString("hex"));
    return encryptedWif ? exports.decryptWIF(encryptedWif, userId, bip38password) : undefined;
};
exports.decryptWIF = (encryptedWif, userId, bip38password) => {
    const decrypted = crypto_1.Crypto.bip38.decrypt(encryptedWif.toString("hex"), bip38password + userId);
    const encodedWIF = wif_1.default.encode(crypto_1.Managers.configManager.get("network.wif"), decrypted.privateKey, decrypted.compressed);
    return { keys: crypto_1.Identities.Keys.fromWIF(encodedWIF), wif: encodedWIF };
};
exports.buildTransaction = async (params, method) => {
    const transactionBuilder = crypto_1.Transactions.BuilderFactory.transfer()
        .recipientId(params.recipientId)
        .amount(params.amount);
    if (params.vendorField) {
        transactionBuilder.vendorField(params.vendorField);
    }
    try {
        const { data } = await network_1.network.sendGET({
            path: "node/fees",
        });
        const fee = data.find(({ type }) => type === 0).avg;
        if (fee && Number(fee) > 0) {
            transactionBuilder.fee(fee);
        }
    }
    catch (error) {
        logger_1.logger.warn("Failed to retrieve the average fee.");
    }
    const transaction = transactionBuilder[method](params.passphrase).getStruct();
    if (!crypto_1.Transactions.Verifier.verifyHash(transaction)) {
        throw new Error("...");
    }
    return transaction;
};
//# sourceMappingURL=utils.js.map