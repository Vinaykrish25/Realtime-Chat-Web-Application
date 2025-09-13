import React, { useState } from 'react'
import ChatList from '../components/ChatList'
import ChatWindow from '../components/ChatWindow'

const AdminPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className='chatpage-container'>
      <ChatList selectedChat={selectedChat} setSelectedChat={setSelectedChat}/>
      <ChatWindow selectedChat={selectedChat} setSelectedChat={setSelectedChat}/>
    </div>
  )
}

export default AdminPage