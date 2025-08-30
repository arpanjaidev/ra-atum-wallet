import React, { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { useReferral } from '../lib/useReferral';

const API = import.meta.env.VITE_REF_API || 'https://api.raatumtoken.com';

export default function ReferralCard() {
  const { address, isConnected } = useAccount();
  const { getStoredRef } = useReferral();
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);

  const myLink = useMemo(() => {
    if (!address) return '';
    const base = window.location.origin;
    return `${base}/?ref=${address}`;
  }, [address]);

  // Attach wallet -> referrer (uses cookie or local ref)
  useEffect(() => {
    async function attach() {
      try {
        const ref = getStoredRef();
        await fetch(`${API}/api/ref/attach-wallet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // send cookie ra_ref
          body: JSON.stringify({ wallet: address, ref })
        });
      } catch {}
    }
    if (isConnected && address) attach();
  }, [isConnected, address, getStoredRef]);

  // Load stats for this wallet
  useEffect(() => {
    async function load() {
      if (!address) return;
      const r = await fetch(`${API}/api/ref/stats?wallet=${address}`, { credentials: 'include' });
      const j = await r.json();
      setStats(j);
    }
    load();
  }, [address]);

  const copy = async () => {
    if (!myLink) return;
    await navigator.clipboard.writeText(myLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  if (!isConnected) return null;

  return (
    <div style={{
      border: '1px solid #00b4fa55',
      background:'#192332e6',
      boxShadow:'0 0 24px #00b4fa55',
      borderRadius: 16, padding: 16, color:'#e7d7b6'
    }}>
      <h3 style={{color:'#00b4fa', marginBottom:8}}>Referral Program</h3>
      <p style={{opacity:.85, marginTop:0}}>Earn <b>5%</b> in RA when friends buy. They get <b>2%</b> extra RA.</p>

      <div style={{display:'flex', gap:8, alignItems:'center', background:'rgba(0,0,0,.35)', padding:8, borderRadius:12, overflowX:'auto'}}>
        <code style={{whiteSpace:'nowrap', flex:1}}>{myLink}</code>
        <button onClick={copy} style={{padding:'6px 10px', borderRadius:10, border:'1px solid #00b4fa55', background:'transparent', color:'#e7d7b6'}}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {stats && (
        <div style={{display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:12, marginTop:16, fontSize:14}}>
          <div style={{background:'rgba(0,0,0,.25)', padding:12, borderRadius:12}}>
            <div style={{opacity:.7}}>Clicks</div><div style={{fontSize:18}}>{stats.clicks || 0}</div>
          </div>
          <div style={{background:'rgba(0,0,0,.25)', padding:12, borderRadius:12}}>
            <div style={{opacity:.7}}>Sign-ups</div><div style={{fontSize:18}}>{stats.attached || 0}</div>
          </div>
          <div style={{background:'rgba(0,0,0,.25)', padding:12, borderRadius:12}}>
            <div style={{opacity:.7}}>Purchases</div><div style={{fontSize:18}}>{stats.conversions || 0}</div>
          </div>
          <div style={{background:'rgba(0,0,0,.25)', padding:12, borderRadius:12}}>
            <div style={{opacity:.7}}>Your RA (pending)</div><div style={{fontSize:18}}>{stats.pendingRA || 0}</div>
          </div>
        </div>
      )}
    </div>
  );
}
