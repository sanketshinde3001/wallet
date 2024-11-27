export interface Transaction {
    id: string;
    type: 'send' | 'receive';
    amount: string;
    token: string;
    timestamp: number;
    address: string;
  }
  
  export interface Wallet {
    address: string;
    balance: {
      [key: string]: string;
    };
  }