import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Registrera service worker för push-notiser
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')

      // Begär notis-tillstånd
      if (Notification.permission === 'default') {
        const perm = await Notification.requestPermission()
        if (perm === 'granted') {
          // Hämta wake_time från profil och skicka till SW
          const token = localStorage.getItem('token')
          if (token) {
            fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
              .then(r => r.json())
              .then(data => {
                reg.active?.postMessage({
                  type: 'SCHEDULE_NOTIFICATIONS',
                  wakeTime: data.wake_time || '08:00'
                })
              })
              .catch(() => {})
          }
        }
      } else if (Notification.permission === 'granted') {
        const token = localStorage.getItem('token')
        if (token) {
          fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(data => {
              reg.active?.postMessage({
                type: 'SCHEDULE_NOTIFICATIONS',
                wakeTime: data.wake_time || '08:00'
              })
            })
            .catch(() => {})
        }
      }
    } catch (err) {
      console.log('SW registration failed:', err)
    }
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
