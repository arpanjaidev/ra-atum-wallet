// src/WalletPage.jsx
import React, { useEffect, useState } from "react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";

// Token setup
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
  // For BNB Price
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

  // Wallet states and logic
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
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

  // Typing Headline effect
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
          setTimeout(typeWalletLine, 37);
        } else {
          wTypingForward = false;
          setTimeout(typeWalletLine, 950);
        }
      } else {
        if (wIndex >= 0) {
          wIndex--;
          setTimeout(typeWalletLine, 18);
        } else {
          wTypingForward = true;
          setTimeout(typeWalletLine, 400);
        }
      }
    }
    let blinkInt = setInterval(() => { wBlinkOn = !wBlinkOn; }, 410);
    typeWalletLine();
    return () => { stopped = true; clearInterval(blinkInt); };
  }, []);

  // --- LIVE PRESALE CALCULATOR ---
  // Each RA = 0.00001 BNB (fixed by contract, live BNB price for INR/USD calc)
  const [calcValue, setCalcValue] = useState(1000); // default 1000
  const presaleBnbPerRa = 0.00001;
  const livePresalePrice = {
    inr: bnbInr ? presaleBnbPerRa * bnbInr : 0,
    usd: bnbUsd ? presaleBnbPerRa * bnbUsd : 0,
    bnb: presaleBnbPerRa
  };
  // User-entered value price
  const userRa = Number(calcValue) > 0 ? Number(calcValue) : 1;
  const userPresalePrice = {
    inr: livePresalePrice.inr * userRa,
    usd: livePresalePrice.usd * userRa,
    bnb: livePresalePrice.bnb * userRa
  };

  return (
    <>
      <style>
        {`
          body, #root, html {
            background: url('https://i.pinimg.com/1200x/52/50/a6/5250a6ebb1739452d85599607b904ced.jpg') center center no-repeat !important;
            background-size: cover !important;
            min-height: 100vh !important;
          }
          .wallet-main-bg {
            min-height: 100vh;
            width: 100vw;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            justify-content: flex-start;
            background: none !important;
          }
          .wallet-full-row {
            display: flex;
            align-items: flex-start;
            justify-content: center;
            gap: 48px;
            max-width: 1200px;
            margin: 0 auto 48px auto;
            flex-wrap: wrap;
            z-index: 2;
          }
          .wallet-container, .wallet-calc-container {
            background: rgba(13,18,35, 0.90);
            border-radius: 18px;
            box-shadow: 0 8px 40px #00f7ff22, 0 0 0 2px #17fff977;
            border: 2.5px solid #0fffc777;
            padding: 36px 24px 22px 24px;
            font-family: 'Share Tech Mono', monospace;
            margin-top: 20px;
            min-width: 320px;
            max-width: 390px;
          }
          .wallet-container {
            align-items: center;
          }
          .ra-logo-big {
            width: 170px;
            height: 170px;
            border-radius: 35px;
            object-fit: contain;
            background: #1e2337;
            box-shadow: 0 0 64px #00f7ff55, 0 0 0 9px #10151b;
            border: 3px solid #00f7ff77;
            margin: 0 0 18px 0;
            display: block;
            transition: transform .22s;
          }
          .wallet-title {
            font-size: 1.33rem;
            letter-spacing: 1.4px;
            font-weight: bold;
            margin-bottom: 16px;
            background: linear-gradient(90deg, #fff 8%, #00f7ff 60%, #23e6ff 98%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 2px 18px #22213866, 0 0 8px #0fffc7aa, 0 0 18px #00f7ff99;
            filter: brightness(1.16) drop-shadow(0 0 3px #00f7ff99);
            text-transform: uppercase;
            text-align: center;
            width: 100%;
            margin-top: 10px;
          }
          .wallet-headline {
            text-align: center;
            margin-top: 38px;
            margin-bottom: 35px;
            font-size: 1.18em;
            font-weight: bold;
            text-transform: uppercase;
            background: linear-gradient(90deg,#fff 8%,#00b4fa 60%,#23e6ff 98%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 2px 18px #22213866,0 0 8px #00b4fa88,0 0 18px #00b4fa99;
            filter: brightness(1.15) drop-shadow(0 0 3px #00e6ff99);
            letter-spacing: 1.1px;
            min-height: 1.7em;
          }
          .wallet-address {
            margin: 8px 0 17px 0;
            font-size: 1.03rem;
            color: #0fffc7;
            background: #191e34;
            border-radius: 8px;
            padding: 7px 11px;
            font-weight: bold;
            box-shadow: 0 2px 18px #00f7ff33;
            border: 1.5px solid #00f7ff44;
            text-align: center;
            width: 100%;
            align-self: center;
            letter-spacing: 0.7px;
          }
          .wallet-info-row {
            display: flex;
            justify-content: space-between;
            width: 100%;
            margin: 13px 0;
            font-size: 1.09rem;
            font-weight: bold;
            color: #e7d7b6;
            border-bottom: 1px solid #222f38;
            padding-bottom: 7px;
          }
          .wallet-glass-btn, .wallet-buy-btn {
            font-family: 'Share Tech Mono', monospace;
            border: none;
            border-radius: 50px;
            padding: 18px 36px;
            margin-bottom: 19px;
            margin-top: 7px;
            width: 95%;
            font-size: 1.15rem;
            font-weight: bold;
            box-shadow: 0 0 38px #00f7ff44, 0 0 0 5px #2225;
            cursor: pointer;
            transition: background 0.17s, color 0.17s, box-shadow 0.17s, transform 0.14s;
            outline: none;
            letter-spacing: 1px;
            display: block;
            margin-left: auto;
            margin-right: auto;
          }
          .wallet-glass-btn {
            background: linear-gradient(90deg, #0fffc7 15%, #00f7ff 100%);
            color: #161a20;
            border: 2px solid #0fffc777;
            text-shadow: 0 1px 4px #fff6;
          }
          .wallet-glass-btn:hover {
            background: #fff;
            color: #00d4c1;
            transform: scale(1.04);
            box-shadow: 0 0 44px #00f7ff66;
          }
          .wallet-buy-btn {
            background: linear-gradient(95deg, #ffd200 5%, #00ffc6 100%);
            color: #161a20;
            border: 2px solid #00ffc688;
            text-shadow: 0 1px 4px #fff9;
            margin-top: 0;
            margin-bottom: 18px;
          }
          .wallet-buy-btn:hover {
            background: #fff;
            color: #09bbab;
            transform: scale(1.04);
            box-shadow: 0 0 44px #00ffc644;
          }
          .live-presale-bar {
            background: rgba(16,36,66, 0.88);
            border: 2px solid #0fffc7cc;
            box-shadow: 0 0 30px #0fffc766, 0 0 0 4px #19345e99;
            border-radius: 15px;
            padding: 19px 12px 13px 12px;
            margin: 21px 0 0 0;
            font-size: 1.09em;
            color: #0fffc7;
            font-family: 'Share Tech Mono', monospace;
            font-weight: bold;
            letter-spacing: 0.8px;
            text-align: center;
          }
          .calc-row label {
            color: #0fffc7;
            font-size: 1.09em;
            font-weight: bold;
            letter-spacing: .4px;
            min-width: 82px;
            text-align: right;
          }
          .calc-input {
            border-radius: 7px;
            border: 1.9px solid #0fffc7bb;
            background: #202d48;
            color: #fff;
            padding: 10px 16px;
            font-size: 1em;
            font-family: 'Share Tech Mono', monospace;
            width: 120px;
            margin-left: 10px;
            outline: none;
            box-shadow: 0 1px 8px #0fffc711;
            transition: border .15s, box-shadow .13s;
          }
          .calc-input:focus {
            border-color: #ffd200;
            box-shadow: 0 0 8px #ffd20066;
          }
          @media (max-width: 950px) {
            .wallet-full-row { flex-direction: column !important; align-items: center !important; gap: 24px !important; }
            .ra-logo-big { margin: 0 auto 14px auto !important; }
          }
          @media (max-width: 650px) {
            .wallet-container, .wallet-calc-container {
              max-width: 97vw !important;
              min-width: unset !important;
              width: 97vw !important;
              padding: 17px 4vw 17px 4vw !important;
            }
            .wallet-full-row { gap: 4vw !important; }
            .wallet-main-bg { padding: 0 !important; }
            .wallet-headline { font-size: 1em !important; }
          }
          @media (max-width: 440px) {
            .wallet-container, .wallet-calc-container { padding: 11px 1vw 11px 1vw !important;}
            .ra-logo-big { width: 60vw !important; height: 60vw !important; min-width:58px !important; min-height:58px !important; max-width:110px !important; max-height:110px !important;}
            .wallet-title { font-size: 1em !important;}
          }
        `}
      </style>
      <div className="wallet-main-bg">
        <div
          className="wallet-headline"
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
                <button
                  className="wallet-glass-btn"
                  onClick={open}
                >
                  <i className="fas fa-plug"></i>{" "}
                  {isConnected ? "Connected" : "Connect Wallet"}
                </button>
                <button
                  className="wallet-buy-btn"
                  onClick={() => window.location.href = "/presale"}
                >
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
              <div
                style={{
                  marginTop: 8,
                  fontSize: "1em",
                  color: "#0fffc7",
                  background: "#181e34",
                  padding: "7px 14px",
                  borderRadius: "7px",
                  border: "1.2px solid #00f7ff44",
                  boxShadow: "0 0 10px #00f7ff22",
                  width: "100%",
                  textAlign: "center",
                  letterSpacing: "1px",
                  marginBottom: "3px"
                }}
              >
                1 BNB = ₹{bnbInr.toLocaleString()} / ${bnbUsd.toFixed(2)}
              </div>
            )}
          </div>
          <div className="wallet-calc-container">
            <div
              className="calc-title-shine"
              style={{
                fontSize: "1.16em",
                fontWeight: "bold",
                textTransform: "uppercase",
                background: "linear-gradient(90deg, #fff 8%, #0fffc7 60%, #23e6ff 98%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 2px 18px #22213866,0 0 8px #00b4fa88,0 0 18px #00b4fa99",
                filter: "brightness(1.17) drop-shadow(0 0 3px #0fffc7bb)",
                letterSpacing: "1.12px",
                marginBottom: 18,
              }}
            >
              CALCULATE <span style={{ color: "#0fffc7" }}>THIS PROFIT</span>
            </div>
            <div className="calc-row" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 10, marginBottom: 14
            }}>
              <label htmlFor="calc-ra">Enter RA ATUM</label>
              <input
                id="calc-ra"
                className="calc-input"
                type="number"
                min="1"
                step="1"
                placeholder="1000"
                value={calcValue}
                onChange={(e) => {
                  const v = e.target.value.replace(/^0+/, "");
                  setCalcValue(v === "" ? 1 : Number(v));
                }}
                onWheel={e => e.target.blur()}
                style={{ fontWeight: "bold" }}
              />
            </div>
            {/* Live Presale Price Bar */}
            <div className="live-presale-bar">
              LIVE PRESALE PRICE:
              <br />
              <span style={{ color: "#fff", fontWeight: 700 }}>
                1 RA ATUM = ₹{livePresalePrice.inr.toFixed(4)} | ${livePresalePrice.usd.toFixed(4)} | BNB {livePresalePrice.bnb.toFixed(5)}
              </span>
              <br />
              <span style={{ color: "#0fffc7", fontWeight: 700, letterSpacing: 1.2 }}>
                {userRa} RA ATUM = ₹{userPresalePrice.inr.toLocaleString(undefined, { maximumFractionDigits: 2 })} | ${userPresalePrice.usd.toLocaleString(undefined, { maximumFractionDigits: 2 })} | BNB {userPresalePrice.bnb.toFixed(5)}
              </span>
            </div>
          </div>
        </div>
        <div
          style={{
            margin: "0 auto 32px auto",
            textAlign: "center",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <a
            href="https://ra-atum-website.vercel.app/"
            style={{
              color: "#0fffc7",
              marginTop: 28,
              display: "inline-block",
              fontSize: "1.07em",
              borderRadius: 7,
              padding: "12px 36px",
              background: "#171e2cbb",
              textDecoration: "none",
              fontFamily: "'Share Tech Mono', monospace",
              border: "1.5px solid #00f7ff44",
              fontWeight: "bold",
              boxShadow: "0 2px 10px #00f7ff22",
            }}
          >
            <i className="fas fa-arrow-left"></i> Back to Home
          </a>
        </div>
      </div>
    </>
  );
}
