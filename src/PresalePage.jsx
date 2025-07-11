import React, { useState, useRef, useEffect } from "react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useBalance, useSendTransaction } from "wagmi";
import { bsc } from "wagmi/chains";
import { parseEther } from "viem";
import { FaRegCopy } from "react-icons/fa6";

const presaleAddress = "0xEbd8c8E89c64618E699eDb6f339331425d95EE3f";
const tokenAddress = "0xcE06aDbB070c2f0d90Ba109E77c0c2Ff83F9Ff3A";
const bscScanPresale = "https://bscscan.com/address/0xEbd8c8E89c64618E699eDb6f339331425d95EE3f";
const tokenSupply = "21,000,000 (Million) RA ATUM";
const startPrice = { rs: "₹0.55", usd: "$0.01", bnb: "0.00001" };
const launchPrice = { rs: "₹15", usd: "$0.17", bnb: "0.0003" };
const minBNB = 0.01;
const maxBNB = 2;
const rate = 50000;

function copyToClipboard(text, setCopied) {
  navigator.clipboard.writeText(text).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1100);
  });
}

export default function PresalePage() {
  const { open } = useWeb3Modal();
  const { address, isConnected, chainId } = useAccount();
  const { data: bnbBal } = useBalance({ address, chainId: bsc.id });
  const [bnb, setBnb] = useState("");
  const [copied, setCopied] = useState(false);

  // Timer logic
  const presaleStart = 1750178782 * 1000;
  const presaleEnd = 1765730782 * 1000;
  const now = Date.now();
  const live = now > presaleStart && now < presaleEnd;
  const time =
    now < presaleStart
      ? presaleStart - now
      : now < presaleEnd
      ? presaleEnd - now
      : 0;
  function formatTimer(ms) {
    if (ms <= 0) return "Ended";
    let sec = Math.floor(ms / 1000);
    let d = Math.floor(sec / (3600 * 24));
    let h = Math.floor((sec % (3600 * 24)) / 3600);
    let m = Math.floor((sec % 3600) / 60);
    let s = sec % 60;
    return `${d}d ${h}h ${m}m ${s}s left`;
  }

  // Timer state
  const [timerStr, setTimerStr] = useState(formatTimer(time));
  useEffect(() => {
    const id = setInterval(() => {
      const ms = (() => {
        const now2 = Date.now();
        return now2 < presaleStart
          ? presaleStart - now2
          : now2 < presaleEnd
          ? presaleEnd - now2
          : 0;
      })();
      setTimerStr(formatTimer(ms));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Animated Image (slide-in right on scroll down)
  const imageRef = useRef(null);
  const [imgVisible, setImgVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      if (!imageRef.current) return;
      const rect = imageRef.current.getBoundingClientRect();
      const visible = rect.top < window.innerHeight - 70 && rect.bottom > 80;
      setImgVisible(visible);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Calculate RA amount
  const raAtumGet = bnb && parseFloat(bnb) > 0 ? (bnb * rate).toLocaleString() : "";

  // -- Transaction logic with wagmi
  const {
    data: txData,
    sendTransaction,
    isLoading: isTxLoading,
    isSuccess: isTxSuccess,
    error: txError,
  } = useSendTransaction();

  // Helper for error and confirm messages
  const [buyError, setBuyError] = useState("");
  const [buySuccess, setBuySuccess] = useState("");

  // Clean up errors on input change
  useEffect(() => {
    setBuyError("");
    setBuySuccess("");
  }, [bnb]);

  // Real Buy
  async function handleBuy() {
    setBuyError("");
    setBuySuccess("");
    if (!isConnected) {
      open();
      return;
    }
    if (chainId !== bsc.id) {
      setBuyError("Please switch your wallet to BSC Mainnet.");
      return;
    }
    let bnbNum = Number(bnb);
    if (isNaN(bnbNum) || bnbNum < minBNB) {
      setBuyError(`Min buy is ${minBNB} BNB`);
      return;
    }
    if (bnbNum > maxBNB) {
      setBuyError(`Max buy per wallet is ${maxBNB} BNB`);
      return;
    }
    try {
      await sendTransaction({
        to: presaleAddress,
        value: parseEther(bnb),
      });
    } catch (e) {
      setBuyError("Transaction failed or was rejected.");
    }
  }

  useEffect(() => {
    if (isTxSuccess) {
      setBuySuccess("Success! BNB sent. You will receive RA ATUM soon.");
    }
  }, [isTxSuccess]);

  return (
    <div className="presale-bg">
      {/* --- Blinking LOGO --- */}
      <img
        src="/RA-ATUM-LOGO.png"
        alt="RA Atum Logo"
        className="presale-logo"
      />
      {/* --- LIVE Timer Top --- */}
      <div className="presale-timer-wrap">
        <div className="presale-timer">
          LIVE • {timerStr}
        </div>
      </div>
      {/* --- Main Content --- */}
      <div className="presale-main-wrap">
        {/* --- HEADLINE SECTION --- */}
        <div className="presale-headline">
          <div className="presale-title">RA ATUM TOKEN PRE-SALE</div>
          <div className="presale-links">
            <a
              href={bscScanPresale}
              target="_blank"
              rel="noopener noreferrer"
              className="presale-link"
              title="View Presale Contract on BscScan"
            >
              <i className="fa-solid fa-link"></i> View Presale on BscScan
            </a>
            <span
              className="presale-link copy-addr"
              onClick={() => copyToClipboard(tokenAddress, setCopied)}
              title="Copy Token Address"
            >
              Token:&nbsp;
              <span>{tokenAddress.slice(0, 8)}...{tokenAddress.slice(-5)}</span>
              <FaRegCopy style={{ fontSize: 18, opacity: 0.9 }} />
              {copied && (
                <span className="presale-copied">Copied!</span>
              )}
            </span>
            <span className="presale-link">{tokenSupply}</span>
          </div>
          <div className="presale-infopills">
            <InfoPill label="Starting" value={`${startPrice.rs} | ${startPrice.usd} | BNB ${startPrice.bnb}`} color="#00e6ff" />
            <InfoPill label="Launch" value={`${launchPrice.rs} | ${launchPrice.usd} | BNB ${launchPrice.bnb}`} color="#00e6ff" />
          </div>
        </div>

        {/* --- MAIN PRESALE CARD SECTION --- */}
        <div className="presale-card-section">
          {/* Animated Presale Image */}
          <div
            ref={imageRef}
            className="presale-img-anim"
            style={{
              right: imgVisible ? 0 : "-80px",
              opacity: imgVisible ? 1 : 0,
            }}
          >
            <img
              src="https://i.pinimg.com/736x/3c/1d/68/3c1d682a818eef7b2e508a2e591ac649.jpg"
              alt="Presale"
              className="presale-img"
            />
          </div>
          {/* Main neon card */}
          <div className="presale-card">
            <div className="presale-card-header">
              {live ? (
                <span>
                  <span style={{ color: "#00e6ff", fontWeight: 900 }}>LIVE</span>
                  <span style={{ color: "#00e6ff" }}> • {timerStr}</span>
                </span>
              ) : now < presaleStart ? (
                <span style={{ color: "#00e6ff" }}>Starts in: {timerStr}</span>
              ) : (
                <span style={{ color: "#d72a2a" }}>Presale Ended</span>
              )}
            </div>
            <div className="presale-bnbbal">
              {isConnected ? (
                <span>
                  <b>Your BNB Balance:</b>{" "}
                  {bnbBal ? Number(bnbBal.formatted).toFixed(5) : "0.00000"}
                </span>
              ) : (
                <span style={{ color: "#00e6ff" }}>Please connect wallet to buy!</span>
              )}
            </div>
            <div className="presale-buy-wrap">
              <div className="presale-buy-title">Buy RA ATUM (Presale)</div>
              <div className="presale-buy-minmax">Min: 0.01 BNB | Max: 2 BNB per wallet</div>
              <div className="presale-buy-input-wrap">
                <input
                  type="number"
                  placeholder="Enter BNB"
                  min={minBNB}
                  max={maxBNB}
                  step="0.01"
                  value={bnb}
                  onChange={e => {
                    let val = e.target.value;
                    if (Number(val) > maxBNB) val = maxBNB.toString();
                    setBnb(val);
                  }}
                  disabled={!isConnected}
                  className="presale-input"
                />
                <span className="presale-input-unit">BNB</span>
              </div>
              <div className="presale-raamount">
                {raAtumGet && isConnected ? (
                  <span>≈ <span style={{ color: "#00e6ff" }}>{raAtumGet}</span> RA ATUM</span>
                ) : ("")}
              </div>
              <button
                className="presale-btn"
                disabled={
                  !isConnected ||
                  isTxLoading ||
                  Number(bnb) < minBNB ||
                  Number(bnb) > maxBNB
                }
                onClick={handleBuy}
              >
                {isTxLoading
                  ? "Processing..."
                  : isConnected
                  ? "Buy Now"
                  : "Connect Wallet"}
              </button>
              {buyError && (
                <div className="presale-error">{buyError}</div>
              )}
              {buySuccess && (
                <div className="presale-success">{buySuccess}</div>
              )}
              {isTxSuccess && txData && (
                <div style={{ marginTop: 8 }}>
                  <a
                    href={`https://bscscan.com/tx/${txData.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#00e6ff", fontWeight: "bold" }}
                  >
                    View Transaction on BscScan
                  </a>
                </div>
              )}
            </div>
          </div>
          <div className="presale-supply-row">
            21,000,000 Token Supply &nbsp;|&nbsp; Digital Launch &nbsp;|&nbsp; 100% Transparent
          </div>
        </div>
      </div>
      {/* OUTSIDE: Back to Home */}
      <div className="presale-bottom-link">
        <a
          href="/"
          className="calc-footer-link"
        >
          <i className="fas fa-arrow-left"></i> Back to Home
        </a>
      </div>
      {/* --- Mobile-Perfect Responsive Styles --- */}
      <style>{`
        html, body, #root {
          margin: 0 !important;
          padding: 0 !important;
          width: 100vw !important;
          min-height: 100vh !important;
          overflow-x: hidden !important;
          background: transparent !important;
        }
        .presale-bg {
          min-height: 100vh;
          min-width: 100vw;
          background: radial-gradient(ellipse 120vw 120vh at 55vw 5vh, #091b29 70%, #071626 100%);
          padding: 0;
          margin: 0;
          overflow-x: hidden;
          box-sizing: border-box;
          position: relative;
        }
        .presale-logo {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 110px;
          height: 110px;
          border-radius: 33px;
          background: #181d2f;
          box-shadow: 0 0 30px #00e6ff99, 0 0 0 14px #00183325;
          border: 2.5px solid #00e6ff88;
          z-index: 20;
          padding: 10px;
          animation: blinklogo 1.15s step-end infinite alternate;
        }
        .presale-timer-wrap {
          width: 100vw;
          margin: 0;
          padding-top: 150px;
          text-align: center;
          font-family: 'Share Tech Mono', monospace;
        }
        .presale-timer {
          font-size: 1.55em;
          font-weight: 800;
          color: #00e6ff;
          letter-spacing: .6px;
          text-shadow: 0 0 18px #00e6ffcc, 0 2px 14px #fff;
          filter: drop-shadow(0 0 22px #00e6ffcc);
          display: inline-block;
          padding: 8px 16px;
          border-radius: 13px;
          background: rgba(8,32,60,0.60);
          animation: blink 1s steps(1,end) infinite alternate;
          border: 2px solid #00e6ff77;
          margin: 0 auto;
          min-width: 180px;
        }
        .presale-main-wrap {
          width: 100vw;
          min-height: calc(100vh - 120px);
          margin: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
        }
        .presale-headline {
          max-width: 99vw;
          width: 99vw;
          margin: 0 auto;
          padding-top: 8px;
          padding-bottom: 7px;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .presale-title {
          font-size: 1.35em;
          font-weight: 900;
          margin-bottom: 7px;
          margin-top: 0;
          letter-spacing: 1.3px;
          text-align: center;
          color: #00e6ff;
          filter: brightness(1.05) drop-shadow(0 0 13px #00e6ff66);
          text-shadow: 0 2px 16px #00e6ff55;
          text-transform: uppercase;
          animation: blink 1.1s step-end infinite alternate;
        }
        .presale-links {
          display: flex;
          gap: 6px;
          margin-bottom: 11px;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          width: 99vw;
        }
        .presale-link {
          background: linear-gradient(90deg, #1a2939 80%, #00e6ff1a 100%);
          color: #00e6ff;
          font-weight: bold;
          padding: 7px 10px;
          border-radius: 8px;
          box-shadow: 0 2px 7px #00e6ff12;
          text-decoration: none;
          font-size: .99em;
          border: 1px solid #00e6ff40;
          letter-spacing: .13px;
          transition: background .15s;
          white-space: nowrap;
          filter: drop-shadow(0 0 4px #00e6ff66);
          display: flex;
          align-items: center;
          gap: 6px;
          position: relative;
          user-select: all;
        }
        .copy-addr {
          cursor: pointer;
        }
        .presale-copied {
          position: absolute;
          top: -27px;
          right: 5px;
          color: #00e6ff;
          background: #031925;
          padding: 2px 8px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.89em;
          box-shadow: 0 0 6px #00e6ff66;
          animation: blink 1.2s step-end infinite alternate;
          z-index: 100;
        }
        .presale-infopills {
          display: flex;
          gap: 7px;
          margin-bottom: 10px;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
        }
        .presale-card-section {
          width: 99vw;
          min-height: 42vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-bottom: 14px;
        }
        .presale-img-anim {
          width: 100%;
          min-height: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 11px;
          margin-top: 7px;
          pointer-events: none;
          user-select: none;
          position: relative;
          transition: all .65s cubic-bezier(.45,1.08,.5,1.2);
        }
        .presale-img {
          max-width: 170px;
          border-radius: 15px;
          box-shadow: 0 4px 13px #00e6ff45, 0 0 0 5px #00e6ff0c;
          display: block;
        }
        .presale-card {
          background: linear-gradient(115deg, #0c182b 86%, #00e6ff11 100%);
          border: 2px solid #00e6ff77;
          border-radius: 13px;
          box-shadow: 0 8px 16px #00e6ff15, 0 0 0 2px #00e6ff22;
          max-width: 99vw;
          width: 95vw;
          padding: 19px 7px 13px 7px;
          margin: 0 auto 0 auto;
          margin-bottom: 12px;
          z-index: 1;
          text-align: center;
          color: #e4f8ff;
          position: relative;
        }
        .presale-card-header {
          font-weight: bold;
          font-size: 1.07em;
          color: #00e6ff;
          margin-bottom: 8px;
          text-shadow: 0 2px 9px #00e6ff44;
          letter-spacing: .6px;
          text-transform: uppercase;
          animation: blink 1s steps(1,end) infinite alternate;
        }
        .presale-bnbbal {
          margin: 0 0 9px 0;
          font-size: .95em;
          color: #00e6ff;
          font-family: 'Share Tech Mono', monospace;
        }
        .presale-buy-wrap {
          margin: 0 auto 5px auto;
          padding: 10px 0 0 0;
        }
        .presale-buy-title {
          font-weight: bold;
          color: #00e6ff;
          font-size: .98em;
          margin-bottom: 5px;
          letter-spacing: .03em;
        }
        .presale-buy-minmax {
          font-weight: bold;
          color: #00e6ff;
          font-size: 0.92em;
          margin-bottom: 6px;
        }
        .presale-buy-input-wrap {
          display: flex;
          align-items: center;
          margin-bottom: 7px;
          gap: 4px;
          justify-content: center;
        }
        .presale-input {
          border-radius: 6px;
          border: 1.5px solid #00e6ff80;
          padding: 9px 10px;
          font-weight: bold;
          width: 90px;
          color: #fff;
          background: #17253e;
          font-family: 'Share Tech Mono', monospace;
          font-size: 1em;
          margin-right: 3px;
        }
        .presale-input-unit {
          font-weight: 700;
          color: #00e6ff;
          font-size: 1em;
        }
        .presale-raamount {
          font-size: .91em;
          margin-bottom: 6px;
          color: #00e6ff;
          font-weight: bold;
          letter-spacing: .5px;
          min-height: 1.1em;
        }
        .presale-btn {
          background: linear-gradient(90deg,#00e6ff 0%,#00b4fa 100%);
          color: #fff;
          font-weight: bold;
          padding: 10px 14px;
          border-radius: 13px;
          border: none;
          font-size: 1.04em;
          cursor: pointer;
          margin-bottom: 8px;
          margin-top: 4px;
          opacity: 1;
          box-shadow: 0 2px 9px #00e6ff11;
          letter-spacing: .6px;
          outline: none;
          transition: .14s;
          width: 95vw;
          max-width: 320px;
          text-shadow: 0 0 7px #00e6ff, 0 0 10px #fff;
        }
        .presale-btn:disabled {
          opacity: 0.57;
          cursor: not-allowed;
        }
        .presale-error {
          color: #d72a2a;
          margin-top: 6px;
          font-weight: bold;
        }
        .presale-success {
          color: #00e6ff;
          margin-top: 6px;
          font-weight: bold;
        }
        .presale-supply-row {
          font-size: .98em;
          color: #00e6ff;
          font-weight: bold;
          margin-top: 12px;
          text-shadow: 0 2px 7px #00e6ff25;
          letter-spacing: 1.1px;
        }
        .presale-bottom-link {
          margin: 20px auto 0 auto;
          text-align: center;
          width: 100vw;
          display: flex;
          justify-content: center;
        }
        .calc-footer-link {
          color: #00e6ff;
          margin-top: 14px;
          margin-bottom: 11px;
          display: inline-block;
          font-size: 1em;
          border-radius: 8px;
          padding: 10px 20px;
          background: #18273a;
          text-decoration: none;
          font-weight: bold;
          box-shadow: 0 2px 5px #00e6ff12;
          border: 1.5px solid #00e6ff29;
          letter-spacing: .13px;
          transition: background 0.14s, color 0.14s;
          text-shadow: 0 0 8px #00e6ff;
        }

        @media (max-width: 700px) {
          .presale-logo { width: 90px; height: 90px; padding: 5px; border-radius: 22px;}
          .presale-timer-wrap { padding-top: 110px; }
          .presale-title { font-size: 1em; }
          .presale-timer { font-size: 1.12em; min-width:120px; padding:7px 9px; }
        }
        @media (max-width: 480px) {
          .presale-bg, .presale-main-wrap, .presale-headline, .presale-card, .presale-card-section {
            width: 100vw !important; max-width: 100vw !important; min-width: 100vw !important;
          }
          .presale-links { width: 100vw; }
          .presale-img { max-width: 95vw; }
          .presale-card { padding: 12px 3vw 11px 3vw; }
          .presale-title { font-size: 0.89em; }
          .presale-timer { font-size: 0.94em; padding: 7px 7px;}
          .presale-logo { top: 16px; width: 65px; height: 65px; border-radius: 17px;}
        }

        @keyframes blink {
          0% { filter: brightness(1.14) drop-shadow(0 0 7px #00e6ff77); }
          100% { filter: brightness(1.29) drop-shadow(0 0 21px #00e6ffcc); }
        }
        @keyframes blinklogo {
          0% { filter: brightness(1.07) drop-shadow(0 0 19px #00e6ffcc);}
          100% { filter: brightness(1.37) drop-shadow(0 0 37px #00e6ff);}
        }
      `}</style>
    </div>
  );
}

// Info pill helper
function InfoPill({ label, value, color }) {
  return (
    <span
      style={{
        background: "linear-gradient(90deg, #1a2939 80%, #00e6ff1a 100%)",
        color: color || "#00e6ff",
        fontWeight: "bold",
        padding: "7px 15px",
        borderRadius: 11,
        border: "1.1px solid #00e6ff44",
        fontSize: "1em",
        boxShadow: "0 2px 7px #00e6ff15",
        marginRight: 0,
        marginLeft: 0,
        letterSpacing: ".3px",
        whiteSpace: "nowrap",
        display: "inline-block",
        textShadow: "0 2px 9px #00e6ff55",
      }}
    >
      <span style={{ color: "#00e6ff", fontWeight: "600" }}>{label}:</span>{" "}
      <span style={{ color }}>{value}</span>
    </span>
  );
}
