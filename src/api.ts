import type { Appointment, Doctor, Slot, User } from './data';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const getToken = () => localStorage.getItem('token');
export const setToken = (t: string | null) => {
  if (t) localStorage.setItem('token', t);
  else localStorage.removeItem('token');
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${API}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, 'Сетевая ошибка. Проверьте соединение.');
  }

  if (res.status === 401 && !path.includes('/auth/login')) {
    setToken(null);
    throw new ApiError(401, 'Требуется авторизация');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = typeof body.detail === 'string' ? body.detail : `Ошибка ${res.status}`;
    throw new ApiError(res.status, msg);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

// Нормализация snake_case → camelCase
const toUser = (u: any): User => ({
  id: u.id, email: u.email, fullName: u.full_name, role: u.role,
});
const toDoctor = (d: any): Doctor => ({
  id: d.id, fullName: d.full_name, speciality: d.speciality, bio: d.bio,
});
const toSlot = (s: any): Slot => ({
  id: s.id, doctorId: s.doctor_id, startAt: s.start_at, isBooked: s.is_booked,
});
const toAppointment = (a: any): Appointment => ({
  id: a.id, doctorId: a.doctor_id, slotId: a.slot_id,
  status: a.status, createdAt: a.created_at,
  doctorName: a.doctor_name ?? '',
  slotStartAt: a.slot_start_at ?? '',
});

// ---- Auth ----
export async function register(data: {
  email: string; password: string; full_name: string;
  role: 'patient' | 'admin' | 'doctor';
}): Promise<User> {
  return toUser(await request('/auth/register', {
    method: 'POST', body: JSON.stringify(data),
  }));
}

export async function login(email: string, password: string): Promise<User> {
  const { access_token } = await request<{ access_token: string }>('/auth/login', {
    method: 'POST', body: JSON.stringify({ email, password }),
  });
  setToken(access_token);
  return toUser(await request('/auth/me'));
}

export function logout() {
  setToken(null);
}

export async function me(): Promise<User | null> {
  if (!getToken()) return null;
  try { return toUser(await request('/auth/me')); }
  catch { return null; }
}

// ---- Doctors ----
export const fetchDoctors = async (): Promise<Doctor[]> =>
  (await request<any[]>('/doctors')).map(toDoctor);

export const fetchDoctorSlots = async (doctorId: string): Promise<Slot[]> =>
  (await request<any[]>(`/doctors/${doctorId}/slots`)).map(toSlot);

// ---- Appointments ----
export const createAppointment = async (slotId: string): Promise<Appointment> =>
  toAppointment(await request('/appointments', {
    method: 'POST', body: JSON.stringify({ slot_id: slotId }),
  }));

export const fetchMyAppointments = async (): Promise<Appointment[]> =>
  (await request<any[]>('/appointments/my')).map(toAppointment);

export const cancelAppointment = async (id: string): Promise<Appointment> =>
  toAppointment(await request(`/appointments/${id}/cancel`, { method: 'PATCH' }));

// ---- Admin ----
export const fetchSchedule = () => request<any[]>('/admin/schedule');