import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.scss';
import FallBackPage from './components/FallbackPage';
import { ErrorBoundary } from 'react-error-boundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary fallbackRender={FallBackPage}>
    <App />
  </ErrorBoundary>
);
