import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.scss';
import FallBackPage from './components/FallbackPage';
import { ErrorBoundary } from 'react-error-boundary';
import { store } from './redux/store';
import { Provider } from 'react-redux';
import ToastProvider from './components/ToastProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary fallbackRender={FallBackPage}>
    <Provider store={store}>
      <App />
      <ToastProvider />
    </Provider>
  </ErrorBoundary>
);
