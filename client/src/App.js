import './App.css';
import '@radix-ui/themes/styles.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Theme } from '@radix-ui/themes';
import Result from './Result/Result';
import Home from './Home/Home';
import Header from './Header';

function App() {
  return (
    <Theme appearance="dark">
      <Router>
        <div className="App">
          <header className="App-header">
            <div className='m-10'>
				<Header />
				<Routes>
					<Route path="/upload" element={<Home />} />
					<Route path="/result" element={<Result />} />
					<Route path="/" element={<Home />} />
				</Routes>
            </div>
          </header>
        </div>
      </Router>
    </Theme>
  );
}

export default App;