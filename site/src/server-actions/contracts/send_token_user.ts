"use server"

// Hedera token transfer functionality will be implemented
import { MyError } from "@/constants/errors";
import { BuyTokenArgs } from "@/types/stocks";

// Legacy Avalanche function - deprecated
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function sendTokensToUserAvalanche(_args: BuyTokenArgs) {
    console.log("Avalanche support has been removed. Use Hedera tokens instead.");
    throw new MyError("Avalanche support has been removed. Use sendTokensToUserHedera instead.");
}

export async function sendTokensToUserHedera(args:  { tokenId: string, amount: number, receiverAddress: string }) {
    try {
        // TODO: Implement Hedera token transfer using Hedera SDK
        console.log("Sending Hedera tokens:", args);
        throw new Error("Hedera token transfer not yet implemented");
    } catch(err) {
        console.error("Error sending tokens", err);
        throw new MyError("Could not send tokens to user");
    }
}