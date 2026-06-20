import {
  isConnected as freighterIsConnected,
  getAddress as freighterGetAddress,
} from "@stellar/freighter-api";

export interface WalletInfo {
  address: string;
  name: "Freighter" | "Albedo" | "xBull" | "Simulated Wallet";
  network: "Stellar Testnet";
}

/**
 * Checks if Freighter wallet is installed/connected in the browser.
 */
export async function checkFreighterInstalled(): Promise<boolean> {
  try {
    const res = await freighterIsConnected();
    return !!res.isConnected;
  } catch (e) {
    return false;
  }
}

/**
 * Connects to Freighter and retrieves the public key.
 */
export async function connectFreighter(): Promise<string> {
  const installed = await checkFreighterInstalled();
  if (!installed) {
    throw new Error("Wallet Not Found");
  }
  
  try {
    const res = await freighterGetAddress();
    if (res.error || !res.address) {
      throw new Error("Transaction Rejected");
    }
    return res.address;
  } catch (err: any) {
    throw new Error("Transaction Rejected");
  }
}

/**
 * Generates a random valid-looking Stellar Testnet Address for simulation
 */
export function generateSimulatedAddress(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let result = "GB";
  for (let i = 0; i < 54; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
