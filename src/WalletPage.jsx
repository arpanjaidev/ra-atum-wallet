// src/WalletPage.jsx
import React, { useEffect, useState } from "react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";

// ⬇️ referral widget
import ReferralCard from "./components/ReferralCard";

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

// API base (matches your server)
const API = "https://api.raatumtoken.com";

export default function WalletPage() {
  // BNB price
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

  // Wallet state
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
      tokenBalance = parseFloat(
        formatUnits(rawBalance, decimals)
      ).toLocaleString(undefined, { maximumFractionDigits: 4 });
    else tokenBalance = "0";
  }

  // Save ?ref= into cookie + localStorage
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const ref = url.searchParams.get("ref");
      if (ref && /^0x[a-fA-F0-9]{40}$/.test(ref)) {
        document.cookie =
          "ra_ref=" +
          ref +
          "; path=/; max-age=" +
          60 * 60 * 24 * 30 +
          "; domain=.raatumtoken.com; samesite=Lax";
        try {
          localStorage.setItem("ra_ref", ref);
        } catch {}
      }
    } catch {}
  }, []);

  // Attach wallet to referrer once connected
  useEffect(() => {
    if (!isConnected || !address) return;

    let ref = null;
    try {
      const url = new URL(window.location.href);
      const qRef = url.searchParams.get("ref");
      if (qRef && /^0x[a-fA-F0-9]{40}$/.test(qRef)) ref = qRef;
    } catch {}

    if (!ref) {
      try {
        const lsRef = localStorage.getItem("ra_ref");
        if (lsRef && /^0x[a-fA-F0-9]{40}$/.test(lsRef)) ref = lsRef;
      } catch {}
    }

    if (!ref && document?.cookie) {
      const m = document.cookie.match(/(?:^|;\s*)ra_ref=([^;]+)/);
      if (m) {
        const cRef = decodeURIComponent(m[1]);
        if (/^0x[a-fA-F0-9]{40}$/.test(cRef)) ref = cRef;
      }
    }

    if (!ref || !/^0x[a-fA-F0-9]{40}$/.test(ref)) return;

    fetch(`${API}/api/ref/attach-wallet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet: address, ref }),
      credentials: "include",
    }).catch(() => {});
  }, [isConnected, address]);

  // Live referral stats (to show pending earnings in header box)
  const [stats, setStats] = useState(null);
  useEffect(() => {
    if (!isConnected || !address) {
      setStats(null);
      return;
    }
    (async () => {
      try {
        const r = await fetch(`${API}/api/ref/stats?wallet=${address}`, {
          credentials: "include",
        });
        const j = await r.json();
        setStats(j);
      } catch (e) {
        console.error("stats fetch failed", e);
      }
    })();
  }, [isConnected, address]);

  // Format pending RA using token decimals
  let referralEarnings = isConnected ? "0.00 Ra Atum" : "–";
  try {
    if (isConnected && stats?.pendingRA && decimals !== undefined) {
      const human = Number(
        formatUnits(BigInt(stats.pendingRA), decimals)
      ).toLocaleString(undefined, { maximumFractionDigits: 4 });
      referralEarnings = `${human} Ra Atum`;
    }
  } catch {}

  // Typing headline
  const [walletHeadline, setWalletHeadline] = useState("");
  const walletTypingText =
    "JOIN Ra Atum TO SHAPE THE FUTURE OF BLOCKCHAIN-POWERED KINDNESS.";
  useEffect(() => {
    let wIndex = 0,
      wTypingForward = true,
      wBlinkOn = true,
      stopped = false;
    function typeWalletLine() {
      if (stopped) return;
      let html =
        walletTypingText.substring(0, wIndex) +
        `<span style="color:#00b4fa;font-weight:bold;font-size:1.15em;">${
          wBlinkOn ? "|" : "&nbsp;"
        }</span>`;
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
    const blinkInt = setInterval(() => {
      wBlinkOn = !wBlinkOn;
    }, 410);
    typeWalletLine();
    return () => {
      stopped = true;
      clearInterval(blinkInt);
    };
  }, []);

  // Calculator logic
  const [calcValue, setCalcValue] = useState(100);

  // Live presale price (1000 Ra Atum = 0.01 BNB)
  const presaleRate = 1000;
  const presaleBnbPerRa = 0.01 / presaleRate; // 0.00001
  const livePresalePrice = {
    bnb: presaleBnbPerRa,
    inr: bnbInr ? presaleBnbPerRa * bnbInr : 0,
    usd: bnbUsd ? presaleBnbPerRa * bnbUsd : 0,
  };

  // Starting & launch prices per Ra Atum
  const startPriceInr = 0.55;
  const launchPriceInr = 15;
  const startPriceUsd =
    bnbInr && bnbUsd ? (startPriceInr / bnbInr) * bnbUsd : 0.01;
  const launchPriceUsd =
    bnbInr && bnbUsd ? (launchPriceInr / bnbInr) * bnbUsd : 0.17;
  const startPriceBnb = bnbInr ? startPriceInr / bnbInr : 0.00001;
  const launchPriceBnb = bnbInr ? launchPriceInr / bnbInr : 0.0003;
  const startRs = `₹${(calcValue * startPriceInr).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
  const startUsd = `$${(calcValue * startPriceUsd).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
  const startBnb = (calcValue * startPriceBnb).toFixed(5);
  const launchRs = `₹${(calcValue * launchPriceInr).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
  const launchUsd = `$${(calcValue * launchPriceUsd).toLocaleString(
    undefined,
    { maximumFractionDigits: 2 }
  )}`;
  const launchBnb = (calcValue * launchPriceBnb).toFixed(5);

  // helper: forward ?ref= to /presale
  function goToPresale() {
    try {
      const ref = localStorage.getItem("ra_ref");
      const qs = ref && /^0x[a-fA-F0-9]{40}$/.test(ref) ? `?ref=${ref}` : "";
      window.location.href = "/presale" + qs;
    } catch {
      window.location.href = "/presale";
    }
  }

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
          body { min-height: 100vh !important; }
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
            .wallet-full-row { gap: 6vw !important; }
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
            background:
              "linear-gradient(90deg,#fff 8%,#00b4fa 60%,#23e6ff 98%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow:
              "0 2px 18px #22213866,0 0 8px #00b4fa88,0 0 18px #00b4fa99",
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
            margin: "0 auto 24px auto",
            flexWrap: "nowrap",
          }}
        >
          <img
            src="/RA-ATUM-LOGO.png"
            alt="Ra Atum Logo"
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

          {/* Wallet box */}
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
                background:
                  "linear-gradient(90deg, #fff 8%, #00b4fa 60%, #23e6ff 98%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow:
                  "0 2px 18px #22213866, 0 0 8px #00b4fa88, 0 0 18px #00b4fa99",
                filter: "brightness(1.16) drop-shadow(0 0 3px #00e6ff99)",
                textTransform: "uppercase",
                textAlign: "center",
                width: "100%",
                marginTop: 10,
              }}
            >
              <i className="fas fa-wallet"></i> WALLET OVERVIEW
            </div>

            {mounted && (
              <>
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
                    marginTop: 5,
                  }}
                  onClick={open}
                >
                  {isConnected ? "Connected" : "Connect Wallet"}
                </button>

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
                    width: "100%",
                  }}
                  onClick={goToPresale}
                >
                  <i className="fa-solid fa-bolt"></i> Buy Ra Atum Token
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
              </>
            )}

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
                {tokenBalance === "–" ? "–" : `${tokenBalance} Ra Atum`}
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

          {/* Calculator box */}
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
                background:
                  "linear-gradient(90deg, #fff 8%, #00b4fa 60%, #23e6ff 98%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow:
                  "0 2px 18px #22213866,0 0 8px #00b4fa88,0 0 18px #00b4fa99",
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
                  minWidth: 96,
                  textAlign: "right",
                }}
              >
                Enter Ra Atum
              </label>
              <input
                id="calc-ra"
                className="calc-input"
                type="number"
                min="0"
                placeholder="100"
                value={
                  calcValue === 0 ? "" : calcValue.toString().replace(/^0+/, "")
                }
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
                fontSize: "1.08em",
                color: "#0fffc7",
                marginTop: 20,
                marginBottom: 0,
                fontWeight: "bold",
                letterSpacing: ".5px",
              }}
            >
              <div>
                LIVE PRESALE PRICE:
                <br />
                1 Ra Atum = ₹
                {livePresalePrice.inr
                  ? livePresalePrice.inr.toFixed(4)
                  : "--"}{" "}
                | $
                {livePresalePrice.usd
                  ? livePresalePrice.usd.toFixed(4)
                  : "--"}{" "}
                | BNB {livePresalePrice.bnb.toFixed(5)}
              </div>
              <div style={{ fontSize: "0.95em", marginTop: 5 }}>
                1000 Ra Atum = ₹
                {livePresalePrice.inr
                  ? (livePresalePrice.inr * 1000).toFixed(2)
                  : "--"}{" "}
                | $
                {livePresalePrice.usd
                  ? (livePresalePrice.usd * 1000).toFixed(2)
                  : "--"}{" "}
                | BNB {(livePresalePrice.bnb * 1000).toFixed(5)}
              </div>
            </div>

            <div className="calc-footer-space" style={{ minHeight: 38 }} />
          </div>
        </div>

        {/* Referral widget section */}
        <div style={{ maxWidth: 640, width: "92%", margin: "0 auto 32px" }}>
          {/* shiny rule notice */}
          <div
            style={{
              textAlign: "center",
              fontWeight: "bold",
              marginBottom: 10,
              fontSize: "0.98rem",
              background:
                "linear-gradient(90deg, #ffffff 10%, #00b4fa 55%, #23e6ff 95%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow:
                "0 2px 18px #22213866, 0 0 8px #00b4fa88, 0 0 18px #00b4fa99",
              letterSpacing: "0.6px",
            }}
          >
            Rewards apply to buys ≥ 0.05 BNB.
                 </div>

          {/* pass token decimals so pending RA shows human amount */}
          <ReferralCard tokenDecimals={Number(decimals ?? 18)} />

          {/* tiny caption so nobody worries about raw 1e18 values */}
          <div
            style={{
              textAlign: "center",
              color: "#7fbbed",
              marginTop: 8,
              fontSize: "0.8rem",
              opacity: 0.9,
            }}
          >
            Note: big numbers in APIs are wei-style base units (1e18). We show human
            Ra Atum amounts here.
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
