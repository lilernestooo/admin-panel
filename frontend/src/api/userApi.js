const BASE_URL = 'http://localhost/admin-dashboard/backend/api/users'

// requester_id is gone -- the backend now identifies the caller via the
// session cookie, not anything the client sends. Every request below needs
// credentials: 'include' so that cookie actually gets attached.

// Shared safe-fetch wrapper. Guarantees every caller gets back a plain
// { success, message } shaped object -- never a thrown exception -- even if
// the network fails or the response body isn't valid JSON (e.g. a PHP
// fatal error printed as HTML instead of the expected JSON). This is what
// was causing forms to hang forever: res.json() throwing with nothing to
// catch it meant loading states never got reset.
async function apiRequest(url, options = {}) {
  let res
  try {
    res = await fetch(url, options)
  } catch (err) {
    return { success: false, message: 'Could not reach the backend. Is the server running?' }
  }

  let body
  try {
    body = await res.json()
  } catch (err) {
    return {
      success: false,
      message: res.status === 401
        ? 'Your session has expired. Please log in again.'
        : `Unexpected server response (status ${res.status}).`,
    }
  }

  // Handle expired/invalid sessions consistently in one place.
  if (res.status === 401) {
    return { success: false, message: body.message || 'Your session has expired. Please log in again.', sessionExpired: true }
  }

  return body
}

export async function fetchUsers() {
  return apiRequest(`${BASE_URL}/list.php?_t=${Date.now()}`, {
    credentials: 'include',
  })
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
  return apiRequest(`${BASE_URL}/register.php`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function updateUser(payload) {
  return apiRequest(`${BASE_URL}/update.php`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function deleteUser(rec_id) {
  return apiRequest(`${BASE_URL}/delete.php`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rec_id }),
  })
}

export async function loginUser(payload) {
  return apiRequest(`${BASE_URL}/login.php`, {
    method: 'POST',
    credentials: 'include', // lets the browser store the session cookie the backend sets
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function logoutUser() {
  return apiRequest(`${BASE_URL}/logout.php`, {
    method: 'POST',
    credentials: 'include',
  })
}

export async function verifyPassword(payload) {
  // payload should now just be { password } -- the backend checks the
  // logged-in session's own account, it no longer accepts/trusts a userid.
  return apiRequest(`${BASE_URL}/verify_password.php`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function fetchAuditLogs() {
  return apiRequest(`${BASE_URL}/list_audit.php`, {
    credentials: 'include',
  })
}