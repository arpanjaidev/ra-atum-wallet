// src/components/ReferralCard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { useReferral } from "../lib/useReferral";
import { formatUnits } from "viem";

const API = import.meta.env.VITE_REF_API || "https://api.raatumtoken.com";

export default function ReferralCard({ tokenDecimals = 18 }) {
  const { address, isConnected } = useAccount();
  const { getStoredRef } = useReferral();
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);

  const myLink = useMemo(() => {
    if (!address) return "";
    const base = window.location.origin;
    return `${base}/?ref=${address}`;
  }, [address]);

  // Attach wallet → referrer
  useEffect(() => {
    if (!isConnected || !address) return;
    (async () => {
      try {
        const ref = getStoredRef();
        await fetch(`${API}/api/ref/attach-wallet`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ wallet: address, ref }),
        });
      } catch {}
    })();
  }, [isConnected, address, getStoredRef]);

  // Load stats
  useEffect(() => {
    if (!address) return;
    (async () => {
      try {
        const r = await fetch(`${API}/api/ref/stats?wallet=${address}`, {
          credentials: "include",
        });
        const j = await r.json();
        setStats(j);
      } catch {}
    })();
  }, [address]);

  const copy = async () => {
    if (!myLink) return;
    await navigator.clipboard.writeText(myLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  // Human-readable pending RA
  let pendingHuman = "0";
  try {
    if (stats?.pendingRA) {
      pendingHuman = Number(
        formatUnits(BigInt(stats.pendingRA), Number(tokenDecimals ?? 18))
      ).toLocaleString(undefined, { maximumFractionDigits: 4 });
    }
  } catch {}

  if (!isConnected) return null;

  return (
    <>
      <style>
        {`
          .ra-ref-card {
            border: 1px solid #00b4fa55;
            background: #192332e6;
            box-shadow: 0 0 24px #00b4fa55;
            border-radius: 16px;
            padding: 16px;
            color: #e7d7b6;
          }
          .ra-ref-title {
            color: #00b4fa;
            margin: 0 0 8px 0;
            text-align: center;
            font-size: 1.5rem;
            text-shadow: 0 0 8px #00b4fa66, 0 0 16px #00b4fa55;
          }
          .ra-ref-sub {
            margin: 0 0 14px 0;
            text-align: center;
            font-size: 1.05rem;
          }
          .ra-link-row {
            display: flex;
            gap: 8px;
            align-items: center;
            background: rgba(0,0,0,.35);
            padding: 8px;
            border-radius: 12px;
            overflow: hidden;
          }
          .ra-link-code {
            white-space: nowrap;
            overflow-x: auto;
            flex: 1;
          }
          .ra-copy-btn {
            padding: 8px 14px;
            border-radius: 10px;
            border: 1px solid #00b4fa55;
            background: transparent;
            color: #e7d7b6;
            font-weight: 700;
          }
          .ra-stat-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            margin-top: 16px;
            width: 100%;
          }
          .ra-stat {
            background: rgba(0,0,0,.25);
            border: 1px solid #00b4fa33;
            padding: 12px;
            border-radius: 12px;
            min-height: 96px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            overflow: hidden;
            word-break: break-word;
          }
          .ra-stat .label {
            opacity: .75;
            font-family: 'Share Tech Mono', monospace;
            letter-spacing: .4px;
            margin-bottom: 4px;
          }
          .ra-stat .value {
            font-size: 1.25rem;
            font-weight: 700;
          }
          .ra-pending-amount {
            font-size: 1.25rem;
            font-weight: 800;
            text-shadow: 0 0 8px #00ffd577, 0 0 14px #00b4fa55;
            color: #00ffd5;
          }
          /* ✅ Mobile fix: stack stats in one column */
          @media (max-width: 470px) {
            .ra-stat-grid { grid-template-columns: 1fr; }
            .ra-ref-sub { font-size: 1rem; }
          }
        `}
      </style>

      <div className="ra-ref-card">
        <h3 className="ra-ref-title">Referral Program</h3>
        <p className="ra-ref-sub">
          Earn <b>5%</b> in <b>Ra Atum</b> when friends buy. They get <b>2%</b> extra <b>Ra Atum</b>.
        </p>

        <div className="ra-link-row">
          <code className="ra-link-code">{myLink}</code>
          <button className="ra-copy-btn" onClick={copy}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {stats && (
          <div className="ra-stat-grid">
            <div className="ra-stat">
              <div className="label">Clicks</div>
              <div className="value">{stats.clicks || 0}</div>
            </div>

            <div className="ra-stat">
              <div className="label">Sign-ups</div>
              <div className="value">{stats.attached || 0}</div>
            </div>

            <div className="ra-stat">
              <div className="label">Purchases</div>
              <div className="value">{stats.conversions || 0}</div>
            </div>

            <div className="ra-stat">
              <div className="label">Your Ra Atum (pending)</div>
              <div className="ra-pending-amount">{pendingHuman}</div>
            </div>
          </div>
        )}

        <div
          style={{
            textAlign: "center",
            color: "#7fbbed",
            marginTop: 12,
            fontSize: "0.8rem",
            opacity: 0.9,
          }}
        >
          Note: big numbers in APIs are wei-style base units (1e18). We show human Ra Atum amounts here.
        </div>
      </div>
    </>
  );
}
