import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Router from './Router/Router.jsx'
import { Provider } from 'react-redux';
import store from './store/store.js'
import './firebase';
createRoot(document.getElementById('root')).render(
   <Provider store={store}>
      <Router />
   </Provider>

)
if ('serviceWorker' in navigator) {
   window.addEventListener('load', () => {
      navigator.serviceWorker
         .register('/firebase-messaging-sw.js')
         .then(registration => {
            // console.log('✅ Service Worker registered: ', registration);
         })
         .catch(error => {
            console.error('❌ Service Worker registration failed: ', error);
         });
   });
}