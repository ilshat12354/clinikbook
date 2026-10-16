// Все UI-компоненты проекта в одном файле.
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Appointment, Doctor, Slot, ToastMessage, User } from './data';
import { formatSlot } from './data';


// --- Button ---
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
  children: ReactNode;
};
const btnStyles = {
  primary: 'bg-brand-600 hover:bg-brand-700 text-white',
  secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-800',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
};
export function Button({ variant = 'primary', children, className = '', ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition ${btnStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

// --- Card ---
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-5 ${className}`}>{children}</div>;
}

// --- EmptyState / LoadingState / ErrorState ---
export function EmptyState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="text-center py-10 border border-dashed border-slate-300 rounded-2xl">
      <p className="text-slate-500 mb-3">{title}</p>
      {action}
    </div>
  );
}
export function LoadingState({ text = 'Загрузка…' }: { text?: string }) {
  return <div className="py-10 text-center text-slate-500">{text}</div>;
}
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="py-10 text-center">
      <p className="text-red-600 mb-3">{message}</p>
      {onRetry && <Button variant="secondary" onClick={onRetry}>Повторить</Button>}
    </div>
  );
}

// --- Header ---
const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-brand-600 text-white' : 'text-slate-700 hover:bg-slate-200'}`;
export function Header({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link to="/" className="text-lg font-semibold text-brand-700">ClinicBook</Link>
        <nav className="flex flex-wrap gap-2 items-center">
          {user.role === 'patient' && (
            <>
              <NavLink to="/" className={linkClass} end>Запись</NavLink>
              <NavLink to="/appointments" className={linkClass}>Мои визиты</NavLink>
            </>
          )}
          {(user.role === 'admin' || user.role === 'doctor') && (
            <NavLink to="/admin" className={linkClass}>Расписание</NavLink>
          )}
          <span className="text-xs text-slate-500 ml-2">{user.fullName}</span>
          <button
            onClick={onLogout}
            className="text-xs text-slate-500 hover:text-red-600 px-2 py-1"
          >
            Выйти
          </button>
        </nav>
      </div>
    </header>
  );
}

// --- DoctorCard ---
export function DoctorCard({ doctor, selected, onSelect }: { doctor: Doctor; selected: boolean; onSelect: (id: string) => void }) {
  return (
    <Card className={selected ? 'ring-2 ring-brand-500' : ''}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="font-semibold">{doctor.fullName}</p>
          <p className="text-sm text-slate-500">{doctor.speciality}</p>
          <p className="text-xs text-slate-400 mt-1">{doctor.bio}</p>
        </div>
        <Button variant={selected ? 'primary' : 'secondary'} onClick={() => onSelect(doctor.id)}>
          {selected ? 'Выбран' : 'Выбрать'}
        </Button>
      </div>
    </Card>
  );
}

// --- SlotPicker ---
export function SlotPicker({ slots, selectedId, onSelect }: { slots: Slot[]; selectedId: string | null; onSelect: (id: string) => void }) {
  if (slots.length === 0) {
    return <p className="text-sm text-slate-500 py-4" data-testid="no-slots">Нет свободных слотов. Выберите другого врача или дату.</p>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {slots.map((s) => {
        const active = s.id === selectedId;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`px-3 py-2 rounded-lg border text-sm ${active ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-slate-300 hover:border-brand-500'}`}
          >
            {formatSlot(s.startAt)}
          </button>
        );
      })}
    </div>
  );
}

// --- AppointmentCard ---
const statusLabels: Record<Appointment['status'], string> = {
  confirmed: 'Подтверждён',
  cancelled: 'Отменён',
  completed: 'Завершён',
};
export function AppointmentCard({
  appointment, doctorName, slotLabel, canCancel, onCancel,
}: {
  appointment: Appointment; doctorName: string; slotLabel: string; canCancel: boolean; onCancel: (id: string) => void;
}) {
  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="font-semibold">{doctorName}</p>
          <p className="text-sm text-slate-500">{slotLabel}</p>
          <p className="text-xs mt-1">Статус: <span className="font-medium">{statusLabels[appointment.status]}</span></p>
        </div>
        {appointment.status === 'confirmed' && canCancel && (
          <Button variant="danger" onClick={() => onCancel(appointment.id)}>Отменить</Button>
        )}
        {appointment.status === 'confirmed' && !canCancel && (
          <p className="text-xs text-slate-400">Отмена возможна не позднее чем за 2 часа. Позвоните в клинику.</p>
        )}
      </div>
    </Card>
  );
}

// --- Toast ---
const toastColors: Record<ToastMessage['type'], string> = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-slate-800',
};
export function Toast({ toasts, onDismiss }: { toasts: ToastMessage[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${toastColors[t.type]} text-white px-4 py-2 rounded-lg shadow-lg text-sm cursor-pointer`}
          onClick={() => onDismiss(t.id)}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}