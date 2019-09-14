import { Interfaces } from "@arkecosystem/crypto";
import { IWallet } from "../interfaces";
export declare const getBIP38Wallet: (userId: any, bip38password: any) => Promise<IWallet>;
export declare const decryptWIF: (encryptedWif: any, userId: any, bip38password: any) => IWallet;
export declare const buildTransaction: (params: {
    recipientId: string;
    amount: string;
    vendorField?: string;
    passphrase: string;
}, method: "sign" | "signWithWif") => Promise<Interfaces.ITransactionData>;
