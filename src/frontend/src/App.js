import Layout from './components/Layout';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from './styles/theme';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Web3ReactProvider } from '@web3-react/core';
import { getLibrary } from './components/Wallet';
import TokenOperations from './features/TokenOperations';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path='/' element={<TokenOperations/>} />
              <Route path='/liquidity/*' element={<div>Liquidity</div>} />
              <Route path='/stake/*' element={<div>Stake</div>} />
              <Route path='/farm/*' element={<div>Farm</div>} />
              <Route path='/loan/*' element={<div>Loan</div>} />
              <Route path='/swap' element={<div>Swap</div>} />
            </Routes>
          </Layout>
        </BrowserRouter>
        <ToastContainer />
      </ThemeProvider>
    </Web3ReactProvider>
  );
}

export default App;