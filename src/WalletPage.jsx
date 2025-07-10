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
  const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);

  // Web3Modal & Wagmi hooks
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();

  // Token balance
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
    let wIndex = 0,
      wTypingForward = true,
      wBlinkOn = true,
      stopped = false;
    function typeWalletLine() {
      if (stopped) return;
      let html =
        walletTypingText.substring(0, wIndex) +
        `<span style="color:#00b4fa;font-weight:bold;font-size:1.15em;">${wBlinkOn ? "|" : "&nbsp;"}</span>`;
      setWalletHeadline(html);
      if (wTypingForward) {
        if (wIndex <= walletTypingText.length) {
          wIndex++;
          setTimeout(typeWalletLine, 37);
        } else {
          wTypingForward = false;
          setTimeout(typeWalletLine, 900);
        }
      } else {
        if (wIndex >= 0) {
          wIndex--;
          setTimeout(typeWalletLine, 18);
        } else {
          wTypingForward = true;
          setTimeout(typeWalletLine, 550);
        }
      }
    }
    let blinkInt = setInterval(() => {
      wBlinkOn = !wBlinkOn;
    }, 410);
    typeWalletLine();
    return () => {
      stopped = true;
      clearInterval(blinkInt);
    };
    // eslint-disable-next-line
  }, []);

  // Calculator states
  const [calcValue, setCalcValue] = useState(100);
  const [startRs, setStartRs] = useState("₹0.00");
  const [startUsd, setStartUsd] = useState("$0.00");
  const [startBnb, setStartBnb] = useState("0.00000");
  const [launchRs, setLaunchRs] = useState("₹0.00");
  const [launchUsd, setLaunchUsd] = useState("$0.00");
  const [launchBnb, setLaunchBnb] = useState("0.00000");

  useEffect(() => {
    const startingPrice = { rs: 0.55, usd: 0.01, bnb: 0.00001 };
    const launchPrice = { rs: 15, usd: 0.17, bnb: 0.0003 };
    setStartRs(`₹${(calcValue * startingPrice.rs).toFixed(2)}`);
    setStartUsd(`$${(calcValue * startingPrice.usd).toFixed(2)}`);
    setStartBnb((calcValue * startingPrice.bnb).toFixed(5));
    setLaunchRs(`₹${(calcValue * launchPrice.rs).toFixed(2)}`);
    setLaunchUsd(`$${(calcValue * launchPrice.usd).toFixed(2)}`);
    setLaunchBnb((calcValue * launchPrice.bnb).toFixed(5));
  }, [calcValue]);

  // --- STYLE for full background and responsiveness
  return (
    <>
      <style>
        {`
          html, body, #root {
            height: 100%;
            margin: 0;
            padding: 0;
            background: #0e1018 !important;
          }
          body {
            min-height: 100vh !important;
          }
          .wallet-main-bg {
            min-height: 100vh;
            background: #0e1018;
            width: 100vw;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            justify-content: flex-start;
          }
          @media (max-width: 950px) {
            .wallet-full-row {
              flex-direction: column !important;
              align-items: center !important;
              gap: 18px !important;
            }
            .ra-logo-big { margin: 0 auto 14px auto !important; }
          }
          @media (max-width: 700px) {
            .wallet-container, .wallet-calc-container {
              max-width: 96vw !important;
              min-width: unset !important;
              width: 98vw !important;
            }
            .wallet-full-row {
              gap: 6vw !important;
            }
          }
          @media (max-width: 480px) {
            .wallet-container, .wallet-calc-container {
              padding: 12px 1vw 12px 1vw !important;
            }
            .ra-logo-big { width: 70vw !important; height: 70vw !important; min-width:60px !important; min-height:60px !important; max-width:150px !important; max-height:150px !important;}
            .wallet-title { font-size: 1.06rem !important;}
          }
        `}
      </style>
      <div className="wallet-main-bg">
        <div
          className="wallet-headline"
          style={{
            textAlign: "center",
            marginTop: 38,
            marginBottom: 35,
            fontSize: "1.18em",
            fontWeight: "bold",
            textTransform: "uppercase",
            background: "linear-gradient(90deg,#fff 8%,#00b4fa 60%,#23e6ff 98%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "0 2px 18px #22213866,0 0 8px #00b4fa88,0 0 18px #00b4fa99",
            filter: "brightness(1.15) drop-shadow(0 0 3px #00e6ff99)",
            letterSpacing: "1.1px",
            minHeight: "1.7em",
          }}
          dangerouslySetInnerHTML={{ __html: walletHeadline }}
        />
        <div
          className="wallet-full-row"
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            gap: 44,
            padding: "16px 0 0 0",
            maxWidth: 1250,
            margin: "0 auto 48px auto",
            flexWrap: "nowrap",
          }}
        >
          <img
            src="/RA-ATUM-LOGO.png"
            alt="RA Atum Logo"
            className="ra-logo-big"
            style={{
              width: 170,
              height: 170,
              maxWidth: "35vw",
              borderRadius: 35,
              objectFit: "contain",
              background: "#191b2a",
              boxShadow: "0 0 48px #00b4fa88, 0 0 0 7px #191a2477",
              border: "3px solid #00b4fa44",
              marginTop: 8,
              marginLeft: 8,
              display: "block",
              transition: "transform .22s",
            }}
          />
          <div
            className="wallet-container"
            style={{
              background: "#181a1b",
              borderRadius: 18,
              boxShadow: "0 8px 32px #00b4fa33",
              width: 320,
              minWidth: 230,
              margin: 0,
              padding: "30px 22px 24px 22px",
              border: "2.5px solid #00b4fa",
              position: "relative",
              zIndex: 2,
              fontFamily: "'Share Tech Mono', monospace",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              className="wallet-title"
              style={{
                fontSize: "1.33rem",
                letterSpacing: "1.4px",
                fontWeight: "bold",
                marginBottom: 16,
                background: "linear-gradient(90deg, #fff 8%, #00b4fa 60%, #23e6ff 98%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 2px 18px #22213866, 0 0 8px #00b4fa88, 0 0 18px #00b4fa99",
                filter: "brightness(1.16) drop-shadow(0 0 3px #00e6ff99)",
                textTransform: "uppercase",
                textAlign: "center",
                width: "100%",
                marginTop: 10
              }}
            >
              <i className="fas fa-wallet"></i> WALLET OVERVIEW
            </div>
            {/* Connect Wallet Button */}
            {mounted && (
            <button
              style={{
                padding: "16px 34px",
                background: "linear-gradient(90deg, #0fffc7, #00c3ff)",
                color: "#11131a",
                border: "none",
                borderRadius: "50px",
                fontSize: "1.2rem",
                cursor: "pointer",
                marginBottom: 20,
                fontWeight: "bold",
                marginTop: 5
              }}
              onClick={open}
            >
              {isConnected ? "Connected" : "Connect Wallet"}
            </button>
            {/* Buy RA Atum Token Button */}
            <button
              style={{
                padding: "13px 30px",
                background: "linear-gradient(90deg, #ffd200, #00ffc6)",
                color: "#11131a",
                border: "none",
                borderRadius: "50px",
                fontSize: "1.14rem",
                cursor: "pointer",
                fontWeight: "bold",
                marginBottom: "16px",
                marginTop: "5px",
                width: "100%"
              }}
              onClick={() => window.location.href = "/presale"}
            >
              <i className="fa-solid fa-bolt"></i> Buy RA Atum Token
            </button>
            <div
              id="wallet-address"
              className="wallet-address"
              style={{
                margin: "8px 0 17px 0",
                fontSize: "0.98rem",
                color: "#00b4fa",
                wordBreak: "break-all",
                letterSpacing: "0.6px",
                minHeight: 20,
                background: "#23243b",
                borderRadius: 7,
                padding: "6px 10px",
                fontWeight: "bold",
                display: "inline-block",
                boxShadow: "0 2px 16px #00b4fa33",
                border: "1.5px solid #00b4fa44",
                fontFamily: "'Share Tech Mono', monospace",
                textAlign: "center",
                width: "100%",
                alignSelf: "center",
              }}
            >
              {isConnected && address
                ? `Address: ${address.slice(0, 7)}...${address.slice(-4)}`
                : "Not connected"}
            </div>
            <div
              className="wallet-info-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                margin: "13px 0",
                fontSize: "1.04rem",
                fontWeight: "bold",
                color: "#e7d7b6",
                borderBottom: "1px solid #202f38",
                paddingBottom: 5,
              }}
            >
              <span>Token Balance</span>
              <span id="token-balance">
                {tokenBalance === "–" ? "–" : `${tokenBalance} RA Atum`}
              </span>
            </div>
            <div
              className="wallet-info-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                margin: "13px 0",
                fontSize: "1.04rem",
                fontWeight: "bold",
                color: "#e7d7b6",
                borderBottom: "1px solid #202f38",
                paddingBottom: 5,
              }}
            >
              <span>Referral Earnings</span>
              <span id="referral-earnings">{referralEarnings}</span>
            </div>
          </div>
          <div
            className="wallet-calc-container"
            style={{
              maxWidth: 400,
              background: "#181a1b",
              borderRadius: 18,
              boxShadow: "0 8px 32px #00b4fa33",
              border: "2.5px solid #00b4fa",
              margin: 0,
              padding: "28px 20px 22px 20px",
              fontFamily: "'Share Tech Mono', monospace",
              color: "#fff",
              textAlign: "center",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: 270,
            }}
          >
            <div
              className="calc-title-shine"
              style={{
                fontSize: "1.13em",
                fontWeight: "bold",
                textTransform: "uppercase",
                background: "linear-gradient(90deg, #fff 8%, #00b4fa 60%, #23e6ff 98%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 2px 18px #22213866,0 0 8px #00b4fa88,0 0 18px #00b4fa99",
                filter: "brightness(1.15) drop-shadow(0 0 3px #00e6ff99)",
                letterSpacing: "1.1px",
                marginBottom: 16,
              }}
            >
              CALCULATE THIS PROFIT
            </div>
            <div
              className="calc-row"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                marginBottom: 18,
              }}
            >
              <label
                htmlFor="calc-ra"
                style={{
                  color: "#00b4fa",
                  fontSize: "1em",
                  fontWeight: "bold",
                  letterSpacing: ".3px",
                  minWidth: 70,
                  textAlign: "right",
                }}
              >
                Enter RA ATUM
              </label>
              <input
  id="calc-ra"
  className="calc-input"
  type="number"
  min="0"
  placeholder="100"
  value={calcValue === 0 ? "" : calcValue.toString().replace(/^0+/, "")}
  onChange={(e) => setCalcValue(Number(e.target.value))}
                style={{
                  borderRadius: 6,
                  border: "1.5px solid #00b4fa77",
                  background: "#222941",
                  color: "#fff",
                  padding: "8px 14px",
                  fontSize: "1em",
                  fontFamily: "'Share Tech Mono', monospace",
                  width: 120,
                  marginLeft: 8,
                  outline: "none",
                }}
              />
            </div>
            <table
              className="calc-results-table"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                margin: "14px 0 0 0",
              }}
            >
              <thead>
                <tr>
                  <th></th>
                  <th>RS</th>
                  <th>USD</th>
                  <th>BNB</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Starting Price</td>
                  <td id="rs-start">{startRs}</td>
                  <td id="usd-start">{startUsd}</td>
                  <td id="bnb-start">{startBnb}</td>
                </tr>
                <tr>
                  <td>Launch Price</td>
                  <td id="rs-launch">{launchRs}</td>
                  <td id="usd-launch">{launchUsd}</td>
                  <td id="bnb-launch">{launchBnb}</td>
                </tr>
              </tbody>
            </table>
            <div
              style={{
                fontSize: "0.98em",
                color: "#bda76a",
                marginTop: 12,
                letterSpacing: ".2px",
              }}
            >
              Starting: ₹0.55 | $0.01 | BNB 0.00001
              <br />
              Launch: ₹15 | $0.17 | BNB 0.0003
            </div>
            <div className="calc-footer-space" style={{ minHeight: 38 }}></div>
          </div>
        </div>
        <div
          className="bottom-back-home"
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
            className="calc-footer-link"
            style={{
              color: "#00b4fa",
              marginTop: 28,
              display: "inline-block",
              fontSize: "1.07em",
              borderRadius: 7,
              padding: "12px 36px",
              background: "#23243b",
              textDecoration: "none",
              transition: "background 0.14s, color 0.14s",
              fontFamily: "'Share Tech Mono', monospace",
              border: "1.5px solid #00b4fa44",
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
