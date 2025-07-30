// src/WalletPage.jsx
import React, { useEffect, useState } from "react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";

const tokenAddress = "0xcE06aDbB070c2f0d90Ba109E77c0c2Ff83F9Ff3A";
const tokenABI = [
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
];

export default function WalletPage() {
  // Live BNB price fetch
  const [bnbUsd, setBnbUsd] = useState(null);
  const [bnbInr, setBnbInr] = useState(null);
  useEffect(() => {
    async function fetchBNBPrice() {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd,inr"
        );
        const data = await res.json();
        setBnbUsd(data.binancecoin.usd);
        setBnbInr(data.binancecoin.inr);
      } catch (err) {
        setBnbUsd(786);
        setBnbInr(68912);
      }
    }
    fetchBNBPrice();
    const interval = setInterval(fetchBNBPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  // Wallet logic
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: tokenABI,
    functionName: "decimals",
    chainId: 56,
  });
  const { data: rawBalance, isLoading: balanceLoading } = useReadContract({
    address: tokenAddress,
    abi: tokenABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: 56,
  });
  let tokenBalance = "–";
  if (isConnected) {
    if (balanceLoading || decimals === undefined) tokenBalance = "Fetching...";
    else if (rawBalance)
      tokenBalance = parseFloat(formatUnits(rawBalance, decimals)).toLocaleString(undefined, {
        maximumFractionDigits: 4,
      });
    else tokenBalance = "0";
  }
  const referralEarnings = isConnected ? "0.00" : "–";

  // Typing effect headline
  const [walletHeadline, setWalletHeadline] = useState("");
  const walletTypingText = "JOIN RA ATUM TO SHAPE THE FUTURE OF BLOCKCHAIN-POWERED KINDNESS.";
  useEffect(() => {
    let wIndex = 0, wTypingForward = true, wBlinkOn = true, stopped = false;
    function typeWalletLine() {
      if (stopped) return;
      let html =
        walletTypingText.substring(0, wIndex) +
        `<span style="color:#0fffc7;font-weight:bold;font-size:1.15em;">${wBlinkOn ? "|" : "&nbsp;"}</span>`;
      setWalletHeadline(html);
      if (wTypingForward) {
        if (wIndex <= walletTypingText.length) {
          wIndex++;
          setTimeout(typeWalletLine, 32);
        } else {
          wTypingForward = false;
          setTimeout(typeWalletLine, 900);
        }
      } else {
        if (wIndex >= 0) {
          wIndex--;
          setTimeout(typeWalletLine, 15);
        } else {
          wTypingForward = true;
          setTimeout(typeWalletLine, 500);
        }
      }
    }
    let blinkInt = setInterval(() => { wBlinkOn = !wBlinkOn; }, 380);
    typeWalletLine();
    return () => { stopped = true; clearInterval(blinkInt); };
  }, []);

  // Calculator
  const [calcValue, setCalcValue] = useState(1000);
  const livePresalePrice = {
    inr: bnbInr ? (0.01 * bnbInr).toFixed(4) : "0.0000",
    usd: bnbUsd ? (0.01 * bnbUsd).toFixed(4) : "0.0000",
    bnb: 0.00001,
  };
  const userRa = calcValue || 1;
  const userPresalePrice = {
    inr: bnbInr ? (userRa * 0.01 * bnbInr).toFixed(2) : "0.00",
    usd: bnbUsd ? (userRa * 0.01 * bnbUsd).toFixed(2) : "0.00",
    bnb: (userRa * 0.00001).toFixed(5),
  };

  return (
    <>
      <style>
        {`
        html, body, #root {
          min-height: 100vh !important;
          margin: 0; padding: 0;
        }
        body {
          background: url('https://i.pinimg.com/1200x/52/50/a6/5250a6ebb1739452d85599607b904ced.jpg') no-repeat center center fixed !important;
          background-size: cover !important;
          min-height: 100vh !important;
        }
        .wallet-main-bg {
          min-height: 100vh;
          width: 100vw;
          padding: 40px 0 0 0;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: flex-start;
        }
        .wallet-full-row {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 38px;
          margin: 0 auto 48px auto;
          max-width: 1300px;
          width: 100%;
          flex-wrap: wrap;
        }
        .wallet-container, .wallet-calc-container {
          background: rgba(9,19,28,0.92);
          border-radius: 18px;
          box-shadow: 0 8px 40px #00f7ff33, 0 1.5px 0 #0fffc766;
          border: 2.5px solid #0fffc7;
          padding: 32px 22px 22px 22px;
          min-width: 320px;
          width: 390px;
          max-width: 98vw;
          font-family: 'Share Tech Mono', monospace;
          position: relative;
          z-index: 3;
        }
        .wallet-container { margin-bottom: 30px;}
        .wallet-calc-container { margin-bottom: 30px;}
        .ra-logo-big {
          width: 160px; height: 160px;
          border-radius: 35px;
          object-fit: contain;
          background: #191b2a;
          box-shadow: 0 0 48px #00b4fa88, 0 0 0 7px #191a2477;
          border: 3px solid #00b4fa44;
          margin: 0 0 22px 0;
          display: block;
        }
        .wallet-title {
          font-size: 1.22rem;
          letter-spacing: 1.2px;
          font-weight: bold;
          margin-bottom: 18px;
          background: linear-gradient(90deg, #fff 8%, #0fffc7 60%, #23e6ff 98%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 2px 18px #22213866, 0 0 8px #00b4fa88, 0 0 18px #00b4fa99;
          filter: brightness(1.14) drop-shadow(0 0 3px #00e6ff99);
          text-transform: uppercase;
          text-align: center;
          width: 100%;
          margin-top: 10px;
        }
        .neon-btn, .neon-btn:focus {
          padding: 10px 22px;
          background: linear-gradient(90deg, #0fffc7, #00c3ff 98%);
          color: #0b1834;
          border: none;
          border-radius: 50px;
          font-size: 1.08rem;
          cursor: pointer;
          font-weight: bold;
          margin-bottom: 13px;
          margin-top: 5px;
          width: 90%;
          max-width: 240px;
          transition: all .18s;
          box-shadow: 0 0 16px #0fffc755, 0 2px 12px #00b4fa33;
          outline: none;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
        .neon-btn.buy {
          background: linear-gradient(90deg, #ffd200, #00ffc6 98%);
          color: #05212d;
          font-size: 1.02rem;
          font-weight: 900;
        }
        .neon-btn:hover, .neon-btn:active {
          background: #222a47;
          color: #0fffc7;
          box-shadow: 0 0 24px #0fffc7, 0 2px 16px #23e6ff55;
          transform: scale(1.045);
        }
        .wallet-address {
          font-size: 0.97rem;
          color: #0fffc7;
          word-break: break-all;
          letter-spacing: 0.5px;
          background: #171e2c;
          border-radius: 7px;
          padding: 6px 10px;
          font-weight: bold;
          box-shadow: 0 2px 16px #00b4fa33;
          border: 1.5px solid #00f7ff44;
          font-family: 'Share Tech Mono', monospace;
          text-align: center;
          width: 99%;
          max-width: 99%;
          align-self: center;
          overflow-x: auto;
          white-space: nowrap;
          margin-bottom: 10px;
        }
        .wallet-info-row {
          display: flex;
          justify-content: space-between;
          width: 100%;
          margin: 11px 0 11px 0;
          font-size: 1.07rem;
          font-weight: bold;
          color: #e7d7b6;
          border-bottom: 1px solid #28354a;
          padding-bottom: 4px;
        }
        .wallet-bnb-line {
          margin-top: 13px;
          font-size: 1.02em;
          color: #0fffc7;
          background: #171e2c;
          padding: 6px 7px;
          border-radius: 6px;
          border: 1.5px solid #00f7ff55;
          box-shadow: 0 0 10px #00f7ff22;
          width: 99%;
          max-width: 99%;
          text-align: center;
          letter-spacing: 1px;
          overflow-x: auto;
          white-space: nowrap;
          font-family: 'Share Tech Mono', monospace;
        }
        .calc-title-shine {
          font-size: 1.13em;
          font-weight: bold;
          text-transform: uppercase;
          background: linear-gradient(90deg, #fff 8%, #0fffc7 60%, #23e6ff 98%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 2px 18px #22213866,0 0 8px #00b4fa88,0 0 18px #00b4fa99;
          filter: brightness(1.17) drop-shadow(0 0 3px #0fffc7bb);
          letter-spacing: 1.12px;
          margin-bottom: 16px;
        }
        .calc-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .calc-row label {
          color: #0fffc7;
          font-size: 1.09em;
          font-weight: 700;
          min-width: 110px;
          text-align: right;
        }
        .calc-input {
          border-radius: 8px;
          border: 2px solid #0fffc799;
          background: #171e2c;
          color: #fff;
          padding: 7px 12px;
          font-size: 1.1em;
          font-family: 'Share Tech Mono', monospace;
          width: 80px;
          outline: none;
          font-weight: 700;
          box-shadow: 0 0 8px #0fffc733;
          text-align: right;
          transition: border .17s;
        }
        .calc-input:focus {
          border: 2.5px solid #0fffc7;
          box-shadow: 0 0 0 2px #0fffc7, 0 0 18px #0fffc766;
        }
        .live-presale-bar {
          margin: 0 auto 0 auto;
          margin-top: 10px;
          background: #101c25;
          border-radius: 15px;
          padding: 18px 8px 14px 8px;
          color: #0fffc7;
          font-weight: 800;
          font-size: 1.11em;
          box-shadow: 0 0 18px #0fffc726, 0 0 0 2px #0fffc733;
          border: 2.2px solid #0fffc7cc;
          min-width: 190px;
          width: 100%;
          max-width: 310px;
          text-align: left;
          font-family: 'Share Tech Mono', monospace;
          line-height: 1.55em;
          letter-spacing: 1.1px;
        }
        @media (max-width: 850px) {
          .wallet-full-row { flex-direction: column; align-items: center; gap: 24px; }
          .wallet-container, .wallet-calc-container { width: 97vw; min-width: unset; max-width: 97vw;}
        }
        @media (max-width: 600px) {
          .wallet-container, .wallet-calc-container { padding: 14px 2vw 14px 2vw; }
          .live-presale-bar { max-width: 99vw; font-size: 1em; }
        }
        `}
      </style>
      <div className="wallet-main-bg">
        <div
          className="wallet-headline"
          style={{
            textAlign: "center",
            marginTop: 18,
            marginBottom: 28,
            fontSize: "1.09em",
            fontWeight: "bold",
            textTransform: "uppercase",
            background: "linear-gradient(90deg,#fff 8%,#0fffc7 60%,#23e6ff 98%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "0 2px 18px #22213866,0 0 8px #0fffc799",
            filter: "brightness(1.12) drop-shadow(0 0 2px #0fffc777)",
            letterSpacing: "1.1px",
            minHeight: "1.5em",
          }}
          dangerouslySetInnerHTML={{ __html: walletHeadline }}
        />
        <div className="wallet-full-row">
          <img
            src="/RA-ATUM-LOGO.png"
            alt="RA Atum Logo"
            className="ra-logo-big"
          />
          <div className="wallet-container">
            <div className="wallet-title">
              <i className="fas fa-wallet"></i> WALLET OVERVIEW
            </div>
            {mounted && (
              <>
                <button className="neon-btn" onClick={open}>
                  {isConnected ? "Connected" : "Connect Wallet"}
                </button>
                <button className="neon-btn buy" onClick={() => window.location.href = "/presale"}>
                  <i className="fa-solid fa-bolt"></i> Buy RA Atum Token
                </button>
                <div className="wallet-address">
                  {isConnected && address
                    ? `Address: ${address.slice(0, 7)}...${address.slice(-4)}`
                    : "Not connected"}
                </div>
              </>
            )}
            <div className="wallet-info-row">
              <span>Token Balance</span>
              <span id="token-balance">
                {tokenBalance === "–" ? "–" : `${tokenBalance} RA Atum`}
              </span>
            </div>
            <div className="wallet-info-row">
              <span>Referral Earnings</span>
              <span id="referral-earnings">{referralEarnings}</span>
            </div>
            {bnbUsd && bnbInr && (
              <div className="wallet-bnb-line">
                1 BNB = ₹{bnbInr.toLocaleString()} / ${bnbUsd.toFixed(2)}
              </div>
            )}
          </div>
          <div className="wallet-calc-container">
            <div className="calc-title-shine">
              CALCULATE <span style={{ color: "#0fffc7" }}>THIS PROFIT</span>
            </div>
            <div className="calc-row">
              <label htmlFor="calc-ra">
                Enter <span style={{ color: "#0fffc7" }}>RA ATUM</span>
              </label>
              <input
                id="calc-ra"
                className="calc-input"
                type="number"
                min="1"
                placeholder="1000"
                value={calcValue === 0 ? "" : calcValue}
                onChange={(e) =>
                  setCalcValue(
                    isNaN(Number(e.target.value)) || Number(e.target.value) < 1
                      ? 1
                      : Number(e.target.value)
                  )
                }
              />
            </div>
            <div className="live-presale-bar">
              <div>
                <span style={{ color: "#0fffc7", fontWeight: 900, fontSize: "1.02em" }}>
                  LIVE PRESALE PRICE:
                </span>
                <br />
                <span style={{ color: "#fff" }}>
                  1 RA ATUM = ₹{Number(livePresalePrice.inr).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  {" | $"}
                  {Number(livePresalePrice.usd).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  {" | BNB "}
                  {livePresalePrice.bnb.toFixed(5)}
                </span>
                <br />
                <span style={{ color: "#0fffc7" }}>
                  {userRa} RA ATUM = ₹{Number(userPresalePrice.inr).toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
                  | ${Number(userPresalePrice.usd).toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
                  | BNB {userPresalePrice.bnb}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Spacer/nav */}
        <div
          style={{
            margin: "0 auto 28px auto",
            textAlign: "center",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <a
            href="https://ra-atum-website.vercel.app/"
            className="calc-footer-link"
            style={{
              color: "#0fffc7",
              marginTop: 20,
              display: "inline-block",
              fontSize: "1.04em",
              borderRadius: 7,
              padding: "10px 32px",
              background: "#141f28cc",
              textDecoration: "none",
              border: "1.7px solid #0fffc788",
              fontWeight: "bold",
              boxShadow: "0 2px 10px #00b4fa22",
            }}
          >
            <i className="fas fa-arrow-left"></i> Back to Home
          </a>
        </div>
      </div>
    </>
  );
}
