import {
  isConnected,
  requestAccess,
  getAddress,
  signTransaction
} from "@stellar/freighter-api";
import * as StellarSdk from "@stellar/stellar-sdk";

const CONTRACT_ID = "CDP345GRKIPU4ZRBNUGPJC63DISJN67B645RRZHLS7CTRK2IKK2GWN55";
const RPC_URL = "https://soroban-testnet.stellar.org";

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
      error: err.message || "Failed to connect wallet",
    };
  }
}

export async function fetchVotes() {
  try {
    const server = new StellarSdk.rpc.Server(RPC_URL);
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const dummyAccount = new StellarSdk.Account("GBRPYHIL2CI3FNQ4BXLFMNDLFNOJAAAAGBRPYHIL2CI3FNQ4BXLFMNDLFNOJAAAA", "0");

    // Fetch Yes votes
    const txYes = new StellarSdk.TransactionBuilder(dummyAccount, {
      fee: "100",
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(contract.call("get_yes_votes"))
      .setTimeout(StellarSdk.TimeoutInfinite)
      .build();

    const yesSim = await server.simulateTransaction(txYes);
    let yes = 0;
    if (yesSim && yesSim.results && yesSim.results[0] && yesSim.results[0].retval) {
      yes = StellarSdk.scValToNative(yesSim.results[0].retval);
    }

    // Fetch No votes
    const txNo = new StellarSdk.TransactionBuilder(dummyAccount, {
      fee: "100",
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(contract.call("get_no_votes"))
      .setTimeout(StellarSdk.TimeoutInfinite)
      .build();

    const noSim = await server.simulateTransaction(txNo);
    let no = 0;
    if (noSim && noSim.results && noSim.results[0] && noSim.results[0].retval) {
      no = StellarSdk.scValToNative(noSim.results[0].retval);
    }

    return { yesVotes: Number(yes || 0), noVotes: Number(no || 0) };
  } catch (err) {
    console.error("Error fetching votes:", err);
    return { yesVotes: 0, noVotes: 0 };
  }
}

export async function castVote(userAddress, choice) {
  const server = new StellarSdk.rpc.Server(RPC_URL);

  // 1. Fetch account sequence from Horizon
  const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${userAddress}`);
  if (!response.ok) {
    throw new Error("Connected account does not exist or has 0 XLM on Stellar Testnet. Please fund your testnet wallet.");
  }
  const accountData = await response.json();
  const account = new StellarSdk.Account(userAddress, accountData.sequence);

  // 2. Build Contract call operation
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  const method = choice === "Yes" ? "vote_yes" : "vote_no";
  const op = contract.call(method);

  // 3. Build Raw Transaction
  const rawTx = new StellarSdk.TransactionBuilder(account, {
    fee: "10000",
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(op)
    .setTimeout(StellarSdk.TimeoutInfinite)
    .build();

  // 4. Prepare Transaction (Soroban Footprint & Resource Assembly)
  let preparedTx;
  try {
    preparedTx = await server.prepareTransaction(rawTx);
  } catch (prepErr) {
    throw new Error("Contract preparation failed: " + (prepErr.message || prepErr));
  }

  const txXdr = preparedTx.toXDR();

  // 5. Sign transaction via Freighter
  const signResult = await signTransaction(txXdr, {
    networkPassphrase: StellarSdk.Networks.TESTNET,
  });

  if (signResult.error) {
    throw new Error("Transaction Rejected: " + signResult.error);
  }

  const signedXdr = signResult.signedTxXdr || signResult;

  // 6. Submit to Soroban RPC
  const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, StellarSdk.Networks.TESTNET);
  const sendResponse = await server.sendTransaction(signedTx);

  if (sendResponse.status === "ERROR") {
    throw new Error("Transaction failed on submit: " + sendResponse.status);
  }

  const txHash = sendResponse.hash;
  let status = sendResponse.status;
  let attempts = 0;
  
  while ((status === "PENDING" || status === "NOT_FOUND" || status === "TRY_AGAIN_LATER") && attempts < 15) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const txStatus = await server.getTransaction(txHash);
    status = txStatus.status;
    if (status === "SUCCESS") {
      break;
    } else if (status === "FAILED") {
      throw new Error("Transaction execution failed on-chain.");
    }
    attempts++;
  }

  if (status !== "SUCCESS") {
    throw new Error("Transaction timed out waiting for consensus.");
  }

  return txHash;
}