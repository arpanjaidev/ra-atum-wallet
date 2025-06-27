import React, { useState } from "react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useWriteContract } from "wagmi";

// Example presale contract placeholder
const presaleAddress = "0x0000000000000000000000000000000000000000";
const presaleABI = [
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "purchase",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

export default function PreSalePage() {
  const { open } = useWeb3Modal();
  const { isConnected } = useAccount();
  const [amount, setAmount] = useState(0);
  const { writeContract, isPending } = useWriteContract();

  const handleBuy = async () => {
    try {
      await writeContract({
        address: presaleAddress,
        abi: presaleABI,
        functionName: "purchase",
        args: [amount],
        chainId: 56, // BNB mainnet
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{
      background: "#0e1018",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "#ffffff",
    }}>
      <h2>Token Pre‑Sale</h2>
      <button
        style={{ marginBottom: 20, padding: "10px 20px" }}
        onClick={open}
      >
        {isConnected ? "Connected" : "Connect Wallet"}
      </button>
      <div style={{ display: "flex", gap: 10 }}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          style={{ padding: "8px", width: 140 }}
        />
        <button onClick={handleBuy} disabled={!isConnected || isPending}>
          Buy Tokens
        </button>
      </div>
    </div>
  );
}
