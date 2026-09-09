const BASE_URL = 'http://localhost/admin-dashboard/backend/api/appointments'

function getRequesterId() {
  const storedUser = JSON.parse(localStorage.getItem('admin_user') || '{}')
  return storedUser.userid || null
}

export async function fetchAppointments(userRecId) {
  const requesterId = getRequesterId()
  const res = await fetch(
    `${BASE_URL}/list.php?user_rec_id=${encodeURIComponent(userRecId)}&requester_id=${encodeURIComponent(requesterId)}`
  )
  return res.json()
}

export async function saveAppointment(payload) {
  const res = await fetch(`${BASE_URL}/save.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, requester_id: getRequesterId() }),
  })
  return res.json()
}

export async function deleteAppointment(appointment_id) {
  const res = await fetch(`${BASE_URL}/delete.php`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appointment_id, requester_id: getRequesterId() }),
  })
  return res.json()
}