// src/App.js
import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import TranslationApp from './components/TranslationApp';

function App() {
  return (
    <ChakraProvider>
      <CSSReset />
      <TranslationApp />
    </ChakraProvider>
  );
}

export default App;