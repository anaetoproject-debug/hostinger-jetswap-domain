
import { Chain, Token } from './types';

export const CHAINS: Chain[] = [
  { id: 'ethereum', name: 'Ethereum', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', color: '#627EEA' },
  { id: 'arbitrum', name: 'Arbitrum', icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png', color: '#28A0F0' },
  { id: 'optimism', name: 'Optimism', icon: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png', color: '#FF0420' },
  { id: 'base', name: 'Base', icon: 'https://avatars.githubusercontent.com/u/108554348?v=4', color: '#0052FF' },
  { id: 'polygon', name: 'Polygon', icon: 'https://cryptologos.cc/logos/polygon-matic-logo.png', color: '#8247E5' },
  { id: 'solana', name: 'Solana', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', color: '#14F195' },
];

export const TOKENS: Token[] = [
  { symbol: 'ETH', name: 'Ethereum', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', decimals: 18 },
  { symbol: 'USDC', name: 'USD Coin', icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', decimals: 6 },
  { symbol: 'USDT', name: 'Tether', icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png', decimals: 6 },
  { symbol: 'WETH', name: 'Wrapped Ether', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', decimals: 18 },
  { symbol: 'ARB', name: 'Arbitrum', icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png', decimals: 18 },
  { symbol: 'SOL', name: 'Solana', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', decimals: 9 },
];

export interface WalletProvider {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'Popular' | 'Multi-Chain' | 'Solana' | 'Smart' | 'Hardware' | 'Exchange';
  recommended?: boolean;
}

export const WALLETS: WalletProvider[] = [
  // 20 Wallets with verified high-fidelity URLs
  { id: 'metamask', name: 'MetaMask', icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Logo.svg', description: 'Ethereum Gateway', category: 'Popular', recommended: true },
  { id: 'coinbase', name: 'Coinbase', icon: 'https://raw.githubusercontent.com/coinbase/coinbase-wallet-sdk/master/packages/wallet-sdk/assets/coinbase-logo.png', description: 'Easy & Secure', category: 'Popular', recommended: true },
  { id: 'phantom', name: 'Phantom', icon: 'https://raw.githubusercontent.com/phantom-labs/brand-assets/main/logos/icon/purple.png', description: 'Solana & More', category: 'Popular', recommended: true },
  { id: 'trust', name: 'Trust Wallet', icon: 'https://trustwallet.com/assets/images/media/assets/TWT.png', description: 'Multi-chain Mobile', category: 'Popular' },
  { id: 'binance', name: 'Binance Web3', icon: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png', description: 'Exchange Wallet', category: 'Popular' },
  { id: 'okx', name: 'OKX Wallet', icon: 'https://www.okx.com/cdn/assets/imgs/221/9E9277A8A3A8A3A8.png', description: 'Powerful DEX tools', category: 'Multi-Chain' },
  { id: 'zerion', name: 'Zerion', icon: 'https://app.zerion.io/images/icons/zerion.png', description: 'Smart Portfolio', category: 'Multi-Chain' },
  { id: 'rabby', name: 'Rabby', icon: 'https://rabby.io/assets/images/logo.png', description: 'Better for Dapps', category: 'Multi-Chain', recommended: true },
  { id: 'exodus', name: 'Exodus', icon: 'https://www.exodus.com/brand/img/logo.svg', description: 'Beautiful UI', category: 'Multi-Chain' },
  { id: 'coin98', name: 'Coin98', icon: 'https://coin98.com/favicon.png', description: 'DeFi Gateway', category: 'Multi-Chain' },
  { id: 'argent', name: 'Argent', icon: 'https://www.argent.xyz/favicon.ico', description: 'L2 Smart Wallet', category: 'Smart' },
  { id: 'zengo', name: 'Zengo', icon: 'https://zengo.com/favicon.ico', description: 'Keyless Security', category: 'Smart' },
  { id: 'crypto-com', name: 'Crypto.com', icon: 'https://cryptologos.cc/logos/crypto-com-coin-cro-logo.png', description: 'DeFi & Cards', category: 'Exchange' },
  { id: 'atomic', name: 'Atomic', icon: 'https://atomicwallet.io/favicon.ico', description: 'Private & Secure', category: 'Multi-Chain' },
  { id: 'gem', name: 'Gem Wallet', icon: 'https://gemwallet.com/favicon.ico', description: 'Fast Multi-chain', category: 'Multi-Chain' },
  { id: 'rainbow', name: 'Rainbow', icon: 'https://rainbow.me/favicon.png', description: 'Social & Fun', category: 'Multi-Chain' },
  { id: 'tangem', name: 'Tangem', icon: 'https://tangem.com/favicon.ico', description: 'Hardware Card', category: 'Hardware' },
  { id: 'solflare', name: 'Solflare', icon: 'https://solflare.com/favicon.ico', description: 'Solana Native', category: 'Solana' },
  { id: 'kraken', name: 'Kraken', icon: 'https://cryptologos.cc/logos/kraken-krp-logo.png', description: 'Secure Trading', category: 'Exchange' },
  { id: 'uphold', name: 'Uphold', icon: 'https://uphold.com/favicon.ico', description: 'Multi-Asset Hub', category: 'Exchange' },
];
