import * as React from 'react'
import './App.css'

export default function App() {
  const wave = () => {}

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <span className="header" aria-label="Greeting" role="img">
          😎 Hey there!
        </span>

        <p className="bio">
          I am Elliot and I love beating Magnus Carlsen at chess, that's pretty cool right? Connect your Ethereum wallet
          and wave at me!
        </p>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
      </div>
    </div>
  )
}
