const BASE_URL = 'http://localhost/admin-dashboard/backend/api/users'

function getRequesterId() {
  const storedUser = JSON.parse(localStorage.getItem('admin_user') || '{}')
  return storedUser.userid || null
}

export async function fetchUsers() {
  const requesterId = getRequesterId()
  const res = await fetch(`${BASE_URL}/list.php?requester_id=${encodeURIComponent(requesterId)}&_t=${Date.now()}`)
  return res.json()
}

// Used by the standalone Edit User tab, which only has a rec_id from the
// URL and needs that one user's data. There's no dedicated single-user
// endpoint on the backend, so we reuse list.php and pick the record out
// client-side. If this list ever gets large, swap this for a real
// "get_one.php?rec_id=" endpoint instead.
export async function fetchUserById(rec_id) {
  const res = await fetchUsers()
  if (!res.success) return res

  const user = res.data.find((u) => String(u.rec_id) === String(rec_id))
  return user
    ? { success: true, data: user }
    : { success: false, message: 'User not found' }
}

export async function registerUser(payload) {
  const res = await fetch(`${BASE_URL}/register.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, requester_id: getRequesterId() }),
  })
  return res.json()
}

export async function updateUser(payload) {
  const res = await fetch(`${BASE_URL}/update.php`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, requester_id: getRequesterId() }),
  })
  return res.json()
}

export async function deleteUser(rec_id) {
  const res = await fetch(`${BASE_URL}/delete.php`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rec_id, requester_id: getRequesterId() }),
  })
  return res.json()
}

export async function loginUser(payload) {
  const res = await fetch(`${BASE_URL}/login.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return res.json()
}

export async function verifyPassword(payload) {
  const res = await fetch(`${BASE_URL}/verify_password.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return res.json()
}

export async function fetchAuditLogs() {
  const requesterId = getRequesterId()
  const res = await fetch(`${BASE_URL}/list_audit.php?requester_id=${encodeURIComponent(requesterId)}`)
  return res.json()
}