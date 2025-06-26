import React from 'react';
import { Link } from "react-router-dom";
export default function App() {
  return (
    <div style={{background:"#11131a",minHeight:"100vh",color:"#0fffc7",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <nav style={{marginBottom:"32px"}}>
        <Link to="/" style={{color:'#0fffc7',marginRight:'20px'}}>Home</Link>
        <Link to="/wallet" style={{color:'#0fffc7'}}>Wallet</Link>
      </nav>
      <h2>RA Atum – Home Page</h2>
      <p>Welcome! Use the wallet button at bottom right to connect.</p>
    </div>
  );
}
