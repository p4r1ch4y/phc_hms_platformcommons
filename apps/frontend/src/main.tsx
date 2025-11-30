import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext'

// PWA: register service worker and capture beforeinstallprompt for install flow
// Uses virtual module provided by `vite-plugin-pwa`
declare global {
  interface Window {
    deferredPrompt?: any;
  }
}

try {
  // `virtual:pwa-register` is injected by the plugin at build time
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { registerSW } = await import('virtual:pwa-register');
  const updateSW = registerSW({
    onRegistered(r?: ServiceWorkerRegistration | null) {
      // r is the ServiceWorkerRegistration
      console.log('Service worker registered:', r);
    },
    onRegisterError(err: any) {
      console.error('SW registration error:', err);
    }
  });
  // expose update function for debugging / manual update
  (window as any).__updateSW = updateSW;
} catch (e) {
  // plugin may not be installed in some environments — ignore
  console.debug('PWA: registerSW not available', e);
}

// Capture the beforeinstallprompt so the app UI can offer an "Install" action
window.addEventListener('beforeinstallprompt', (e: any) => {
  e.preventDefault();
  window.deferredPrompt = e;
  // notify UI components that PWA install can be shown
  window.dispatchEvent(new CustomEvent('pwa-install-available'));
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
