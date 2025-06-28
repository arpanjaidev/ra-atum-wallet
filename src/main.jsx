import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { WagmiProvider } from 'wagmi'; // v5 = WagmiProvider
import { mainnet, bsc } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from './App.jsx';
import WalletPage from './WalletPage.jsx';
import PresalePage from './PresalePage.jsx';

const projectId = '12d853ddc01d124d1788bce412bd3020';

const metadata = {
  name: 'RA Atum',
  description: 'RA Atum wallet demo',
  url: 'http://localhost:5173',
  icons: [],
};

const chains = [mainnet, bsc];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// Create Web3Modal ONCE
createWeb3Modal({ wagmiConfig, projectId, chains });

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<WalletPage />} />
            <Route path="/app" element={<App />} />
            <Route path="/presale" element={<PresalePage />} />  {/* <-- Add this line */}
          </Routes>
        </BrowserRouter>
      </WagmiProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
