import React from 'react'
import "../../src/App.css"
import {useSocket} from "../context/SocketContext";

const Header = () => {
  const {isConnected} = useSocket();

  return (
    <header className='header-container'>
        <div className='header'>
            <h1>👨‍💻 Admin Chat</h1>
            <span className={`status ${isConnected ? "connected" : "disconnected"}`}>{isConnected ? "🟢Connected" : "🔴Disconnected"}</span>
        </div>
    </header>
  )
}

export default Header