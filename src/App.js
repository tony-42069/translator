// src/App.js
import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TranslationApp from './components/TranslationApp';
import SuccessPage from './components/SuccessPage';
import CancelPage from './components/CancelPage';

function App() {
  return (
    <ChakraProvider>
      <CSSReset />
      <Router>
        <Routes>
          <Route path="/" element={<TranslationApp />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/cancel" element={<CancelPage />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
