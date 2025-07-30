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
  // Live BNB prices
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
        console.error("Error fetching BNB price", err);
      }
    }
    fetchBNBPrice();
    const interval = setInterval(fetchBNBPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  // Wallet states
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

  // Headline typing effect
  const [walletHeadline, setWalletHeadline] = useState("");
  const walletTypingText = "JOIN RA ATUM TO SHAPE THE FUTURE OF BLOCKCHAIN-POWERED KINDNESS.";
  useEffect(() => {
    let wIndex = 0, wTypingForward = true, wBlinkOn = true, stopped = false;
    function typeWalletLine() {
      if (stopped) return;
      let html =
        walletTypingText.substring(0, wIndex) +
        `<span style="color:#00f7ff;font-weight:bold;font-size:1.17em;">${wBlinkOn ? "|" : "&nbsp;"}</span>`;
      setWalletHeadline(html);
      if (wTypingForward) {
        if (wIndex <= walletTypingText.length) {
          wIndex++;
          setTimeout(typeWalletLine, 33);
        } else {
          wTypingForward = false;
          setTimeout(typeWalletLine, 900);
        }
      } else {
        if (wIndex >= 0) {
          wIndex--;
          setTimeout(typeWalletLine, 17);
        } else {
          wTypingForward = true;
          setTimeout(typeWalletLine, 540);
        }
      }
    }
    let blinkInt = setInterval(() => { wBlinkOn = !wBlinkOn; }, 390);
    typeWalletLine();
    return () => { stopped = true; clearInterval(blinkInt); };
  }, []);

  // Calculator
  const [calcValue, setCalcValue] = useState(100);

  // Presale logic (fixed rate)
  const presaleRate = 1000; // 1000 RA ATUM per 0.01 BNB
  const presaleBnbPerRa = 0.01 / presaleRate; // 0.00001 BNB per RA

  // Calculate live price for 1 RA and for the entered amount
  const livePresalePrice = {
    bnb: presaleBnbPerRa,
    inr: bnbInr ? presaleBnbPerRa * bnbInr : 0,
    usd: bnbUsd ? presaleBnbPerRa * bnbUsd : 0,
  };
  const calcCount = !calcValue || isNaN(calcValue) ? 0 : Number(calcValue);
  const livePresaleTotal = {
    bnb: (livePresalePrice.bnb * calcCount),
    inr: (livePresalePrice.inr * calcCount),
    usd: (livePresalePrice.usd * calcCount),
  };

  return (
    <>
      <style>{`
        html, body, #root {
          min-height: 100vh !important;
          height: 100% !important;
          width: 100vw !important;
          margin: 0 !important;
          padding: 0 !important;
          background: none !important;
        }
        body {
          min-height: 100vh !important;
          height: 100% !important;
          width: 100vw !important;
        }
        #root {
          min-height: 100vh !important;
          height: 100% !important;
          width: 100vw !important;
        }
        .wallet-main-bg {
          min-height: 100vh;
          height: 100vh;
          width: 100vw;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: flex-start;
          background: url('/a0946167-a4a3-4346-b14b-0dc9455c795f.png') no-repeat center center fixed;
          background-size: cover;
          background-position: center;
        }
        .wallet-glass {
          background: rgba(10,16,40,0.88);
          border: 2.5px solid #00f7ff55;
          box-shadow: 0 0 26px #00b4fa55, 0 2px 24px #141a33, 0 0 0 1px #21e3fd44;
          border-radius: 22px;
          backdrop-filter: blur(3px);
        }
        .neon-shadow { box-shadow: 0 0 38px #23e6ff44, 0 0 0 7px #16192244; }
        .wallet-headline {
          font-size: 1.22em; text-align: center;
          margin: 42px auto 40px auto;
          background: linear-gradient(90deg,#fff 8%,#00f7ff 60%,#23e6ff 98%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 2px 18px #00b4fa55,0 0 8px #00b4fa88,0 0 18px #00f7ff99;
          filter: brightness(1.23) drop-shadow(0 0 3px #00e6ff99);
          letter-spacing: 1.2px;
          min-height: 1.7em;
          font-family: 'Share Tech Mono', monospace;
        }
        .wallet-full-row {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 48px;
          padding: 0 0 12px 0;
          max-width: 1250px;
          margin: 0 auto 52px auto;
          flex-wrap: nowrap;
        }
        @media (max-width: 1000px) {
          .wallet-full-row { flex-direction: column; align-items: center; gap: 22px;}
          .ra-logo-big { margin: 0 auto 14px auto !important; }
        }
        @media (max-width: 600px) {
          .wallet-container, .wallet-calc-container { max-width: 97vw !important; width: 99vw !important;}
          .wallet-full-row { gap: 6vw !important; }
          .wallet-headline { font-size: 1em !important; }
        }
        @media (max-width: 460px) {
          .wallet-container, .wallet-calc-container { padding: 10px 0vw 10px 0vw !important;}
          .ra-logo-big { width: 54vw !important; height: 54vw !important; min-width:54px !important; min-height:54px !important; max-width:124px !important; max-height:124px !important;}
          .wallet-title { font-size: 1.03rem !important;}
        }
        .live-presale-bar {
          background: linear-gradient(90deg,#00f7ff44 50%, #23e6ff22 100%);
          border: 2px solid #00f7ff;
          border-radius: 12px;
          margin-top: 21px;
          margin-bottom: 7px;
          padding: 13px 16px 9px 16px;
          text-align: center;
          font-size: 1.09em;
          font-weight: bold;
          color: #00f7ff;
          text-shadow: 0 2px 10px #00f7ff88;
          letter-spacing: .7px;
          box-shadow: 0 2px 18px #00f7ff44;
          font-family: 'Share Tech Mono', monospace;
        }
        .live-presale-bar span { color: #fff; font-weight: normal; }
        .live-presale-bar .sub { color:#14e7ef; font-size: 0.93em; font-weight:normal;}
      `}</style>
      <div className="wallet-main-bg">
        <div
          className="wallet-headline"
          dangerouslySetInnerHTML={{ __html: walletHeadline }}
        />
        <div className="wallet-full-row">
          {/* LOGO */}
          <img
            src="/RA-ATUM-LOGO.png"
            alt="RA Atum Logo"
            className="ra-logo-big neon-shadow"
            style={{
              width: 170,
              height: 170,
              maxWidth: "36vw",
              borderRadius: 40,
              objectFit: "contain",
              background: "#131f38",
              border: "3px solid #00f7ff55",
              marginTop: 8,
              marginLeft: 8,
              display: "block",
              transition: "transform .21s",
            }}
          />

          {/* WALLET BOX */}
          <div className="wallet-container wallet-glass"
            style={{
              minWidth: 250,
              width: 320,
              padding: "32px 22px 24px 22px",
              zIndex: 2,
              fontFamily: "'Share Tech Mono', monospace",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}>
            <div
              className="wallet-title"
              style={{
                fontSize: "1.29rem",
                letterSpacing: "1.4px",
                fontWeight: "bold",
                marginBottom: 14,
                background: "linear-gradient(90deg, #fff 8%, #00f7ff 60%, #23e6ff 98%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 2px 18px #00b4fa88",
                filter: "brightness(1.16)",
                textTransform: "uppercase",
                textAlign: "center",
                width: "100%",
                marginTop: 7,
              }}>
              <i className="fas fa-wallet"></i> WALLET OVERVIEW
            </div>
            {mounted && (
              <>
                <button
                  style={{
                    padding: "15px 30px",
                    background: "linear-gradient(90deg, #0fffc7, #00f7ff)",
                    color: "#101c26",
                    border: "none",
                    borderRadius: "50px",
                    fontSize: "1.14rem",
                    cursor: "pointer",
                    marginBottom: 19,
                    fontWeight: "bold",
                    marginTop: 3,
                    boxShadow: "0 0 16px #00f7ff44",
                  }}
                  onClick={open}
                >
                  {isConnected ? "Connected" : "Connect Wallet"}
                </button>
                <button
                  style={{
                    padding: "12px 30px",
                    background: "linear-gradient(90deg, #ffd200, #00ffc6)",
                    color: "#151c20",
                    border: "none",
                    borderRadius: "50px",
                    fontSize: "1.1rem",
                    cursor: "pointer",
                    fontWeight: "bold",
                    marginBottom: "15px",
                    marginTop: "3px",
                    width: "100%",
                    boxShadow: "0 0 12px #ffd20022",
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
                    fontSize: "1.01rem",
                    color: "#00f7ff",
                    background: "#1c253f",
                    borderRadius: 7,
                    padding: "7px 9px",
                    fontWeight: "bold",
                    boxShadow: "0 2px 16px #00b4fa33",
                    border: "1.5px solid #00f7ff33",
                    fontFamily: "'Share Tech Mono', monospace",
                    textAlign: "center",
                    width: "100%",
                    alignSelf: "center",
                    letterSpacing: "0.65px",
                  }}
                >
                  {isConnected && address
                    ? `Address: ${address.slice(0, 7)}...${address.slice(-4)}`
                    : "Not connected"}
                </div>
              </>
            )}
            <div
              className="wallet-info-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                margin: "13px 0",
                fontSize: "1.05rem",
                fontWeight: "bold",
                color: "#e7d7b6",
                borderBottom: "1px solid #222f38",
                paddingBottom: 6,
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
                fontSize: "1.05rem",
                fontWeight: "bold",
                color: "#e7d7b6",
                borderBottom: "1px solid #232f38",
                paddingBottom: 6,
              }}
            >
              <span>Referral Earnings</span>
              <span id="referral-earnings">{referralEarnings}</span>
            </div>
            {bnbUsd && bnbInr && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: "0.99em",
                  color: "#0fffc7",
                  background: "#182630",
                  padding: "7px 11px",
                  borderRadius: "6px",
                  border: "1px solid #00f7ff55",
                  boxShadow: "0 0 10px #00b4fa22",
                  width: "100%",
                  textAlign: "center",
                  letterSpacing: "1.1px",
                  marginBottom: 2,
                }}
              >
                1 BNB = ₹{bnbInr.toLocaleString()} / ${bnbUsd.toFixed(2)}
              </div>
            )}
          </div>

          {/* CALCULATOR */}
          <div
            className="wallet-calc-container wallet-glass"
            style={{
              maxWidth: 410,
              width: "100%",
              color: "#fff",
              textAlign: "center",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: 260,
              padding: "30px 20px 22px 20px",
              margin: 0,
            }}
          >
            <div
              className="calc-title-shine"
              style={{
                fontSize: "1.15em",
                fontWeight: "bold",
                textTransform: "uppercase",
                background: "linear-gradient(90deg, #fff 8%, #00f7ff 60%, #23e6ff 98%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 2px 18px #00b4fa99",
                filter: "brightness(1.15)",
                letterSpacing: "1.14px",
                marginBottom: 17,
                fontFamily: "'Share Tech Mono', monospace",
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
                  color: "#00f7ff",
                  fontSize: "1em",
                  fontWeight: "bold",
                  letterSpacing: ".4px",
                  minWidth: 75,
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
                  border: "1.7px solid #00f7ff77",
                  background: "#202d48",
                  color: "#fff",
                  padding: "9px 15px",
                  fontSize: "1em",
                  fontFamily: "'Share Tech Mono', monospace",
                  width: 120,
                  marginLeft: 8,
                  outline: "none",
                  boxShadow: "0 1px 8px #00f7ff11",
                }}
              />
            </div>
            <div className="live-presale-bar">
              <div>
                <span style={{ color: "#0fffc7" }}>LIVE PRESALE PRICE:</span>
                <br />
                <span>
                  1 RA ATUM = ₹{livePresalePrice.inr ? livePresalePrice.inr.toFixed(4) : "--"}
                  {" | "}
                  ${livePresalePrice.usd ? livePresalePrice.usd.toFixed(4) : "--"}
                  {" | "}
                  BNB {livePresalePrice.bnb.toFixed(5)}
                </span>
              </div>
              <div style={{ fontSize: "0.97em", marginTop: 7 }}>
                {calcCount > 0 ? (
                  <>
                    {calcCount} RA ATUM = ₹{livePresaleTotal.inr ? livePresaleTotal.inr.toFixed(2) : "--"}
                    {" | "}
                    ${livePresaleTotal.usd ? livePresaleTotal.usd.toFixed(2) : "--"}
                    {" | "}
                    BNB {livePresaleTotal.bnb.toFixed(5)}
                  </>
                ) : (
                  "—"
                )}
              </div>
            </div>
            <div className="calc-footer-space" style={{ minHeight: 24 }}></div>
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
              color: "#00f7ff",
              marginTop: 26,
              display: "inline-block",
              fontSize: "1.08em",
              borderRadius: 8,
              padding: "12px 38px",
              background: "#1a2138",
              textDecoration: "none",
              transition: "background 0.14s, color 0.14s",
              fontFamily: "'Share Tech Mono', monospace",
              border: "1.5px solid #00f7ff44",
              fontWeight: "bold",
              boxShadow: "0 2px 14px #00f7ff22",
            }}
          >
            <i className="fas fa-arrow-left"></i> Back to Home
          </a>
        </div>
      </div>
    </>
  );
}
