"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import { useAccount, useSwitchChain, useWalletClient } from "wagmi";
import { contractAddress } from "@/lib/deployment";

const readClient = createClient({ chain: studionet });
export const liveKey = ["live-contract"] as const;

export async function readContract<T>(functionName: string, args: unknown[] = []): Promise<T> {
  if (!contractAddress) throw new Error("The verified contract address is unavailable.");
  return await readClient.readContract({
    address: contractAddress,
    functionName,
    args: args as never[],
    jsonSafeReturn: true,
  }) as unknown as T;
}

export function useLiveWrite() {
  const [status, setStatus] = useState<{ stage: string; hash?: string; error?: string }>({ stage: "idle" });
  const { address, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();
  const queryClient = useQueryClient();

  const write = useCallback(async (functionName: string, args: unknown[]) => {
    if (!contractAddress) throw new Error("The verified contract address is unavailable.");
    if (!address || !walletClient) throw new Error("Connect a wallet before signing.");
    try {
      if (chainId !== 61999) await switchChainAsync({ chainId: 61999 });
      const provider = { request: ({ method, params }: { method: string; params?: readonly unknown[] | object }) =>
        walletClient.request({ method: method as never, params: params as never }) };
      const client = createClient({ chain: studionet, account: address, provider: provider as never });
      setStatus({ stage: "wallet" });
      const hash = await client.writeContract({ address: contractAddress, functionName, args: args as never[], value: BigInt(0) });
      setStatus({ stage: "finalizing", hash });
      const receipt = await readClient.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, interval: 3000, retries: 200 });
      const result = receipt.resultName ?? (receipt as unknown as { result_name?: string }).result_name;
      if (result !== "MAJORITY_AGREE") throw new Error(`Consensus ended with ${result || "unknown"}.`);
      setStatus({ stage: "finalized", hash });
      await queryClient.invalidateQueries({ queryKey: liveKey });
      return hash;
    } catch (cause) {
      const error = cause instanceof Error ? cause.message : "Transaction failed.";
      setStatus({ stage: "failed", error });
      throw cause;
    }
  }, [address, chainId, queryClient, switchChainAsync, walletClient]);

  return { write, status, connected: Boolean(address) };
}
