import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import ErrorBoundary from './components/ErrorBoundary';

import { SearchProvider } from './context/SearchContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <SearchProvider>
        <App />
      </SearchProvider>
    </ErrorBoundary>
  </StrictMode>,
)
