import { Web3Provider } from '@ethersproject/providers';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { Buffer } from 'buffer';
import { ethers } from 'ethers';


if (!window.Buffer) {
  window.Buffer = Buffer;
}

export const getLibrary = (provider) => {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

export const ETHEREUM_NETWORKS_ID = 1;
export const SEPOLIA_NETWORKS_ID = 11155111;
export const LOCALHOST_NETWORKS_ID = 31337;

export const injectedConnector = new InjectedConnector({
    supportedChainIds: [
        ETHEREUM_NETWORKS_ID, 
        SEPOLIA_NETWORKS_ID, 
        LOCALHOST_NETWORKS_ID
    ]
})

export const walletConnectConnector = new WalletConnectConnector({
    rpc: {
        [ETHEREUM_NETWORKS_ID]: process.env.REACT_APP_ETHEREUM_RPC_URL
    },
    qrcode: true,
    });

export const localProvider = new ethers.JsonRpcProvider(process.env.REACT_APP_LOCAL_RPC_URL);
