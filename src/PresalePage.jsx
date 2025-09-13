import React, { useState, useRef, useEffect } from "react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import {
  useAccount,
  useBalance,
  useWriteContract,
  useSwitchChain,
} from "wagmi";
import { bsc } from "wagmi/chains";
import { parseEther } from "viem";
import { FaRegCopy } from "react-icons/fa6";

const presaleAddress = "0x0424d65Ef97A6cCd269c39c2b8A3c1c31cBb7416";
const tokenAddress   = "0xcE06aDbB070c2f0d90Ba109E77c0c2Ff83F9Ff3A";
const bscScanPresale = "https://bscscan.com/address/0x0424d65Ef97A6cCd269c39c2b8A3c1c31cBb7416";
const tokenSupply    = "21,000,000 (Million) RA ATUM";

const minBNB = 0.01;
const maxBNB = 2;
const rate   = 100000; // tokens per BNB

const presaleStart = 1750178782 * 1000;
const presaleEnd   = 1765730782 * 1000;

// Prices for info pills
const startRs  = 0.55;
const startUsd = 0.01;
const launchRs = 15;
const launchUsd= 0.17;

// ✅ Presale ABI: payable buy() (change if your function differs)
const presaleABI = [
  { inputs: [], name: "buy", outputs: [], stateMutability: "payable", type: "function" }
];

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

  // 🔄 chain switch hook
  const { switchChain, isPending: switching } = useSwitchChain();

  // Tx writer (contract call)
  const {
    data: txData,              // hash (string) in most wagmi versions
    writeContract,
    isPending: isTxLoading,
    isSuccess: isTxSuccess,
    error: txError,
  } = useWriteContract();

  // Buy input & UI states
  const [bnb, setBnb] = useState("");
  const [copied, setCopied] = useState(false);

  // Live BNB price
  const [bnbUsd, setBnbUsd] = useState(null);
  const [bnbInr, setBnbInr] = useState(null);

  useEffect(() => {
    async function fetchBNBPrice() {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd,inr"
        );
        const data = await res.json();
        setBnbUsd(data?.binancecoin?.usd);
        setBnbInr(data?.binancecoin?.inr);
      } catch {}
    }
    fetchBNBPrice();
    const interval = setInterval(fetchBNBPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  // Timer logic
  const now = Date.now();
  const live = now > presaleStart && now < presaleEnd;
  const time =
    now < presaleStart ? presaleStart - now :
    now < presaleEnd   ? presaleEnd - now   : 0;

  function formatTimer(ms) {
    if (ms <= 0) return "Ended";
    let sec = Math.floor(ms / 1000);
    let d = Math.floor(sec / (3600 * 24));
    let h = Math.floor((sec % (3600 * 24)) / 3600);
    let m = Math.floor((sec % 3600) / 60);
    let s = sec % 60;
    return `${d}d ${h}h ${m}m ${s}s left`;
  }

  const [timerStr, setTimerStr] = useState(formatTimer(time));
  useEffect(() => {
    const id = setInterval(() => {
      const now2 = Date.now();
      const ms =
        now2 < presaleStart ? presaleStart - now2 :
        now2 < presaleEnd   ? presaleEnd - now2   : 0;
      setTimerStr(formatTimer(ms));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Animated image
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

  // Tokens preview
  const raAtumGet = bnb && parseFloat(bnb) > 0 ? (bnb * rate).toLocaleString() : "";

  const [buyError, setBuyError] = useState("");
  const [buySuccess, setBuySuccess] = useState("");

  // Gift modal
  const [showGift, setShowGift] = useState(false);
  const [pendingBuy, setPendingBuy] = useState(false);

  useEffect(() => {
    setBuyError("");
    setBuySuccess("");
  }, [bnb]);

  // 🔧 force BSC switch / add
  async function forceBsc() {
    try {
      await switchChain({ chainId: bsc.id });
    } catch (e) {
      try {
        await window?.ethereum?.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0x38",
            chainName: "BNB Smart Chain",
            rpcUrls: ["https://bsc-dataseed.binance.org/"],
            nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
            blockExplorerUrls: ["https://bscscan.com"]
          }]
        });
      } catch {}
    }
  }

  // 🤖 auto-switch after connect if wrong chain
  useEffect(() => {
    if (isConnected && chainId && chainId !== bsc.id) {
      forceBsc();
    }
  }, [isConnected, chainId]);

  // Buy flow (runs after closing gift modal)
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
      await writeContract({
        address: presaleAddress,
        abi: presaleABI,
        functionName: "buy",
        value: parseEther(bnb),
      });
      // Success will set via isTxSuccess effect below
    } catch (e) {
      setBuyError("Transaction failed or was rejected.");
    }
  }

  useEffect(() => {
    if (isTxSuccess) {
      setBuySuccess("Success! BNB sent. You will receive RA ATUM soon.");
    }
  }, [isTxSuccess]);

  // Extract tx hash for link (wagmi versions differ)
  const txHash = typeof txData === "string" ? txData : txData?.hash;

  return (
    <div
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        width: "100vw",
        height: "100vh",
        background: "radial-gradient(ellipse 120vw 120vh at 55vw 5vh, #091b29 70%, #071626 100%)",
        padding: 0,
        margin: 0,
        overflow: "auto",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1,
        boxSizing: "border-box",
      }}
    >
      {/* --- Blinking LOGO --- */}
      <img
        src="/RA-ATUM-LOGO.png"
        alt="RA Atum Logo"
        className="ra-logo-mobile-fix"
        style={{
          position: "absolute",
          top: 34,
          left: 44,
          width: 130,
          height: 130,
          borderRadius: 36,
          background: "#181d2f",
          boxShadow: "0 0 30px #00e6ff99, 0 0 0 14px #00183325",
          border: "2.5px solid #00e6ff88",
          zIndex: 20,
          padding: 10,
          animation: "blinklogo 1.15s step-end infinite alternate",
        }}
      />
      {/* --- LIVE Timer Top --- */}
      <div
        className="ra-livebar-mobile-fix"
        style={{
          width: "100vw",
          margin: 0,
          paddingTop: 50,
          paddingBottom: 11,
          textAlign: "center",
          fontFamily: "'Share Tech Mono', monospace",
        }}
      >
        <div
          style={{
            fontSize: "2.4em",
            fontWeight: 800,
            color: "#00e6ff",
            letterSpacing: ".6px",
            textShadow: "0 0 18px #00e6ffcc, 0 2px 14px #fff",
            filter: "drop-shadow(0 0 22px #00e6ffcc)",
            display: "inline-block",
            padding: "10px 44px",
            borderRadius: "20px",
            background: "rgba(8,32,60,0.60)",
            animation: "blink 1s steps(1,end) infinite alternate",
            border: "2px solid #00e6ff77",
            margin: "0 auto",
            minWidth: 350,
          }}
        >
          LIVE • {timerStr}
        </div>
      </div>

      {/* --- Main Content --- */}
      <div
        style={{
          width: "100vw",
          minHeight: "calc(100vh - 120px)",
          margin: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        {/* --- HEADLINE SECTION --- */}
        <div
          style={{
            maxWidth: 1240,
            width: "99vw",
            margin: "0 auto",
            paddingTop: 6,
            paddingBottom: 12,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: "2.35em",
              fontWeight: 900,
              marginBottom: 11,
              marginTop: 0,
              letterSpacing: 2,
              textAlign: "center",
              color: "#00e6ff",
              filter: "brightness(1.05) drop-shadow(0 0 13px #00e6ff66)",
              textShadow: "0 2px 16px #00e6ff55",
              textTransform: "uppercase",
              animation: "blink 1.1s step-end infinite alternate",
              letterSpacing: "1.7px",
            }}
          >
            RA ATUM TOKEN PRE-SALE
          </div>

          <div
            style={{
              display: "flex",
              gap: 18,
              marginBottom: 20,
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            {/* Contract Link */}
            <a
              href={bscScanPresale}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "linear-gradient(90deg, #1a2939 80%, #00e6ff1a 100%)",
                color: "#00e6ff",
                fontWeight: "bold",
                padding: "8px 15px",
                borderRadius: 12,
                boxShadow: "0 2px 10px #00e6ff33",
                textDecoration: "none",
                fontSize: "1.01em",
                border: "1.1px solid #00e6ff55",
                letterSpacing: ".15px",
                transition: "background .15s",
                whiteSpace: "nowrap",
                filter: "drop-shadow(0 0 4px #00e6ff66)",
              }}
              title="View Presale Contract on BscScan"
            >
              <i className="fa-solid fa-link"></i> View Presale on BscScan
            </a>

            {/* Token Address with Copy */}
            <span
              style={{
                background: "linear-gradient(90deg,#1a2939 70%,#00e6ff18 100%)",
                color: "#00e6ff",
                fontWeight: "bold",
                padding: "8px 13px 8px 12px",
                borderRadius: 12,
                border: "1.1px solid #00e6ff44",
                boxShadow: "0 2px 10px #00e6ff12",
                display: "flex",
                alignItems: "center",
                gap: 7,
                cursor: "pointer",
                position: "relative",
                userSelect: "all",
                filter: "drop-shadow(0 0 4px #00e6ff66)",
                textShadow: "0 0 7px #00e6ff44",
              }}
              onClick={() => copyToClipboard(tokenAddress, setCopied)}
              title="Copy Token Address"
            >
              Token:&nbsp;
              <span style={{ color: "#00e6ff", letterSpacing: "1.0px" }}>
                {tokenAddress.slice(0, 8)}...{tokenAddress.slice(-5)}
              </span>
              <FaRegCopy style={{ fontSize: 18, opacity: 0.9 }} />
              {copied && (
                <span
                  style={{
                    position: "absolute",
                    top: -29,
                    right: 7,
                    color: "#00e6ff",
                    background: "#031925",
                    padding: "3px 12px",
                    borderRadius: 7,
                    fontWeight: 700,
                    fontSize: "0.94em",
                    boxShadow: "0 0 6px #00e6ff66",
                    animation: "blink 1.2s step-end infinite alternate",
                    zIndex: 100,
                  }}
                >
                  Copied!
                </span>
              )}
            </span>

            {/* Token Supply */}
            <span
              style={{
                background: "linear-gradient(87deg, #051a25 50%, #00e6ff0c 100%)",
                color: "#00e6ff",
                fontWeight: "bold",
                padding: "8px 13px 8px 13px",
                borderRadius: 12,
                boxShadow: "0 2px 7px #00e6ff17",
                fontSize: "1.04em",
                letterSpacing: "1.3px",
                border: "1.1px solid #00e6ff33",
                display: "inline-block",
                filter: "drop-shadow(0 0 3px #00e6ff77)",
                textShadow: "0 0 6px #00e6ff33",
              }}
            >
              {tokenSupply}
            </span>
          </div>

          {/* --- Presale Price Info Bar --- */}
          <div
            style={{
              display: "flex",
              gap: 14,
              marginBottom: 19,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <InfoPill
              label="Starting"
              value={`₹${startRs} | $${startUsd} | BNB ${
                bnbUsd ? (startUsd / bnbUsd).toFixed(5) : "–"
              }`}
              color="#00e6ff"
            />
            <InfoPill
              label="Launch"
              value={`₹${launchRs} | $${launchUsd} | BNB ${
                bnbUsd ? (launchUsd / bnbUsd).toFixed(5) : "–"
              }`}
              color="#00e6ff"
            />
          </div>
        </div>

        {/* --- MAIN PRESALE CARD SECTION --- */}
        <div
          style={{
            width: "100vw",
            minHeight: "62vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingBottom: 18,
          }}
        >
          {/* Animated Presale Image */}
          <div
            ref={imageRef}
            style={{
              width: "100%",
              minHeight: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
              marginTop: 8,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            <img
              src="https://i.pinimg.com/736x/3c/1d/68/3c1d682a818eef7b2e508a2e591ac649.jpg"
              alt="Presale"
              style={{
                maxWidth: 235,
                borderRadius: 18,
                boxShadow: "0 4px 18px #00e6ff45, 0 0 0 7px #00e6ff0c",
                display: "block",
                position: "relative",
                right: imgVisible ? 0 : "-80px",
                opacity: imgVisible ? 1 : 0,
                transition: "all .65s cubic-bezier(.45,1.08,.5,1.2)",
                zIndex: 4,
              }}
            />
          </div>

          {/* Main neon card */}
          <div
            style={{
              background: "linear-gradient(115deg, #0c182b 86%, #00e6ff11 100%)",
              border: "2px solid #00e6ff77",
              borderRadius: 18,
              boxShadow: "0 8px 16px #00e6ff15, 0 0 0 4px #00e6ff22",
              maxWidth: 440,
              width: "99vw",
              padding: "27px 22px 16px 22px",
              margin: "0 auto 0 auto",
              marginTop: "0vw",
              marginBottom: 18,
              zIndex: 1,
              textAlign: "center",
              color: "#e4f8ff",
              position: "relative",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                fontSize: "1.13em",
                color: "#00e6ff",
                marginBottom: 10,
                textShadow: "0 2px 12px #00e6ff44",
                letterSpacing: ".6px",
                textTransform: "uppercase",
                animation: "blink 1s steps(1,end) infinite alternate",
              }}
            >
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

            <div
              style={{
                margin: "0 0 13px 0",
                fontSize: ".97em",
                color: "#00e6ff",
                fontFamily: "'Share Tech Mono', monospace",
              }}
            >
              {isConnected ? (
                <span>
                  <b>Your BNB Balance:</b>{" "}
                  {bnbBal ? Number(bnbBal.formatted).toFixed(5) : "0.00000"}
                </span>
              ) : (
                <span style={{ color: "#00e6ff" }}>Please connect wallet to buy!</span>
              )}
            </div>

            {/* Live BNB price */}
            {bnbUsd && bnbInr && (
              <div
                style={{
                  margin: "6px 0 13px 0",
                  fontSize: "1.03em",
                  color: "#0fffc7",
                  background: "#1f2430",
                  padding: "6px 12px",
                  borderRadius: "7px",
                  border: "1px solid #00e6ff55",
                  boxShadow: "0 0 10px #00e6ff22",
                  display: "inline-block",
                  letterSpacing: "1px",
                }}
              >
                1 BNB = ₹{bnbInr.toLocaleString()} / ${bnbUsd.toFixed(2)}
              </div>
            )}

            {/* 🔔 Wrong network helper */}
            {isConnected && chainId !== bsc.id && (
              <div style={{ margin: "6px 0 12px 0" }}>
                <div
                  style={{
                    color: "#ffd29a",
                    fontWeight: "bold",
                    marginBottom: 8,
                    letterSpacing: ".4px",
                  }}
                >
                  You’re on the wrong network. Switch to <b>BSC</b> to continue.
                </div>
                <button
                  onClick={forceBsc}
                  disabled={switching}
                  style={{
                    background: "linear-gradient(90deg,#ffd200,#00ffc6)",
                    color: "#11131a",
                    border: "none",
                    borderRadius: 12,
                    padding: "10px 16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {switching ? "Switching…" : "Switch to BSC"}
                </button>
              </div>
            )}

            <div style={{ margin: "0 auto 8px auto", padding: "13px 0 0 0" }}>
              <div
                style={{
                  fontWeight: "bold",
                  color: "#00e6ff",
                  fontSize: ".95em",
                  marginBottom: 7,
                  letterSpacing: ".03em",
                }}
              >
                Buy RA ATUM (Presale)
              </div>
              <div
                style={{
                  fontWeight: "bold",
                  color: "#00e6ff",
                  fontSize: "0.93em",
                  marginBottom: 7,
                }}
              >
                Min: 0.01 BNB | Max: 2 BNB per wallet
              </div>

              {/* Connect Wallet button (visible when not connected) */}
              {!isConnected && (
                <button
                  onClick={open}
                  style={{
                    background: "linear-gradient(90deg,#00e6ff 0%,#00b4fa 100%)",
                    color: "#fff",
                    fontWeight: "bold",
                    padding: "10px 18px",
                    borderRadius: 14,
                    border: "none",
                    fontSize: "1.02em",
                    cursor: "pointer",
                    marginBottom: 12,
                    boxShadow: "0 2px 14px #00e6ff11",
                    letterSpacing: ".6px",
                    textShadow: "0 0 8px #00e6ff, 0 0 10px #fff",
                  }}
                >
                  Connect Wallet
                </button>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 11,
                  gap: 6,
                  justifyContent: "center",
                }}
              >
                <input
                  style={{
                    borderRadius: 7,
                    border: "1.6px solid #00e6ff80",
                    padding: "11px 13px",
                    fontWeight: "bold",
                    width: 120,
                    color: "#fff",
                    background: "#17253e",
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: "1.03em",
                    marginRight: 5,
                  }}
                  type="number"
                  placeholder="Enter BNB"
                  min={minBNB}
                  max={maxBNB}
                  step="0.01"
                  value={bnb}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (Number(val) > maxBNB) val = maxBNB.toString();
                    setBnb(val);
                  }}
                  disabled={!isConnected}
                />
                <span style={{ fontWeight: 700, color: "#00e6ff" }}>BNB</span>
              </div>

              {/* Conversion */}
              {bnbUsd && bnbInr && bnb && Number(bnb) > 0 && (
                <div style={{ fontSize: "0.97em", color: "#ffed8b", marginTop: 2, marginBottom: 8 }}>
                  ≈ ₹{(Number(bnb) * bnbInr).toLocaleString()} / ${ (Number(bnb) * bnbUsd).toFixed(2) }
                </div>
              )}

              <div
                style={{
                  fontSize: ".91em",
                  marginBottom: 8,
                  color: "#00e6ff",
                  fontWeight: "bold",
                  letterSpacing: ".5px",
                  minHeight: "1.1em",
                }}
              >
                {raAtumGet && isConnected ? (
                  <span>
                    ≈ <span style={{ color: "#00e6ff" }}>{raAtumGet}</span> RA ATUM
                  </span>
                ) : (
                  ""
                )}
              </div>

              {/* Buy Button opens gift modal first */}
              <button
                style={{
                  background: "linear-gradient(90deg,#00e6ff 0%,#00b4fa 100%)",
                  color: "#fff",
                  fontWeight: "bold",
                  padding: "12px 28px",
                  borderRadius: 17,
                  border: "none",
                  fontSize: "1.11em",
                  cursor: isConnected && !isTxLoading ? "pointer" : "not-allowed",
                  marginBottom: 8,
                  marginTop: 6,
                  opacity: isConnected ? 1 : 0.62,
                  boxShadow: "0 2px 14px #00e6ff11",
                  letterSpacing: ".6px",
                  outline: "none",
                  transition: ".14s",
                  textShadow: "0 0 8px #00e6ff, 0 0 10px #fff",
                }}
                disabled={
                  !isConnected ||
                  isTxLoading ||
                  Number(bnb) < minBNB ||
                  Number(bnb) > maxBNB
                }
                onClick={() => {
                  setShowGift(true);
                  setPendingBuy(true);
                }}
              >
                {isTxLoading ? "Processing..." : "Buy Now"}
              </button>

              {buyError && (
                <div style={{ color: "#d72a2a", marginTop: 6, fontWeight: "bold" }}>
                  {buyError}
                </div>
              )}
              {buySuccess && (
                <div style={{ color: "#00e6ff", marginTop: 6, fontWeight: "bold" }}>
                  {buySuccess}
                </div>
              )}
              {isTxSuccess && txHash && (
                <div style={{ marginTop: 8 }}>
                  <a
                    href={`https://bscscan.com/tx/${txHash}`}
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

          <div
            style={{
              fontSize: "1.01em",
              color: "#00e6ff",
              fontWeight: "bold",
              marginTop: 14,
              textShadow: "0 2px 11px #00e6ff25",
              letterSpacing: "1.1px",
            }}
          >
            21,000,000 Token Supply &nbsp;|&nbsp; Digital Launch &nbsp;|&nbsp; 100% Transparent
          </div>
        </div>
      </div>

      {/* OUTSIDE: Back to Home */}
      <div
        style={{
          margin: "36px auto 0 auto",
          textAlign: "center",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <a
          href="/"
          className="calc-footer-link"
          style={{
            color: "#00e6ff",
            marginTop: 17,
            marginBottom: 19,
            display: "inline-block",
            fontSize: "1.11em",
            borderRadius: 10,
            padding: "12px 38px",
            background: "#18273a",
            textDecoration: "none",
            fontWeight: "bold",
            boxShadow: "0 2px 7px #00e6ff12",
            border: "1.5px solid #00e6ff29",
            letterSpacing: ".13px",
            transition: "background 0.14s, color 0.14s",
            textShadow: "0 0 8px #00e6ff",
          }}
        >
          <i className="fas fa-arrow-left"></i> Back to Home
        </a>
      </div>

      {/* GIFT MODAL */}
      {showGift && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.76)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
        }}>
          <div style={{
            background: "#181a29",
            border: "2.5px solid #00e6ff",
            borderRadius: 22,
            boxShadow: "0 8px 36px #00e6ff88",
            color: "#fff",
            textAlign: "center",
            padding: "44px 34px 30px 34px",
            maxWidth: 340,
            position: "relative",
            fontFamily: "'Share Tech Mono', monospace",
          }}>
            <div style={{ fontSize: "2.4em", color: "#FFD700", marginBottom: 10 }}>
              🎁
            </div>
            <div style={{
              fontSize: "1.25em",
              fontWeight: "bold",
              marginBottom: 18,
              color: "#00e6ff",
              letterSpacing: "1.3px"
            }}>
              Congratulations!
            </div>
            <div style={{
              fontSize: "1.07em",
              color: "#bde6ff",
              marginBottom: 13,
            }}>
              You received a bonus gift<br />
              for joining the Presale!<br />
              <b>+1,000 RA ATUM</b> <br />
              <span style={{ color: "#FFD700", fontWeight: 900 }}>A Gift For You!</span>
            </div>
            <button
              style={{
                marginTop: 6,
                padding: "10px 38px",
                background: "linear-gradient(90deg, #FFD700, #00e6ff)",
                color: "#181a29",
                fontWeight: "bold",
                border: "none",
                borderRadius: 12,
                fontSize: "1.1em",
                cursor: "pointer",
                boxShadow: "0 2px 14px #00e6ff55"
              }}
              onClick={() => {
                setShowGift(false);
                if (pendingBuy) {
                  setPendingBuy(false);
                  handleBuy(); // only after closing the gift
                }
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Animations & mobile tweaks */}
      <style>{`
        @keyframes blink {
          0% { filter: brightness(1.14) drop-shadow(0 0 7px #00e6ff77); }
          100% { filter: brightness(1.29) drop-shadow(0 0 21px #00e6ffcc); }
        }
        @keyframes blinklogo {
          0% { filter: brightness(1.07) drop-shadow(0 0 19px #00e6ffcc);}
          100% { filter: brightness(1.37) drop-shadow(0 0 37px #00e6ff);}
        }
        html, body, #root {
          margin: 0 !important;
          padding: 0 !important;
          width: 100vw !important;
          min-height: 100vh !important;
          overflow-x: hidden !important;
          background: transparent !important;
        }
        @media (max-width: 600px) {
          .ra-logo-mobile-fix {
            position: relative !important;
            top: 16px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: 94px !important;
            height: 94px !important;
            margin-bottom: 2vw !important;
            z-index: 12 !important;
            padding: 7px !important;
          }
          .ra-livebar-mobile-fix {
            padding-top: 18px !important;
            padding-bottom: 12px !important;
            z-index: 11 !important;
          }
          .ra-livebar-mobile-fix > div {
            min-width: 0 !important;
            font-size: 1.25em !important;
            padding: 7px 12px !important;
          }
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
