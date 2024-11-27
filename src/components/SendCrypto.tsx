'use client';

import React, { useState, useEffect } from 'react';
import { getWeb3 } from '@/utils/web3';

export default function SendCrypto() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState('');
  const [networkName, setNetworkName] = useState('');

  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletConnected(true);
            setCurrentAccount(accounts[0]);
          }

          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          if (chainId === '0xaa36a7') {
            setNetworkName('Sepolia');
          } else {
            setNetworkName('Wrong Network');
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
          setWalletConnected(false);
        }
      }
    };

    checkWallet();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletConnected(true);
          setCurrentAccount(accounts[0]);
        } else {
          setWalletConnected(false);
          setCurrentAccount('');
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  const handleConnectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setWalletConnected(true);
          setCurrentAccount(accounts[0]);

          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          if (chainId === '0xaa36a7') {
            setNetworkName('Sepolia');
          } else {
            setNetworkName('Wrong Network');
          }
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        alert('Failed to connect wallet');
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const handleSendCrypto = async () => {
    if (!walletConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (networkName !== 'Sepolia') {
      alert('Please switch to the Sepolia network in your wallet');
      return;
    }

    if (!recipient || !amount || isNaN(amount) || Number(amount) <= 0) {
      alert('Please enter a valid recipient address and amount');
      return;
    }

    setIsSending(true);

    try {
      const web3 = getWeb3();

      // Define the transaction object
      const tx = {
        from: currentAccount,
        to: recipient,
        value: web3.utils.toWei(amount, 'ether'),
        gas: 21000,
        chainId: 11155111, // Sepolia chain ID
      };

      // Sign the transaction
      const privateKey = prompt('Enter the private key for signing:'); // Secure method for demo purposes
      const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

      // Send the signed transaction
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      alert('Transaction sent successfully!');
      console.log('Transaction Receipt:', receipt);

      setRecipient('');
      setAmount('');
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Check console for details.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-sm mx-auto">
      <h2 className="text-xl mb-4 text-center">Send Sepolia ETH</h2>
      {!walletConnected ? (
        <button
          onClick={handleConnectWallet}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4 w-full"
        >
          Connect Wallet
        </button>
      ) : (
        <>
          {networkName === 'Wrong Network' && (
            <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
              Please switch to the Sepolia network
            </div>
          )}
          <div className="mb-4 text-gray-700">
            <p>Wallet Address: {currentAccount}</p>
            <p>Network: {networkName}</p>
          </div>
          <input
            type="text"
            placeholder="Recipient Address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            type="text"
            placeholder="Amount (SepoliaETH)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 mb-2 border rounded"
          />
          <button
            onClick={handleSendCrypto}
            className={`w-full px-4 py-2 rounded ${
              isSending ? 'bg-gray-500' : 'bg-green-500 text-white'
            }`}
            disabled={isSending}
          >
            {isSending ? 'Sending...' : 'Send Sepolia ETH'}
          </button>
        </>
      )}
    </div>
  );
}
