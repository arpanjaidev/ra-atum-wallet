import { useEffect, useState } from 'react';

const REF_KEY = 'ra_ref';

export function useReferral() {
  const [refFromUrl, setRefFromUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const ref = url.searchParams.get('ref');
      if (ref && /^0x[a-fA-F0-9]{40}$/.test(ref)) {
        // keep a local copy (cookie already set by your site)
        localStorage.setItem(REF_KEY, ref);
        setRefFromUrl(ref);
      }
    } catch {}
  }, []);

  const getStoredRef = () => {
    try { return localStorage.getItem(REF_KEY); } catch { return null; }
  };

  return { refFromUrl, getStoredRef };
}
