import { ethers } from 'ethers'
import * as React from 'react'
import { useMemo, useState } from 'react'
import './App.css'
import { SenderDetailsModal, Spinner } from './components'
import WavePortalABI from './utils/WavePortal.json'

export default function App() {
  const contractAddress = React.useMemo(() => `0x6caE51b93769595B4cF06D5E10EF69E83d07f70e`, [])
  const contractABI = React.useMemo(() => WavePortalABI.abi, [])

  // Waves state variables
  const [checkingMXInstallation, setCheckingMXInstallation] = useState('loading')
  const [allWaves, setAllWaves] = useState({})
  const [currentAccount, setCurrentAccount] = useState('')
  const [selectedWaver, setSelectedWaver] = useState(null)
  const [fetchingWaves, setFetchingWaves] = useState(null)

  const [waveInProgress, setWaveInProgress] = useState(false)
  const [waveMessage, setWaveMessage] = useState('')

  // Function to check if Wallet is connected.
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        console.log('Make sure you have metamask installed as an extension.')
        setCheckingMXInstallation('failed')
        return
      } else {
        console.log('We have the Ethereum object:', ethereum)
        setCheckingMXInstallation('successful')
      }

      // Check if an ethereum account exists
      const accounts = await ethereum.request({ method: 'eth_accounts' })
      if (accounts.length !== 0) {
        const account = accounts[0]
        console.log('Found an authorized account:', account)
        setCurrentAccount(account)
      } else {
        console.log('No Authorized account found.')
      }
    } catch (error) {
      console.log('Error', error)
    }
  }

  // Function to connect to wallet if no account is found
  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        alert('Get Metamask Extension Already!')
        return
      } else {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        console.log('Connected', accounts[0])
        setCurrentAccount(accounts[0])
        getAllWavesData()
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Get all waves
  const getAllWavesData = async () => {
    setFetchingWaves(true)
    try {
      const { ethereum } = window

      if (ethereum) {
        // Ethereum Web3 provider
        // A "Provider" is what we use to actually talk to Ethereum nodes
        const provider = new ethers.providers.Web3Provider(ethereum)

        // Current account signature
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

        // Wave counts
        let waveCounts = await wavePortalContract.getWavesCount()

        // Wavers list
        const allWavers = await wavePortalContract.getSendersList()

        // Wavers data list
        let allWavesData = await wavePortalContract.getAllWavesData()

        let lastWavedAddress = await wavePortalContract.getLastWavedAddress()
        let lastLuckyWinner = await wavePortalContract.getLastLuckyWinner()
        let lastWavedTime = await wavePortalContract.getLastWavedTime()

        console.log(allWavesData)
        // Set all waves data
        setAllWaves({
          waveCounts: waveCounts.toNumber(),
          allWavers,
          allWavesData,
          lastWavedAddress,
          lastLuckyWinner,
          lastWavedTime,
        })
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    } finally {
      setFetchingWaves(false)
    }
  }

  // Function to send a wave
  const wave = async () => {
    setWaveInProgress(true)
    try {
      const { ethereum } = window

      if (ethereum) {
        // Ethereum Web3 provider
        // A "Provider" is what we use to actually talk to Ethereum nodes
        const provider = new ethers.providers.Web3Provider(ethereum)

        // Current account signature
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

        // Send A Wave
        const waveTxn = await wavePortalContract.waveAtMe(waveMessage, { gasLimit: 300000 })
        console.log('Mining', waveTxn.hash)

        await waveTxn.wait()
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log('=============================>', error)
    } finally {
      setWaveInProgress(false)
    }
  }

  // Effect which runs wallet check
  React.useLayoutEffect(() => {
    checkIfWalletIsConnected()
    getAllWavesData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Listen for changes
  React.useEffect(() => {
    let wavePortalContract

    const onNewWave = (from, timestamp, message) => {
      setAllWaves(prevState => ({
        ...prevState,
        allWavesData: [...prevState?.allWavesData, { sender: from, timestamp, message }],
        waveCounts: prevState['allWavesData']?.length + 1,
      }))
    }

    async function getUpdatedAnalytics() {
      let lastWavedAddress = await wavePortalContract.getLastWavedAddress()
      let lastLuckyWinner = await wavePortalContract.getLastLuckyWinner()
      let lastWavedTime = await wavePortalContract.getLastWavedTime()

      setAllWaves(prevState => ({
        ...prevState,
        lastWavedAddress,
        lastLuckyWinner,
        lastWavedTime,
      }))
    }

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()

      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)
      wavePortalContract.on('NewWave', onNewWave)
      getUpdatedAnalytics()
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off('NewWave', onNewWave)
      }
    }
  }, [contractABI, contractAddress])

  let reversedWavesData = useMemo(
    () =>
      allWaves?.allWavesData
        ?.map(waver => {
          return (
            <section className="waverAddress" onClick={() => setSelectedWaver(waver)}>
              <i className="fas fa-user-alt"></i>
              <aside className="profileOverview">
                <span>{waver.sender.slice(0, 6)}</span>
                <span>{waver.message}</span>
              </aside>
              <i className="fas fa-angle-right"></i>
            </section>
          )
        })
        .reverse(),
    [allWaves],
  )

  // Close waver modal
  const closeWaverDetailsModal = () => setSelectedWaver(null)

  return (
    <div>
      <React.Fragment>
        {checkingMXInstallation === 'loading' ? (
          <div className="onBoardingScreen">
            <h2>Loading wave portal. Please wait...</h2>
          </div>
        ) : checkingMXInstallation === 'failed' ? (
          <div className="onBoardingScreen">
            <span className="header" aria-label="Greeting" role="img">
              😥
            </span>
            <h2 style={{ maxWidth: '600px', textAlign: 'center' }}>
              You must <a href="https://metamask.io/">install Metamax</a> to connect to my portal and send me a wave.
            </h2>
          </div>
        ) : (
          <React.Fragment>
            {!currentAccount ? (
              <section className="onBoardingScreen">
                <div className="onboardingContainer">
                  <span className="header" aria-label="Greeting" role="img">
                    😎 Hi! Welcome to my WavePortal!
                  </span>

                  <p className="bio">To get to my wavy world and win some ETH, you must connect to my portal.</p>

                  <button className="waveButton-inverted" onClick={connectWallet}>
                    Connect To Portal
                  </button>
                </div>
              </section>
            ) : (
              <React.Fragment>
                <section className="dataWrapper">
                  <div className="dataContainer">
                    <span className="header" aria-label="Greeting" role="img">
                      😎 Hey {currentAccount.slice(0, 6)}...{currentAccount.slice(-3)}!
                    </span>

                    <p className="bio">
                      I am Elliot and I love beating Magnus Carlsen at chess, that's pretty cool right? Connect your
                      Ethereum wallet and wave at me! You also stand a chance to win some ETH!
                    </p>

                    <textarea
                      className="waveMessageInput"
                      onChange={e => setWaveMessage(e.target.value)}
                      value={waveMessage}
                      name="waveMessage"
                      placeholder="Type a message to send a wave. 😋"
                      cols="30"
                      rows="5"
                    ></textarea>

                    <button className="waveButton" disabled={waveInProgress || !waveMessage} onClick={wave}>
                      {waveInProgress ? (
                        <React.Fragment>
                          Sending wave, please wait... <Spinner style={{ marginLeft: '20px' }} />{' '}
                        </React.Fragment>
                      ) : (
                        'Wave At Me'
                      )}
                    </button>
                  </div>
                  <div className="wavesSendersInfo">
                    {fetchingWaves ? (
                      <div className="wavesLoadingContainer">
                        Fetching waves data... <Spinner style={{ marginLeft: '30px' }} />{' '}
                      </div>
                    ) : (
                      <React.Fragment>
                        <div className="wavesAnalyticsInfo">
                          <h2>Wave Analytics </h2>

                          <h1 className="wavesCounter">
                            <span>
                              <i className="fas fa-users"></i>
                              Total waves
                            </span>
                            <span>{allWaves?.waveCounts || 0}</span>
                          </h1>
                          <h1 className="wavesCounter">
                            <span>
                              <i className="fas fa-history"></i>
                              Last sent date
                            </span>
                            <span>{new Date(allWaves?.lastWavedTime?.toNumber() * 1000).toDateString()}</span>
                          </h1>
                          <h1 className="wavesCounter">
                            <span title={allWaves?.lastWavedAddress}>
                              <i className="fas fa-address-book"></i>
                              Last sent Address
                            </span>
                            <span>
                              {allWaves?.lastWavedAddress?.slice(0, 6)}...{allWaves?.lastWavedAddress?.slice(-6)}
                            </span>
                          </h1>
                          <h1 className="wavesCounter">
                            <span title={allWaves?.lastLuckyWinner}>
                              <i className="fas fa-trophy"></i>
                              Last Lucky Winner
                            </span>
                            {allWaves?.lastLuckyWinner && (
                              <span>
                                {`${allWaves?.lastLuckyWinner?.slice(0, 6)}...${allWaves?.lastLuckyWinner?.slice(
                                  -6,
                                )}` || 'Nil'}
                              </span>
                            )}
                          </h1>
                        </div>

                        <section className="wavesSendersContainer">
                          <h2>
                            WaveLanders <span>{reversedWavesData?.length}</span>
                          </h2>
                          <aside className="waverAddressList">
                            {reversedWavesData?.length < 1 && <h1>No wavers found.</h1>}
                            {reversedWavesData}
                          </aside>
                        </section>
                      </React.Fragment>
                    )}
                  </div>
                </section>
              </React.Fragment>
            )}
            {selectedWaver && (
              <SenderDetailsModal
                isOpen={!!selectedWaver}
                waver={selectedWaver}
                closeModalHandler={closeWaverDetailsModal}
              />
            )}
          </React.Fragment>
        )}
      </React.Fragment>
    </div>
  )
}
