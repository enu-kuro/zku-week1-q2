import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { MetaMaskInpageProvider } from '@metamask/providers'
import NFTContract from '../NFT.json'
declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    ethereum: MetaMaskInpageProvider
  }
}

const DEPLOYED_CONTRACT_ADDRES = '0x0da35F21BF57745FB9f1B53D7A657B5c707563aB'

const mint = () => {
  const [loading, setLoading] = useState(false)
  const [minted, setMinted] = useState(false)
  const [currentAccount, setCurrentAccount] = useState('')
  const [correctNetwork, setCorrectNetwork] = useState(false)

  // Checks if wallet is connected
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window
    if (ethereum) {
      console.log('Got the ethereum obejct: ', ethereum)
    } else {
      console.log('No Wallet found. Connect Wallet')
    }

    const accounts = (await ethereum.request({
      method: 'eth_accounts',
    })) as string[]

    if (accounts.length !== 0) {
      console.log('Found authorized Account: ', accounts[0])
      setCurrentAccount(accounts[0])
    } else {
      console.log('No authorized account found')
    }
  }

  // Calls Metamask to connect wallet on clicking Connect Wallet button
  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        console.log('Metamask not detected')
        return
      }
      const chainId = await ethereum.request({ method: 'eth_chainId' })
      console.log('Connected to chain:' + chainId)

      const rinkebyChainId = '0x4'

      if (chainId !== rinkebyChainId) {
        window.alert('You are not connected to the Rinkeby Testnet!')
        return
      }

      const accounts = (await ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[]

      console.log('Found account', accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log('Error connecting to metamask', error)
    }
  }

  // Checks if wallet is connected to the correct network
  const checkCorrectNetwork = async () => {
    const { ethereum } = window
    const chainId = await ethereum.request({ method: 'eth_chainId' })
    console.log('Connected to chain:' + chainId)

    const rinkebyChainId = '0x4'

    if (chainId !== rinkebyChainId) {
      setCorrectNetwork(false)
    } else {
      setCorrectNetwork(true)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected()
    checkCorrectNetwork()
  }, [])

  // Creates transaction to mint NFT on clicking Mint Character button
  const mintNFT = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        // TODO: fix type error....
        const provider = new ethers.providers.Web3Provider(ethereum as any)
        const signer = provider.getSigner()
        const nftContract = new ethers.Contract(
          DEPLOYED_CONTRACT_ADDRES,
          NFTContract.abi,
          signer
        )
        setLoading(true)
        const nftTx = await nftContract.mint(await signer.getAddress())
        console.log('Mining....', nftTx.hash)

        const tx = await nftTx.wait()
        setLoading(false)
        setMinted(true)
        console.log('Mined!', tx)
        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTx.hash}`
        )
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log('Error minting character', error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#f3f6f4] pt-32 text-[#6a50aa]">
      <div className="trasition transition duration-500 ease-in-out hover:rotate-180 hover:scale-105"></div>
      <h2 className="mb-20 mt-12 text-3xl font-bold">Mint your NFT!</h2>
      {currentAccount === '' ? (
        <button
          className="mb-10 rounded-lg bg-[#f1c232] py-3 px-12 text-2xl font-bold transition duration-500 ease-in-out hover:scale-105"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      ) : correctNetwork ? (
        <button
          disabled={loading}
          className="mb-10 rounded-lg bg-[#f1c232] py-3 px-12 text-2xl font-bold transition duration-500 ease-in-out hover:scale-105"
          onClick={mintNFT}
        >
          Mint NFT
        </button>
      ) : (
        <div className="mb-20 flex flex-col items-center justify-center gap-y-3 text-2xl font-bold">
          <div>----------------------------------------</div>
          <div>Please connect to the Rinkeby Testnet</div>
          <div>and reload the page</div>
          <div>----------------------------------------</div>
        </div>
      )}
      {loading && (
        <div className="flex flex-col items-center justify-center">
          <div className="text-lg font-bold">Processing your transaction</div>
        </div>
      )}
      {minted && <div>minted!</div>}
    </div>
  )
}

export default mint
