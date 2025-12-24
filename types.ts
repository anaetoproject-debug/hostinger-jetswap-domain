
export enum ThemeVariant {
  MINIMALIST = 'MINIMALIST',
  GLASSMORPHISM = 'GLASSMORPHISM',
  DARK_FUTURISTIC = 'DARK_FUTURISTIC',
  GRADIENT_PREMIUM = 'GRADIENT_PREMIUM'
}

export interface Chain {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Token {
  symbol: string;
  name: string;
  icon: string;
  decimals: number;
}

export enum TransactionStatus {
  IDLE = 'IDLE',
  CONFIRMING = 'CONFIRMING',
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  FLAGGED = 'FLAGGED'
}

export interface SwapState {
  sourceChain: Chain;
  destChain: Chain;
  sourceToken: Token;
  destToken: Token;
  amount: string;
  estimatedOutput: string;
}

export interface UserProfile {
  id: string;
  method: 'wallet' | 'email' | 'social' | 'web3-profile';
  identifier: string; // email, wallet address, or handle
  name?: string;
  avatar?: string;
  role?: 'user' | 'admin';
}
