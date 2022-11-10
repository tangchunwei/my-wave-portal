import React ,{useEffect,useState} from 'react';
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";
const getEthereumObject = ()=>window.ethereum;

const findMetaMaskAccount = async () =>{
  try{
    const ethereum = getEthereumObject();

    if(!ethereum){
      console.log("Make sure you have MetaMask!");
      return null;
    }

    console.log("We have the ethereum object",ethereum);
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if(accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:",account);
      return account;

    }else{
      console.log("No authorized account found");
      return null;
    }


  }catch(error){
    console.log(error);
    return null;
  }
}
const App = ()  => {

  const [currentAccount,setCurrentAccount] = useState("");
  const {ethereum} = window;
  const [allWaves,setAllWaves] = useState([]);
  const contractAddress = "0x636D9923A9B51c41C4348AAc8C26F17a5eb92326";
  const contractABI = abi.abi;
  const connectWallet = async () =>{
    try{
      const ethereum = getEthereumObject();
      if(!ethereum){
        alert("Get MetaMask!");
        return ;
      }

      
      const accounts = await ethereum.request({method:"eth_requestAccounts"});
      console.log("Connected",accounts[0]);
      setCurrentAccount(accounts[0]);
      await getAllWaves();
    }catch(error){
      console.log(error);
    }
  }
  useEffect( ()=>{
    const fetchData = async ()=>{
      return await findMetaMaskAccount()
    }
    const account = fetchData();
    if(account !== null){
      setCurrentAccount(account);
    }
  },[]);

  const wave = async () =>{
    try{
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const singer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress,contractABI,singer);
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...",count.toNumber());

        const waveTxn = await wavePortalContract.wave("this is a message");
        console.log("Mining...",waveTxn.hash);

        await  waveTxn.wait();
        console.log("Mind -- ",waveTxn.hash);
        

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...",count.toNumber());
        await getAllWaves();
      }else{
        console.log("Ethereum object doesn't exist!");


      }
    }catch(error){
      console.log(error);
    }
  }

  const getAllWaves = async ()=>{
    try{
      const {ethereum } = window;
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const singer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress,contractABI,singer);

        const waves = await wavePortalContract.getAllWaves();

        let waveCleaned = [];
        waves.forEach(wave =>{
          waveCleaned.push({
            address:wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message:wave.message
          })
        })

        setAllWaves(waveCleaned);
      }else{
        console.log("Ethereum object doesn't exist!");
      }
    }catch(error){
      console.log(error);
    }
  }
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        I am farza and I worked on self-driving cars so that's pretty cool right? Connect your Ethereum wallet and wave at me!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {currentAccount && (
          <button className = "waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves.map((wave,index) => {
          return (
            <div key={index} style = {{backgroundColor:"OldLace",marginTop:"16px",padding:"8px"}}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default App;
