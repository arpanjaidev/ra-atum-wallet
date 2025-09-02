// src/components/ReferralCard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { useReferral } from '../lib/useReferral';
import { formatUnits } from 'viem';

const API = import.meta.env.VITE_REF_API || 'https://api.raatumtoken.com';

export default function ReferralCard({ tokenDecimals = 18 }) {
  const { address, isConnected } = useAccount();
  const { getStoredRef } = useReferral();

  const [stats, setStats] = useState(null);
  const [rules, setRules] = useState(null);
  const [copied, setCopied] = useState(false);

  // Personal referral link
  const myLink = useMemo(() => {
    if (!address) return '';
    const base =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://ra-atum-wallet.vercel.app';
    return `${base}/?ref=${address}`;
  }, [address]);

  // Attach wallet -> referrer (cookie/local ref or ?ref)
  useEffect(() => {
    if (!isConnected || !address) return;
    (async () => {
      try {
        const ref = getStoredRef();
        await fetch(`${API}/api/ref/attach-wallet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ wallet: address, ref })
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
          credentials: 'include'
        });
        const j = await r.json();
        setStats(j);
      } catch {}
    })();
  }, [address]);

  // Load program rules (for min buy in BNB, etc.)
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}/api/ref/rules`, {
          credentials: 'include'
        });
        const j = await r.json();
        setRules(j);
      } catch {}
    })();
  }, []);

  // Human formatted pending Ra Atum
  const humanPending = useMemo(() => {
    try {
      if (!stats?.pendingRA) return '0.0000';
      return Number(
        formatUnits(BigInt(stats.pendingRA), Number(tokenDecimals ?? 18))
      ).toLocaleString(undefined, { maximumFractionDigits: 4 });
    } catch {
      return '0.0000';
    }
  }, [stats?.pendingRA, tokenDecimals]);

  // Human formatted min BNB required for rewards (fallback 0.05)
  const minBnbHuman = useMemo(() => {
    try {
      if (!rules?.minBnbWei) return '0.05';
      return Number(formatUnits(BigInt(rules.minBnbWei), 18)).toLocaleString(
        undefined,
        { maximumFractionDigits: 3 }
      );
    } catch {
      return '0.05';
    }
  }, [rules?.minBnbWei]);

  const copy = async () => {
    try {
      if (!myLink) return;
      await navigator.clipboard.writeText(myLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  if (!isConnected) return null;

  return (
    <>
      {/* Mobile fix: stack tiles on small screens and keep heights tidy */}
      <style>
        {`
          @media (max-width: 470px) {
            .ra-ref-grid { grid-template-columns: 1fr !important; }
            .ra-ref-card { padding: 16px !important; }
            .ra-ref-tile { min-height: 88px !important; }
          }
        `}
      </style>

      <div
        className="ra-ref-card"
        style={{
          border: '2px solid #00b4fa',
          background: '#131622',
          boxShadow: '0 8px 32px #00b4fa33',
          borderRadius: 18,
          padding: 22,
          color: '#e9f6ff',
          fontFamily: "'Share Tech Mono', monospace"
        }}
      >
        {/* Shiny rule line */}
        <div
          style={{
            textAlign: 'center',
            fontWeight: 'bold',
            marginBottom: 12,
            fontSize: '0.98rem',
            background:
              'linear-gradient(90deg,#ffffff 10%,#00b4fa 55%,#23e6ff 95%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow:
              '0 2px 18px #22213866,0 0 8px #00b4fa88,0 0 18px #00b4fa99',
            letterSpacing: '0.6px'
          }}
        >
          Rewards apply to buys ≥ {minBnbHuman} BNB.
        </div>

        <div
          style={{
            textAlign: 'center',
            fontWeight: 'bold',
            marginBottom: 10,
            fontSize: '1.1rem',
            background:
              'linear-gradient(90deg, #ffffff 10%, #00b4fa 55%, #23e6ff 95%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow:
              '0 2px 18px #22213866, 0 0 8px #00b4fa88, 0 0 18px #00b4fa99',
            letterSpacing: '0.6px'
          }}
        >
          Referral Program
        </div>

        <div style={{ textAlign: 'center', marginBottom: 14, color: '#cfe9ff' }}>
          Earn <b>5%</b> in <b>Ra Atum</b> when friends buy. They get <b>2%</b>{' '}
          extra <b>Ra Atum</b>.
        </div>

        {/* Link row */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            margin: '0 auto 12px',
            maxWidth: 820
          }}
        >
          <input
            readOnly
            value={
              isConnected
                ? myLink
                : 'Connect wallet to get your referral link'
            }
            onFocus={(e) => e.target.select()}
            style={{
              flex: 1,
              background: '#0f1424',
              border: '1.5px solid #1f3355',
              color: '#aee6ff',
              padding: '10px 12px',
              borderRadius: 8,
              fontFamily: "'Share Tech Mono', monospace",
              outline: 'none'
            }}
          />
          <button
            disabled={!isConnected}
            onClick={copy}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: '1.5px solid #00b4fa',
              background: 'linear-gradient(90deg,#0fffc7,#00c3ff)',
              color: '#0b0f17',
              fontWeight: 'bold',
              cursor: isConnected ? 'pointer' : 'not-allowed'
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Stats grid */}
        <div
          className="ra-ref-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(160px, 1fr))',
            gap: 14,
            marginTop: 12
          }}
        >
          <div
            className="ra-ref-tile"
            style={{
              background: '#0f1424',
              border: '1.5px solid #1f3355',
              borderRadius: 12,
              padding: '18px 14px',
              textAlign: 'center'
            }}
          >
            <div style={{ color: '#97c7ff', marginBottom: 6 }}>Clicks</div>
            <div style={{ fontWeight: 'bold', color: '#ffffff' }}>
              {stats?.clicks ?? 0}
            </div>
          </div>

          <div
            className="ra-ref-tile"
            style={{
              background: '#0f1424',
              border: '1.5px solid #1f3355',
              borderRadius: 12,
              padding: '18px 14px',
              textAlign: 'center'
            }}
          >
            <div style={{ color: '#97c7ff', marginBottom: 6 }}>Sign-ups</div>
            <div style={{ fontWeight: 'bold', color: '#ffffff' }}>
              {stats?.attached ?? 0}
            </div>
          </div>

          <div
            className="ra-ref-tile"
            style={{
              background: '#0f1424',
              border: '1.5px solid #1f3355',
              borderRadius: 12,
              padding: '18px 14px',
              textAlign: 'center'
            }}
          >
            <div style={{ color: '#97c7ff', marginBottom: 6 }}>Purchases</div>
            <div style={{ fontWeight: 'bold', color: '#ffffff' }}>
              {stats?.conversions ?? 0}
            </div>
          </div>

          <div
            className="ra-ref-tile"
            style={{
              background: '#0f1424',
              border: '1.5px solid #1f3355',
              borderRadius: 12,
              padding: '18px 14px',
              textAlign: 'center'
            }}
          >
            <div style={{ color: '#97c7ff', marginBottom: 6 }}>
              Your Ra Atum (pending)
            </div>
            <div
              style={{
                fontWeight: 'bold',
                color: '#0fffc7',
                textShadow:
                  '0 2px 18px #22213866, 0 0 8px #00b4fa88, 0 0 18px #00b4fa99'
              }}
            >
              {humanPending}
            </div>
          </div>
        </div>

        {/* Helpful note */}
        <div
          style={{
            marginTop: 12,
            textAlign: 'center',
            fontSize: 12,
            opacity: 0.8,
            color: '#9fc7ff'
          }}
        >
          Note: big numbers in APIs are wei-style base units (1e18). We show
          human Ra Atum amounts here.
        </div>
      </div>
    </>
  );
}
