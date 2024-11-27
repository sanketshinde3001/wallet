import { Web3 } from 'web3';

export const getWeb3 = () => {
  // Update provider URL to Sepolia testnet
  const providerUrl = process.env.NEXT_PUBLIC_SEPOLIA_PROVIDER_URL || 'https://sepolia.infura.io/v3/4c107212a9ed4295824b71bdee820e6f';
  return new Web3(new Web3.providers.HttpProvider(providerUrl));
};

export const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
  
        // Switch to Sepolia network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }] // Sepolia chain ID
        });
  
        return accounts[0];
      } catch (error: any) {
        // If network not added, request to add it
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xaa36a7', // Sepolia chain ID
                chainName: 'Sepolia Testnet',
                nativeCurrency: {
                  name: 'SepoliaETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://sepolia.infura.io/v3/YOUR_PROJECT_ID'],
                blockExplorerUrls: ['https://sepolia.etherscan.io/']
              }]
            });
          } catch (addError) {
            console.error("Failed to add Sepolia network", addError);
          }
        }
        console.error("User denied account access or network switch");
        return null;
      }
    } else {
      console.log('Non-Ethereum browser detected. Consider trying MetaMask!');
      return null;
    }
  };
  

export const getWalletBalance = async (address: string) => {
  const web3 = getWeb3();
  try {
    const balanceWei = await web3.eth.getBalance(address);
    return web3.utils.fromWei(balanceWei, 'ether');
  } catch (error) {
    console.error('Error fetching balance:', error);
    return '0';
  }
};