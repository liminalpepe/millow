import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import MinList from "./components/MintList";
import HomePage from "./components/HomePage";
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// ABIs
import RealEstate from './abis/RealEstate.json'
import Escrow from './abis/Escrow.json'

// Config
import config from './config.json';

export default function App() {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [escrow, setEscrow] = useState(null)
  const [realEstate, setRealEstate] = useState(null)
  const [houses, setHouses] = useState([])

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    const network  = await provider.getNetwork()

    const realEstate = new ethers.Contract(config[network.chainId].realEstate.address, RealEstate, provider)
    setRealEstate(realEstate)
    const totalSupply = await realEstate.totalSupply()
    const houses = []
    for(var i = 1; i <= totalSupply; i++) {
      try {
        const uri = await realEstate.tokenURI(i)
        const response = await fetch(uri)

        const metadata = await response.json()
        houses.push(metadata)
      } catch(e) {
        console.warn(e)
      }
    }

    setHouses(houses)
    const escrow = new ethers.Contract(config[network.chainId].escrow.address, Escrow, provider)
    setEscrow(escrow)

    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = ethers.utils.getAddress(accounts[0])
      setAccount(account);
    })
    const accounts = window.ethereum.request({ 'method': 'eth_requestAccounts' });
    setAccount(accounts[0])
  }

  const SellHouses = () => {
    return <MinList { ...{account, houses, provider, escrow, realEstate} } />
  }

  const HomePageHouses = (houses) => {
    return <HomePage { ...{account, houses, provider, escrow, realEstate} } />
  }

  useEffect(() => {
    loadBlockchainData()
  }, []) 

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={ <Layout account={account} setAccount={setAccount} /> }>
          <Route path="/" element={ HomePageHouses(houses) }/>
          <Route path="/sell" element={ SellHouses() }/>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}