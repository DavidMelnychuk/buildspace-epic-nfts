import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import myEpicNft from './utils/MyEpicNFT.json';

// Constants
const TWITTER_HANDLE = 'david_melnychuk';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-sm4ha7d5jl';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0x752305B871e6C157e7252BC274a4Eb21f93cD07C"

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [nftMinting, setNftMinting] = useState(false);
  const [totalNFtsMinted, setTotalNftsMinted] = useState(0);
  const [mintedNfts, setMintedNfts] = useState([]);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({method: 'eth_accounts'});

    if(accounts.length !== 0){
      const account = accounts[0];
      console.log("Found an authorized account", accounts);
      setCurrentAccount(account);
      setupEventListener();
      getTotalNFTsMinted();
    } else {
      console.log("No authorized account found");
    }
  }

  const isConnectedToRinkeby = async () => {
    const { ethereum } = window;
    if(ethereum){
      let chainId = await ethereum.request({ method: 'eth_chainId' });
      const rinkebyChainId = "0x4"; 
      if (chainId !== rinkebyChainId) {
        alert("Connect to the Rinkeby test network to mint an NFT :)");
        return false;
      } else {
        return true;
      }
    } else {
      console.log("Etherem object not found");
    }
  }

  const getTotalNFTsMinted = async () => {
    const { ethereum } = window;
    if(ethereum && await isConnectedToRinkeby()) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const nftContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
      const totalMinted = await nftContract.getTotalNFTsMinted();
      setTotalNftsMinted(Number(totalMinted));
    }
  }

  const connectWallet = async () => {
    try{
      const { ethereum } = window;

      if(!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({method: "eth_requestAccounts"});
      
      setCurrentAccount(accounts[0]);
      setupEventListener();
      getTotalNFTsMinted();
    } catch (error) {
      console.log(error);
    }
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
          getTotalNFTsMinted();
          setMintedNfts(prevState => [...prevState, `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`]);
          return;
        });

        console.log("Setup event listener!")
      } else {
        console.log("Ethereum object doesn't exist!");
      }

    } catch (error){
      console.error(error);
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;
      if (ethereum && await isConnectedToRinkeby()){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();
        setNftMinting(true);
        console.log("Mining...please wait.")
        await nftTxn.wait();
        setNftMinting(false);

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      } else {
        console.log("ethereum object doesn't exist!");
      }
    } catch (error){
      console.error(error);
    }
  }

  useEffect( () => {
    checkIfWalletIsConnected();
  }, []);

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => (
    <>
    <button onClick={askContractToMintNft} disabled={nftMinting} className="cta-button connect-wallet-button">
      {nftMinting ? 'Minting NFT...' : 'Mint NFT'}
    </button>
    <div style={{marginTop: "16px"}} className="gradient-text"> {totalNFtsMinted} out of {TOTAL_MINT_COUNT} NFTs minted. Only {TOTAL_MINT_COUNT - totalNFtsMinted} remain. </div>
    </>
  )
  
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? (renderNotConnectedContainer()) : (renderMintUI())}
          <div style={{marginTop: "16px"}}>
            <button onClick={() => window.open(OPENSEA_LINK,"_blank")} className="cta-button mint-button">🌊 View Collection on OpenSea</button>
          </div>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
