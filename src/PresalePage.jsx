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
      {/* --- Mobile-Perfect Responsive Styles --- */}
      <style>{`
  html, body, #root {
    margin: 0 !important;
    padding: 0 !important;
    width: 100vw !important;
    min-height: 100vh !important;
    overflow-x: hidden !important;
    background: transparent !important;
    box-sizing: border-box;
  }
  .presale-bg {
    min-height: 100vh;
    width: 100vw;
    background: radial-gradient(ellipse 120vw 120vh at 55vw 5vh, #091b29 70%, #071626 100%);
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    position: relative;
    box-sizing: border-box;
  }
  .presale-topbar {
    width: 100vw;
    max-width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    margin-bottom: 0;
  }
  .presale-logo {
    width: 130px;
    height: 130px;
    border-radius: 36px;
    background: #181d2f;
    box-shadow: 0 0 30px #00e6ff99, 0 0 0 14px #00183325;
    border: 2.5px solid #00e6ff88;
    z-index: 10;
    padding: 10px;
    margin: 38px auto 10px auto;
    display: block;
    animation: blinklogo 1.15s step-end infinite alternate;
    position: relative;
  }
  .presale-timer-wrap {
    width: 100vw;
    margin: 0;
    padding-top: 0;
    padding-bottom: 8px;
    text-align: center;
    font-family: 'Share Tech Mono', monospace;
  }
  .presale-timer {
    font-size: 2.2em;
    font-weight: 800;
    color: #00e6ff;
    letter-spacing: .6px;
    text-shadow: 0 0 18px #00e6ffcc, 0 2px 14px #fff;
    filter: drop-shadow(0 0 22px #00e6ffcc);
    display: inline-block;
    padding: 10px 44px;
    border-radius: 20px;
    background: rgba(8,32,60,0.60);
    animation: blink 1s steps(1,end) infinite alternate;
    border: 2px solid #00e6ff77;
    margin: 0 auto;
    min-width: 320px;
    box-sizing: border-box;
    max-width: 90vw;
    overflow-x: auto;
  }
  .presale-main-wrap {
    width: 100vw;
    min-height: calc(100vh - 120px);
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    box-sizing: border-box;
  }
  .presale-headline {
    max-width: 1240px;
    width: 99vw;
    margin: 0 auto;
    padding-top: 6px;
    padding-bottom: 12px;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
  }
  .presale-title {
    font-size: 2.35em;
    font-weight: 900;
    margin-bottom: 11px;
    margin-top: 0;
    letter-spacing: 2px;
    text-align: center;
    color: #00e6ff;
    filter: brightness(1.05) drop-shadow(0 0 13px #00e6ff66);
    text-shadow: 0 2px 16px #00e6ff55;
    text-transform: uppercase;
    animation: blink 1.1s step-end infinite alternate;
    letter-spacing: 1.7px;
  }
  .presale-links {
    display: flex;
    gap: 18px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    width: 100%;
  }
  .presale-link {
    background: linear-gradient(90deg, #1a2939 80%, #00e6ff1a 100%);
    color: #00e6ff;
    font-weight: bold;
    padding: 8px 15px;
    border-radius: 12px;
    box-shadow: 0 2px 10px #00e6ff33;
    text-decoration: none;
    font-size: 1.01em;
    border: 1.1px solid #00e6ff55;
    letter-spacing: .15px;
    transition: background .15s;
    white-space: nowrap;
    filter: drop-shadow(0 0 4px #00e6ff66);
    display: flex;
    align-items: center;
    gap: 7px;
    position: relative;
    user-select: all;
    text-shadow: 0 0 7px #00e6ff44;
  }
  .copy-addr {
    cursor: pointer;
  }
  .presale-copied {
    position: absolute;
    top: -29px;
    right: 7px;
    color: #00e6ff;
    background: #031925;
    padding: 3px 12px;
    border-radius: 7px;
    font-weight: 700;
    font-size: 0.94em;
    box-shadow: 0 0 6px #00e6ff66;
    animation: blink 1.2s step-end infinite alternate;
    z-index: 100;
  }
  .presale-infopills {
    display: flex;
    gap: 14px;
    margin-bottom: 19px;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
  }
  .presale-card-section {
    width: 100vw;
    min-height: 62vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 18px;
    box-sizing: border-box;
  }
  .presale-img-anim {
    width: 100%;
    min-height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 14px;
    margin-top: 8px;
    pointer-events: none;
    user-select: none;
    position: relative;
    transition: all .65s cubic-bezier(.45,1.08,.5,1.2);
  }
  .presale-img {
    max-width: 235px;
    border-radius: 18px;
    box-shadow: 0 4px 18px #00e6ff45, 0 0 0 7px #00e6ff0c;
    display: block;
    position: relative;
    z-index: 4;
  }
  .presale-card {
    background: linear-gradient(115deg, #0c182b 86%, #00e6ff11 100%);
    border: 2px solid #00e6ff77;
    border-radius: 18px;
    box-shadow: 0 8px 16px #00e6ff15, 0 0 0 4px #00e6ff22;
    max-width: 440px;
    width: 99vw;
    padding: 27px 22px 16px 22px;
    margin: 0 auto 0 auto;
    margin-top: 0vw;
    margin-bottom: 18px;
    z-index: 1;
    text-align: center;
    color: #e4f8ff;
    position: relative;
    box-sizing: border-box;
  }
  .presale-card-header {
    font-weight: bold;
    font-size: 1.13em;
    color: #00e6ff;
    margin-bottom: 10px;
    text-shadow: 0 2px 12px #00e6ff44;
    letter-spacing: .6px;
    text-transform: uppercase;
    animation: blink 1s steps(1,end) infinite alternate;
  }
  .presale-bnbbal {
    margin: 0 0 13px 0;
    font-size: .97em;
    color: #00e6ff;
    font-family: 'Share Tech Mono', monospace;
  }
  .presale-buy-wrap {
    margin: 0 auto 8px auto;
    padding: 13px 0 0 0;
  }
  .presale-buy-title {
    font-weight: bold;
    color: #00e6ff;
    font-size: .95em;
    margin-bottom: 7px;
    letter-spacing: .03em;
  }
  .presale-buy-minmax {
    font-weight: bold;
    color: #00e6ff;
    font-size: 0.93em;
    margin-bottom: 7px;
  }
  .presale-buy-input-wrap {
    display: flex;
    align-items: center;
    margin-bottom: 11px;
    gap: 6px;
    justify-content: center;
  }
  .presale-input {
    border-radius: 7px;
    border: 1.6px solid #00e6ff80;
    padding: 11px 13px;
    font-weight: bold;
    width: 120px;
    color: #fff;
    background: #17253e;
    font-family: 'Share Tech Mono', monospace;
    font-size: 1.03em;
    margin-right: 5px;
  }
  .presale-input-unit {
    font-weight: 700;
    color: #00e6ff;
  }
  .presale-raamount {
    font-size: .91em;
    margin-bottom: 8px;
    color: #00e6ff;
    font-weight: bold;
    letter-spacing: .5px;
    min-height: 1.1em;
  }
  .presale-btn {
    background: linear-gradient(90deg,#00e6ff 0%,#00b4fa 100%);
    color: #fff;
    font-weight: bold;
    padding: 12px 28px;
    border-radius: 17px;
    border: none;
    font-size: 1.11em;
    cursor: pointer;
    margin-bottom: 8px;
    margin-top: 6px;
    opacity: 1;
    box-shadow: 0 2px 14px #00e6ff11;
    letter-spacing: .6px;
    outline: none;
    transition: .14s;
    text-shadow: 0 0 8px #00e6ff, 0 0 10px #fff;
  }
  .presale-btn:disabled {
    opacity: 0.62;
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
    font-size: 1.01em;
    color: #00e6ff;
    font-weight: bold;
    margin-top: 14px;
    text-shadow: 0 2px 11px #00e6ff25;
    letter-spacing: 1.1px;
  }
  .presale-bottom-link {
    margin: 36px auto 0 auto;
    text-align: center;
    width: 100vw;
    display: flex;
    justify-content: center;
  }
  .calc-footer-link {
    color: #00e6ff;
    margin-top: 17px;
    margin-bottom: 19px;
    display: inline-block;
    font-size: 1.11em;
    border-radius: 10px;
    padding: 12px 38px;
    background: #18273a;
    text-decoration: none;
    font-weight: bold;
    box-shadow: 0 2px 7px #00e6ff12;
    border: 1.5px solid #00e6ff29;
    letter-spacing: .13px;
    transition: background 0.14s, color 0.14s;
    text-shadow: 0 0 8px #00e6ff;
  }

  @media (max-width: 950px) {
    .presale-headline { max-width: 99vw; }
    .presale-card { max-width: 99vw; }
    .presale-links { gap: 10px; }
  }
  @media (max-width: 700px) {
    .presale-logo {
      width: 70px; height: 70px; border-radius: 18px; margin: 22px auto 7px auto; padding: 3px;
    }
    .presale-timer-wrap {
      padding-top: 3px;
    }
    .presale-timer {
      font-size: 1.18em;
      min-width: 60vw;
      max-width: 96vw;
      padding: 7px 2vw;
    }
    .presale-title {
      font-size: 1.16em;
    }
    .presale-main-wrap, .presale-card-section, .presale-card, .presale-headline {
      width: 100vw !important; max-width: 100vw !important; min-width: 100vw !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    .presale-img { max-width: 95vw; }
    .presale-links { width: 100vw; flex-direction: column; gap: 7px; }
    .presale-card { padding: 10px 1vw 10px 1vw; }
  }
  @media (max-width: 480px) {
    .presale-logo { width: 54px; height: 54px; border-radius: 10px; margin-top: 13px; margin-bottom: 3px; }
    .presale-timer { font-size: 0.98em; min-width: 50vw; max-width: 97vw; padding: 5px 2vw; }
    .presale-title { font-size: 1.03em; }
    .presale-headline { padding-bottom: 8px;}
    .presale-main-wrap, .presale-card-section, .presale-card, .presale-headline {
      width: 100vw !important; max-width: 100vw !important; min-width: 100vw !important;
      padding: 0 !important; margin: 0 !important;
    }
    .presale-links { width: 100vw; flex-direction: column; gap: 6px; }
    .presale-img { max-width: 96vw; }
    .presale-card { padding: 8px 0vw 10px 0vw; }
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
      {/* --- Logo + Timer --- */}
      <div className="presale-topbar">
        <img
          src="/RA-ATUM-LOGO.png"
          alt="RA Atum Logo"
          className="presale-logo"
        />
        <div className="presale-timer-wrap">
          <div className="presale-timer">
            LIVE • {timerStr}
          </div>
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
