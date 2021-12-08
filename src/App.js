import * as React from 'react'
import './App.css'
export default function App() {
  const wave = () => {}

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <span className="header" aria-label="Greeting" role="img">
          👋 Hey there!
        </span>

        <div className="bio">
          I am farza and I worked on self-driving cars so that's pretty cool right? Connect your Ethereum wallet and
          wave at me!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
      </div>
    </div>
  )
}
