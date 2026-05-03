import { useState, useEffect } from 'react'
import axios from 'axios'

export function useNotifications() {
  const [tasks, setTasks] = useState([])
  const [dismissed, setDismissed] = useState(new Set(JSON.parse(localStorage.getItem('dismissedNotifications') || '[]')))
  const [permission, setPermission] = useState(Notification.permission)

  // Request permission on first visit
  useEffect(() => {
    if (permission === 'default') {
      Notification.requestPermission().then(setPermission)
    }
  }, [permission])

  // Fetch today's tasks
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    axios.get(`/api/schedule/${today}`).then(res => {
      const raw = res.data.tasks || []
      const unique = raw.filter((t, i, arr) => arr.findIndex(x => x.title === t.title) === i)
      setTasks(unique.slice(0, 8))
    }).catch(() => {})
  }, [])

  // Check every minute for upcoming tasks
  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date()
      const nowMin = now.getHours() * 60 + now.getMinutes()

      tasks.forEach(task => {
        let taskMin = 0
        if (task.start) {
          const [h, m] = task.start.split(':').map(Number)
          if (!isNaN(h) && !isNaN(m)) {
            taskMin = h * 60 + m
          }
        } else if (task.period) {
          // Try to parse period like "09:00 - 10:00"
          const match = task.period.match(/(\d{1,2}):(\d{2})/)
          if (match) {
            const h = parseInt(match[1])
            const m = parseInt(match[2])
            taskMin = h * 60 + m
          }
        }

        const diff = taskMin - nowMin

        if (diff > 0 && diff <= 5 && !dismissed.has(task.title)) {
          sendNotification(task)
        }
      })
    }

    const interval = setInterval(checkNotifications, 60000) // every minute
    checkNotifications() // check immediately

    return () => clearInterval(interval)
  }, [tasks, dismissed])

  const dismissNotification = (taskTitle) => {
    const newDismissed = new Set(dismissed)
    newDismissed.add(taskTitle)
    setDismissed(newDismissed)
    localStorage.setItem('dismissedNotifications', JSON.stringify([...newDismissed]))
  }

  const sendNotification = (task) => {
    if (permission === 'granted') {
      const n = new Notification(`Påminnelse: ${task.title}`, {
        body: `Startar ${task.start || 'snart'}`,
        icon: '/favicon.ico',
        tag: task.title,
      })

      n.onclick = () => {
        window.focus()
        window.location.href = '/idag'
        n.close()
      }

      // Auto close after 10 seconds
      setTimeout(() => n.close(), 10000)

      // Mark as dismissed to prevent repeat notifications
      dismissNotification(task.title)
    }
  }

  // Get upcoming tasks (next 3, not done, not dismissed)
  const upcoming = tasks
    .filter(t => !t.done && !dismissed.has(t.title))
    .map(t => {
      let taskMin = 0
      if (t.start) {
        const [h, m] = t.start.split(':').map(Number)
        if (!isNaN(h) && !isNaN(m)) {
          taskMin = h * 60 + m
        }
      } else if (t.period) {
        const match = t.period.match(/(\d{1,2}):(\d{2})/)
        if (match) {
          const h = parseInt(match[1])
          const m = parseInt(match[2])
          taskMin = h * 60 + m
        }
      }
      return { ...t, taskMin }
    })
    .sort((a, b) => a.taskMin - b.taskMin)
    .slice(0, 3)

  return {
    upcomingCount: upcoming.length,
    upcomingTasks: upcoming,
    dismissNotification,
  }
}