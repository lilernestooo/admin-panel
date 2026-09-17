const BASE_URL = 'http://localhost/admin-dashboard/backend/api/dealers'

// Same safe-fetch wrapper as userApi.js -- guarantees callers always get
// back a plain { success, message } shaped object, never a thrown
// exception, even on network failure or a non-JSON response body.
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

  if (res.status === 401) {
    return { success: false, message: body.message || 'Your session has expired. Please log in again.', sessionExpired: true }
  }

  return body
}

export async function fetchDealers() {
  return apiRequest(`${BASE_URL}/list.php?_t=${Date.now()}`, {
    credentials: 'include',
  })
}

// No dedicated single-dealer endpoint on the backend -- same approach as
// fetchUserById, reuse list.php and pick the record out client-side.
export async function fetchDealerById(rec_id) {
  const res = await fetchDealers()
  if (!res.success) return res

  const dealer = res.data.find((d) => String(d.rec_id) === String(rec_id))
  return dealer
    ? { success: true, data: dealer }
    : { success: false, message: 'Dealer not found' }
}

export async function createDealer(payload) {
  return apiRequest(`${BASE_URL}/save.php`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function updateDealer(payload) {
  return apiRequest(`${BASE_URL}/update.php`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function deleteDealer(rec_id) {
  return apiRequest(`${BASE_URL}/delete.php`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rec_id }),
  })
}