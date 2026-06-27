const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

async function request(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()

  if (!res.ok) {
    const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Request failed'
    throw new Error(msg)
  }

  return data.data ?? data
}

const getToken = () => localStorage.getItem('accessToken')

// Multipart upload (no JSON Content-Type — the browser sets the boundary).
async function upload(path, formData, token) {
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, { method: 'POST', headers, body: formData })
  const data = await res.json()
  if (!res.ok) {
    const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Upload failed'
    throw new Error(msg)
  }
  return data.data ?? data
}

export const api = {
  get:   (path)        => request('GET',   path, undefined, getToken()),
  post:  (path, body)  => request('POST',  path, body,      getToken()),
  patch: (path, body)  => request('PATCH', path, body,      getToken()),
  upload: (path, formData) => upload(path, formData, getToken()),

  // Auth-specific: no stored token needed (registration / login flows)
  postPublic: (path, body) => request('POST', path, body, null),
}

// ---- Auth helpers ----
export const authApi = {
  schoolStep1:        (body)           => api.postPublic('/auth/register/school/step1', body),
  schoolStep2:        (draftId, body)  => api.postPublic(`/auth/register/school/step2/${draftId}`, body),
  schoolStep3:        (draftId, body)  => api.postPublic(`/auth/register/school/step3/${draftId}`, body),
  individualRegister: (body)           => api.postPublic('/auth/register/individual', body),
  login:              (body)           => api.postPublic('/auth/login', body),
  // Passwordless student entry — identified by school + class + roll number.
  studentLogin:       (body)           => api.postPublic('/auth/student-login', body),
  logout:             ()               => api.post('/auth/logout'),
  me:                 ()               => api.get('/auth/me'),
}

// ---- Student pet / progress / leaderboard helpers ----
export const studentApi = {
  progress:        ()      => api.get('/students/me/progress'),
  questComplete:   (body)  => api.post('/students/me/quest-complete', body),
  classStandings:  ()      => api.get('/students/standings/class'),
  schoolStandings: ()      => api.get('/students/standings/school'),
}

// ---- Recommendation helpers (DB-driven) ----
export const recommendationsApi = {
  // Map a day's quest answers → tomorrow's action list.
  forQuest: (answers) => api.post('/recommendations/quest', { answers }),
  list:     (audience) => api.get(`/recommendations${audience ? `?audience=${audience}` : ''}`),
}

// ---- Lessons (Duolingo-style roadmap) ----
export const lessonsApi = {
  list:     ()   => api.get('/lessons'),
  complete: (id) => api.post(`/lessons/${id}/complete`),
}

// ---- Emission factors (admin-editable, CSV upload) ----
export const factorsApi = {
  list: () => api.get('/emission-factors'),
  upload: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.upload('/emission-factors/upload', fd)
  },
}

// ---- Carbon audit helpers ----
// `body` is the tier-aware payload: { academicYear, month?, enrollment?, areaType?,
//   electricity:{...}, generator:{...}, commute:{...}, paper:{...}, waste:{...}, ... }
export const carbonApi = {
  submit:       (body)       => api.post('/carbon-audits', body),
  mySchool:     ()           => api.get('/carbon-audits/my-school'),
  getById:      (id)         => api.get(`/carbon-audits/${id}`),
  leaderboard:  (limit = 10) => api.get(`/carbon-audits/leaderboard?limit=${limit}`),
}

// ---- OMR scanning helpers ----
export const omrApi = {
  // Scan a filled OMR sheet image → { sheet, submit, answers, audit }.
  scan: (file, sheet = 'school') => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('sheet', sheet)
    return api.upload('/omr/scan', fd)
  },
  // Scan + submit/calculate in one step (school sheet).
  scanAndSubmit: (file, academicYear, month = 0, sheet = 'school') => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('academicYear', String(academicYear))
    fd.append('month', String(month))
    fd.append('sheet', sheet)
    return api.upload('/omr/scan-and-submit', fd)
  },
}
