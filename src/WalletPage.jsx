import React, { useEffect, useState } from "react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";

const tokenAddress = "0xcE06aDbB070c2f0d90Ba109E77c0c2Ff83F9Ff3A";
const tokenABI = [
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function WalletPage() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();

  // Read contract: decimals
  const { data: decimals, isLoading: decimalsLoading } = useReadContract({
    address: tokenAddress,
    abi: tokenABI,
    functionName: "decimals",
    chainId: 56
  });

  // Read contract: token balance
  const { data: rawBalance, isLoading: balanceLoading } = useReadContract({
    address: tokenAddress,
    abi: tokenABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: 56
  });

  let tokenBalance = "–";
  if (isConnected) {
    if (balanceLoading || decimalsLoading) tokenBalance = "Fetching...";
    else if (rawBalance && decimals !== undefined)
      tokenBalance = parseFloat(formatUnits(rawBalance, decimals)).toLocaleString(undefined, { maximumFractionDigits: 4 });
    else tokenBalance = "0";
  }
  const referralEarnings = isConnected ? "0.00" : "–";

  // Typing headline
  const [walletHeadline, setWalletHeadline] = useState("");
  const walletTypingText = "JOIN RA ATUM TO SHAPE THE FUTURE OF BLOCKCHAIN-POWERED KINDNESS.";
  useEffect(() => {
    let wIndex = 0, wTypingForward = true, wBlinkOn = true, stopped = false;
    function typeWalletLine() {
      if (stopped) return;
      let html = walletTypingText.substring(0, wIndex) + `<span style="color:#00b4fa;font-weight:bold;font-size:1.2em;">${wBlinkOn ? "|" : "&nbsp;"}</span>`;
      setWalletHeadline(html);
      if (wTypingForward) {
        if (wIndex <= walletTypingText.length) { wIndex++; setTimeout(typeWalletLine, 27); }
        else { wTypingForward = false; setTimeout(typeWalletLine, 1400); }
      } else {
        if (wIndex >= 0) { wIndex--; setTimeout(typeWalletLine, 14); }
        else { wTypingForward = true; setTimeout(typeWalletLine, 800); }
      }
    }
    let blinkInt = setInterval(() => { wBlinkOn = !wBlinkOn; }, 410);
    typeWalletLine();
    return () => { stopped = true; clearInterval(blinkInt); };
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

  // Responsive, no white border, full screen
  return (
    <div
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        width: "100vw",
        background: "#0e1018",
        color: "#fff",
        fontFamily: "'Share Tech Mono', monospace",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      {/* Headline */}
      <div
        className="wallet-headline"
        style={{
          textAlign: "center",
          marginTop: "3vw",
          marginBottom: "2vw",
          fontSize: "min(2.5vw, 2.1em)",
          fontWeight: "bold",
          textTransform: "uppercase",
          background: "linear-gradient(90deg,#fff 8%,#00b4fa 60%,#23e6ff 98%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          textShadow: "0 2px 18px #22213866,0 0 8px #00b4fa88,0 0 18px #00b4fa99",
          filter: "brightness(1.18) drop-shadow(0 0 7px #00e6ff99)",
          letterSpacing: "1.2px",
          minHeight: "1.9em",
          width: "100vw",
          overflow: "hidden",
          userSelect: "none",
        }}
        dangerouslySetInnerHTML={{ __html: walletHeadline }}
      />

      {/* Wallet Section Grid */}
      <div
        className="wallet-full-row"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: "2vw",
          width: "100vw",
          maxWidth: "1200px",
          padding: "2vw 1vw 0 1vw",
          margin: "0 auto 4vw auto",
          flexWrap: "wrap",
        }}
      >
        {/* Logo */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          minWidth: 180, minHeight: 180, width: "21vw", height: "21vw", maxWidth: 210, maxHeight: 210,
          borderRadius: "35px", background: "#15162a", boxShadow: "0 8px 52px #00b4fa50, 0 0 0 7px #191a2455",
          border: "3px solid #00b4fa33", margin: "0 1vw 1vw 0"
        }}>
          <img
            src="/RA-ATUM-LOGO.png"
            alt="RA Atum Logo"
            style={{
              width: "85%", height: "85%",
              objectFit: "contain", borderRadius: "33px",
              background: "transparent"
            }}
          />
        </div>
        {/* Wallet Card */}
        <div
          className="wallet-container"
          style={{
            background: "#181a1b",
            borderRadius: 18,
            boxShadow: "0 8px 32px #00b4fa33",
            width: "min(350px, 80vw)",
            margin: "0 0.5vw",
            padding: "32px 22px 26px 22px",
            border: "2.5px solid #00b4fa",
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: 220,
          }}
        >
          <div
            className="wallet-title"
            style={{
              fontSize: "1.27rem",
              letterSpacing: "1.4px",
              fontWeight: "bold",
              marginBottom: 18,
              background: "linear-gradient(90deg, #fff 8%, #00b4fa 60%, #23e6ff 98%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 2px 18px #22213866, 0 0 8px #00b4fa88, 0 0 18px #00b4fa99",
              filter: "brightness(1.16) drop-shadow(0 0 3px #00e6ff99)",
              textTransform: "uppercase",
              textAlign: "center",
              width: "100%",
            }}
          >
            <i className="fas fa-wallet"></i> WALLET OVERVIEW
          </div>
          {/* Connect Button */}
          <button
            style={{
              padding: "18px 37px",
              background: "linear-gradient(90deg, #0fffc7, #00c3ff)",
              color: "#11131a",
              border: "none",
              borderRadius: "50px",
              fontSize: "1.16rem",
              cursor: "pointer",
              marginBottom: 18,
              fontWeight: "bold",
              boxShadow: "0 2px 14px #00b4fa66",
              width: "100%",
              maxWidth: 240,
              outline: "none",
              letterSpacing: ".6px",
              transition: "background .17s, color .17s, transform .12s"
            }}
            onClick={open}
          >
            {isConnected ? "Connected" : "Connect Wallet"}
          </button>
          {/* Address */}
          <div
            id="wallet-address"
            className="wallet-address"
            style={{
              margin: "8px 0 17px 0",
              fontSize: "1.01rem",
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
              textAlign: "center",
              width: "100%",
              alignSelf: "center",
              marginBottom: 10,
              fontFamily: "inherit"
            }}
          >
            {isConnected && address
              ? `Address: ${address.slice(0, 7)}...${address.slice(-4)}`
              : "Not connected"}
          </div>
          {/* Token Balance */}
          <div className="wallet-info-row" style={{
            display: "flex", justifyContent: "space-between", width: "100%", margin: "13px 0",
            fontSize: "1.08rem", fontWeight: "bold", color: "#e7d7b6", borderBottom: "1px solid #202f38",
            paddingBottom: 5
          }}>
            <span>Token Balance</span>
            <span id="token-balance">
              {tokenBalance === "–" ? "–" : `${tokenBalance} RA Atum`}
            </span>
          </div>
          {/* Referral */}
          <div className="wallet-info-row" style={{
            display: "flex", justifyContent: "space-between", width: "100%", margin: "13px 0",
            fontSize: "1.08rem", fontWeight: "bold", color: "#e7d7b6", borderBottom: "1px solid #202f38",
            paddingBottom: 5
          }}>
            <span>Referral Earnings</span>
            <span id="referral-earnings">{referralEarnings}</span>
          </div>
        </div>
        {/* Calculator */}
        <div
          className="wallet-calc-container"
          style={{
            maxWidth: 400,
            background: "#181a1b",
            borderRadius: 18,
            boxShadow: "0 8px 32px #00b4fa33",
            border: "2.5px solid #00b4fa",
            margin: 0,
            padding: "32px 20px 22px 20px",
            color: "#fff",
            textAlign: "center",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: 220,
            width: "min(350px, 80vw)",
          }}
        >
          <div className="calc-title-shine" style={{
            fontSize: "1.17em",
            fontWeight: "bold",
            textTransform: "uppercase",
            background: "linear-gradient(90deg, #fff 8%, #00b4fa 60%, #23e6ff 98%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "0 2px 18px #22213866,0 0 8px #00b4fa88,0 0 18px #00b4fa99",
            filter: "brightness(1.15) drop-shadow(0 0 3px #00e6ff99)",
            letterSpacing: "1.1px",
            marginBottom: 18
          }}>
            CALCULATE THIS PROFIT
          </div>
          <div className="calc-row" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 20,
            width: "100%"
          }}>
            <label htmlFor="calc-ra" style={{
              color: "#00b4fa",
              fontSize: "1em",
              fontWeight: "bold",
              letterSpacing: ".3px",
              minWidth: 84,
              textAlign: "right"
            }}>
              Enter RA ATUM
            </label>
            <input
              id="calc-ra"
              className="calc-input"
              type="number"
              min="0"
              placeholder="100"
              value={calcValue}
              onChange={e => setCalcValue(Number(e.target.value))}
              style={{
                borderRadius: 6,
                border: "1.5px solid #00b4fa77",
                background: "#222941",
                color: "#fff",
                padding: "8px 14px",
                fontSize: "1em",
                fontFamily: "inherit",
                width: 120,
                marginLeft: 8,
                outline: "none"
              }}
            />
          </div>
          <table className="calc-results-table" style={{
            width: "100%", borderCollapse: "collapse", margin: "14px 0 0 0"
          }}>
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
          <div style={{ fontSize: "0.98em", color: "#bda76a", marginTop: 12, letterSpacing: ".2px" }}>
            Starting: ₹0.55 | $0.01 | BNB 0.00001<br />
            Launch: ₹15 | $0.17 | BNB 0.0003
          </div>
          <div className="calc-footer-space" style={{ minHeight: 38 }}></div>
        </div>
      </div>

      {/* Bottom back to home button */}
      <div className="bottom-back-home" style={{
        margin: "0 auto 32px auto",
        textAlign: "center",
        width: "100vw",
        display: "flex",
        justifyContent: "center"
      }}>
        <a
          href="https://ra-atum-website.vercel.app/"
          className="calc-footer-link"
          style={{
            color: "#00b4fa",
            marginTop: 18,
            display: "inline-block",
            fontSize: "1.11em",
            borderRadius: 7,
            padding: "12px 36px",
            background: "#23243b",
            textDecoration: "none",
            transition: "background 0.14s, color 0.14s",
            fontFamily: "'Share Tech Mono', monospace",
            border: "1.5px solid #00b4fa44",
            fontWeight: "bold",
            boxShadow: "0 2px 10px #00b4fa22"
          }}
        >
          <i className="fas fa-arrow-left"></i> Back to Home
        </a>
      </div>
      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 900px) {
          .wallet-full-row {
            flex-direction: column !important;
            align-items: center !important;
            gap: 24px !important;
          }
        }
        @media (max-width: 540px) {
          .wallet-headline { font-size: 1.13em !important; }
          .wallet-container, .wallet-calc-container { width: 98vw !important; max-width: 340px !important; }
          .wallet-title { font-size: 1em !important; }
          .ra-logo-big { width: 80px !important; height: 80px !important; }
        }
      `}</style>
    </div>
  );
}
