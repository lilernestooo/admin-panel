export const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

export function startSession() {
  const now = Date.now()
  localStorage.setItem('login_time', now)
  localStorage.setItem('last_activity', now)
}

export function refreshActivity() {
  localStorage.setItem('last_activity', Date.now())
}

export function isSessionExpired() {
  const loginTime = Number(localStorage.getItem('login_time'))
  const lastActivity = Number(localStorage.getItem('last_activity'))

  if (!loginTime || !lastActivity) return true

  const now = Date.now()
  const absoluteExpired = now - loginTime > SESSION_TIMEOUT_MS
  const idleExpired = now - lastActivity > SESSION_TIMEOUT_MS

  return absoluteExpired || idleExpired
}

export function clearSession() {
  localStorage.removeItem('admin_user')
  localStorage.removeItem('login_time')
  localStorage.removeItem('last_activity')
}