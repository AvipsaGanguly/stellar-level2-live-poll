import {
  isConnected,
  requestAccess,
  getAddress,
} from "@stellar/freighter-api";

export async function connectWallet() {
  try {
    const connected = await isConnected();

    if (!connected) {
      throw new Error("Freighter wallet is not installed.");
    }

    await requestAccess();

    const result = await getAddress();

    return {
      success: true,
      address: result.address,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
}