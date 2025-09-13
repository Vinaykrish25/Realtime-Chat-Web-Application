import React from 'react'
import Homepage from './pages/Homepage'
import CustomerPage from './pages/CustomerPage';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Header from './components/Header';

const App = () => {
  return (
    <div>
      <Header />
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<Homepage />}/>
        <Route path='/customer-chat' element={<CustomerPage />}/>
      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App