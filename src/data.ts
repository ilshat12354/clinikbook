export interface Doctor {
  id: string;
  fullName: string;
  speciality: string;
  bio: string | null;
}

export interface Slot {
  id: string;
  doctorId: string;
  startAt: string;
  isBooked: boolean;
}

export type AppointmentStatus = 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  doctorId: string;
  slotId: string;
  status: AppointmentStatus;
  createdAt: string;
  doctorName: string;
  slotStartAt: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'patient' | 'admin' | 'doctor';
}

export const formatSlot = (iso: string): string => {
  const d = new Date(iso);
  return `${d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })} ${d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
};

export const canCancel = (startAt: string): boolean =>
  new Date(startAt).getTime() - Date.now() > 2 * 60 * 60 * 1000;