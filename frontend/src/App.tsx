import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NurseDetails from './components/NurseDetails';
import Home from './components/Home';

import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nurses/:id" element={<NurseDetails />} />
      </Routes>
    </Router >
  )
}

export default App
