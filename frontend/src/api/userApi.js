const BASE_URL = 'http://localhost/admin-dashboard/backend/api/users'

export async function fetchUsers() {
  const res = await fetch(`${BASE_URL}/list.php`)
  return res.json()
}

export async function registerUser(payload) {
  const res = await fetch(`${BASE_URL}/register.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return res.json()
}

export async function updateUser(payload) {
  const res = await fetch(`${BASE_URL}/update.php`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return res.json()
}

export async function deleteUser(rec_id) {
  const res = await fetch(`${BASE_URL}/delete.php`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rec_id }),
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