import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.scss';
import FallBackPage from './components/FallbackPage';
import { ErrorBoundary } from 'react-error-boundary';
import { store } from './redux/store';
import { Provider } from 'react-redux';
import ToastProvider from './components/ToastProvider';
// @ts-ignore
import { IdentityKitProvider } from '@nfid/identitykit/react';
import { Plug } from '@nfid/identitykit';
import '@nfid/identitykit/react/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary fallbackRender={FallBackPage}>
    <IdentityKitProvider signers={[Plug]}>
      <Provider store={store}>
        <App />
        <ToastProvider />
      </Provider>
    </IdentityKitProvider>
  </ErrorBoundary>
);
