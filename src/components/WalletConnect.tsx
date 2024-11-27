'use client';
import React, { useState, useEffect } from 'react';
import { connectWallet, getWalletBalance } from '@/utils/web3';

export default function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');

  const handleConnectWallet = async () => {
    const address = await connectWallet();
    if (address) {
      setWalletAddress(address);
      const walletBalance = await getWalletBalance(address);
      setBalance(walletBalance);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      {!walletAddress ? (
        <button 
          onClick={handleConnectWallet}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Connect Wallet
        </button>
      ) : (
        <div>
          <p>Wallet Address: {walletAddress}</p>
          <p>Balance: {balance} ETH</p>
        </div>
      )}
    </div>
  );
}