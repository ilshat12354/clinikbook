// Все автотесты проекта в одном файле: 12 тестов.
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App, { ErrorState } from '../App';
import { AppointmentCard, EmptyState } from '../components';
import {
  canCancel, formatSlot, getAvailableSlots, getDoctorById, doctors, slots,
} from '../data';

// --- utils ---
describe('utils', () => {
  it('returns only free slots for the doctor', () => {
    const result = getAvailableSlots(slots, 'd1');
    expect(result.every((s) => s.doctorId === 'd1' && !s.isBooked)).toBe(true);
  });

  it('returns empty array for unknown doctor', () => {
    expect(getAvailableSlots(slots, 'unknown')).toEqual([]);
  });

  it('formats slot as DD.MM HH:mm', () => {
    expect(formatSlot('2025-05-12T10:30:00')).toMatch(/\d{2}\.\d{2}\s\d{2}:\d{2}/);
  });

  it('canCancel is false for a slot in the past', () => {
    expect(canCancel('2020-01-01T10:00:00')).toBe(false);
  });

  it('finds doctor by id', () => {
    expect(getDoctorById('d1')?.fullName).toBe('Иванов Иван');
  });
});

// --- AppointmentCard ---
describe('AppointmentCard', () => {
  const base = {
    id: 'a1', patientName: 'Иван', doctorId: 'd1', slotId: 's1',
    status: 'confirmed' as const,
  };

  it('renders doctor and slot', () => {
    render(
      <AppointmentCard
        appointment={base} doctorName="Иванов Иван"
        slotLabel="12.05 10:30" canCancel onCancel={() => {}}
      />
    );
    expect(screen.getByText('Иванов Иван')).toBeInTheDocument();
    expect(screen.getByText('12.05 10:30')).toBeInTheDocument();
  });

  it('calls onCancel when button is clicked', async () => {
    const onCancel = vi.fn();
    render(
      <AppointmentCard
        appointment={base} doctorName="Иванов Иван"
        slotLabel="12.05 10:30" canCancel onCancel={onCancel}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /отменить/i }));
    expect(onCancel).toHaveBeenCalledWith('a1');
  });

  it('shows warning when cancellation is not allowed', () => {
    render(
      <AppointmentCard
        appointment={base} doctorName="Иванов Иван"
        slotLabel="12.05 10:30" canCancel={false} onCancel={() => {}}
      />
    );
    expect(screen.queryByRole('button', { name: /отменить/i })).not.toBeInTheDocument();
    expect(screen.getByText(/позвоните в клинику/i)).toBeInTheDocument();
  });
});

// --- HomePage ---
describe('HomePage', () => {
  it('shows doctors list', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Иванов Иван')).toBeInTheDocument();
    expect(screen.getByText('Петрова Анна')).toBeInTheDocument();
  });

  it('shows slots after doctor is selected', async () => {
    render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </MemoryRouter>
    );
    const buttons = screen.getAllByRole('button', { name: /выбрать/i });
    await userEvent.click(buttons[0]);
    expect(screen.getByText('2. Время')).toBeInTheDocument();
  });

  it('confirm button is disabled initially', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: /подтвердить запись/i })).toBeDisabled();
  });
});

// --- EmptyState / ErrorState ---
describe('EmptyState и ErrorState', () => {
  it('EmptyState renders title and action', () => {
    render(<EmptyState title="Нет данных" action={<button>Записаться</button>} />);
    expect(screen.getByText('Нет данных')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /записаться/i })).toBeInTheDocument();
  });

  it('ErrorState calls onRetry', async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Ошибка" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: /повторить/i }));
    expect(onRetry).toHaveBeenCalled();
  });
});