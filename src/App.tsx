import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import type { Appointment, Doctor, Slot, ToastMessage, User } from './data';
import { canCancel, formatSlot } from './data';
import {
  ApiError, cancelAppointment, createAppointment, fetchDoctorSlots,
  fetchDoctors, fetchMyAppointments, fetchSchedule, login, logout,
  me, register,
} from './api';
import {
  AppointmentCard, Button, Card, DoctorCard, EmptyState, ErrorState,
  Header, SlotPicker, Toast,
} from './components';

// ---------------- LoginPage ----------------
function LoginPage({ onLogin }: { onLogin: (u: User) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'patient' | 'admin' | 'doctor'>('patient');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'register') {
        await register({ email, password, full_name: fullName, role });
      }
      const user = await login(email, password);
      onLogin(user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-brand-700 mb-1">ClinicBook</h1>
        <p className="text-sm text-slate-500 mb-4">
          {mode === 'login' ? 'Вход в систему' : 'Регистрация'}
        </p>
        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && (
            <>
              <input
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Полное имя"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                minLength={2}
              />
              <select
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
              >
                <option value="patient">Пациент</option>
                <option value="admin">Администратор</option>
                <option value="doctor">Врач</option>
              </select>
            </>
          )}
          <input
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            type="password"
            placeholder="Пароль (минимум 6 символов)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? '...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться и войти'}
          </Button>
        </form>
        <button
          className="mt-4 text-sm text-brand-600 hover:underline"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError(null);
          }}
        >
          {mode === 'login'
            ? 'Нет аккаунта? Зарегистрироваться'
            : 'Уже есть аккаунт? Войти'}
        </button>
      </Card>
    </div>
  );
}

// ---------------- HomePage ----------------
function HomePage() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoadingDoctors(true);
    fetchDoctors()
      .then(setDoctors)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingDoctors(false));
  }, []);

  useEffect(() => {
    if (!doctorId) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    setError(null);
    fetchDoctorSlots(doctorId)
      .then(setSlots)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingSlots(false));
  }, [doctorId]);

  const handleConfirm = async () => {
    if (!slotId) return;
    setSubmitting(true);
    setError(null);
    try {
      await createAppointment(slotId);
      navigate('/appointments');
    } catch (e: any) {
      setError(e.message ?? 'Ошибка');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-xl sm:text-2xl font-semibold mb-1">Запись на приём</h1>
        <p className="text-sm text-slate-500">Выберите специалиста, дату и удобное время.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium">1. Специалист</h2>
        {loadingDoctors ? (
          <p className="text-slate-500 text-sm">Загрузка врачей…</p>
        ) : doctors.length === 0 ? (
          <EmptyState title="Нет доступных врачей" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {doctors.map((doc) => (
              <DoctorCard
                key={doc.id}
                doctor={doc}
                selected={doc.id === doctorId}
                onSelect={(id) => {
                  setDoctorId(id);
                  setSlotId(null);
                }}
              />
            ))}
          </div>
        )}
      </section>

      {doctorId && (
        <section className="space-y-3">
          <h2 className="text-base font-medium">2. Время</h2>
          {loadingSlots ? (
            <p className="text-slate-500 text-sm">Загрузка слотов…</p>
          ) : (
            <SlotPicker slots={slots} selectedId={slotId} onSelect={setSlotId} />
          )}
        </section>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={handleConfirm} disabled={!doctorId || !slotId || submitting}>
          {submitting ? '...' : 'Подтвердить запись'}
        </Button>
      </div>
    </div>
  );
}

// ---------------- MyAppointmentsPage ----------------
function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pushToast = (type: ToastMessage['type'], text: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };

  const load = () => {
    setLoading(true);
    setError(null);
    fetchMyAppointments()
      .then(setAppointments)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id: string) => {
    try {
      const updated = await cancelAppointment(id);
      setAppointments((list) => list.map((a) => (a.id === id ? updated : a)));
      pushToast('success', 'Запись отменена');
    } catch (e: any) {
      pushToast('error', e.message ?? 'Ошибка');
    }
  };

  if (loading) return <p className="text-slate-500 text-sm">Загрузка…</p>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (appointments.length === 0) return <EmptyState title="У вас пока нет записей" />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl sm:text-2xl font-semibold">Мои визиты</h1>
      <div className="space-y-3">
        {appointments.map((a) => (
          <AppointmentCard
            key={a.id}
            appointment={a}
            doctorName={a.doctorName}
            slotLabel={a.slotStartAt ? formatSlot(a.slotStartAt) : '—'}
            canCancel={a.slotStartAt ? canCancel(a.slotStartAt) : false}
            onCancel={handleCancel}
          />
        ))}
      </div>
      <Toast toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </div>
  );
}

// ---------------- AdminPage ----------------
function AdminPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('');

  useEffect(() => {
    fetchSchedule()
      .then(setRows)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const dates = useMemo(
    () => Array.from(new Set(rows.map((r) => r.start_at?.slice(0, 10) ?? ''))).sort(),
    [rows]
  );
  const filtered = dateFilter ? rows.filter((r) => r.start_at.startsWith(dateFilter)) : rows;

  if (loading) return <p className="text-slate-500 text-sm">Загрузка…</p>;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl sm:text-2xl font-semibold">Расписание</h1>
      <div className="flex flex-wrap gap-2">
        {dates.map((d) => (
          <button
            key={d}
            onClick={() => setDateFilter(d === dateFilter ? '' : d)}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              d === dateFilter
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white border-slate-300'
            }`}
          >
            {d}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="Записей нет" />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-2xl overflow-hidden border border-slate-100">
            <thead className="bg-slate-100 text-left text-sm">
              <tr>
                <th className="px-4 py-2">Врач</th>
                <th className="px-4 py-2">Время</th>
                <th className="px-4 py-2">Статус</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.slot_id} className="border-t border-slate-100 text-sm">
                  <td className="px-4 py-2">{r.doctor_name}</td>
                  <td className="px-4 py-2">{formatSlot(r.start_at)}</td>
                  <td className="px-4 py-2">{r.is_booked ? 'Занято' : 'Свободно'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------- App ----------------
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    me().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Загрузка…
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} onLogout={handleLogout} />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <Routes>
          <Route
            path="/"
            element={user.role === 'patient' ? <HomePage /> : <Navigate to="/admin" replace />}
          />
          <Route
            path="/appointments"
            element={user.role === 'patient' ? <MyAppointmentsPage /> : <Navigate to="/admin" replace />}
          />
          <Route
            path="/admin"
            element={
              user.role === 'admin' || user.role === 'doctor'
                ? <AdminPage />
                : <Navigate to="/" replace />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}