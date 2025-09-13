import React from 'react'
import Homepage from './pages/Homepage'
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Header from './components/Header';
import AdminPage from './pages/AdminPage';

const App = () => {
  return (
    <div>
      <Header />
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Homepage />}/>
        <Route path='/admin-chat' element={<AdminPage />}/>
      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App