const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
const DEFAULT_ROLE = 'ADMIN';

type FetchOptions = RequestInit & { retries?: number };

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { retries = 2, headers, ...init } = options;
  const finalHeaders = new Headers(headers);
  if (!finalHeaders.has('Content-Type') && init.body) {
    finalHeaders.set('Content-Type', 'application/json');
  }
  finalHeaders.set('x-demo-role', DEFAULT_ROLE);

  let attempt = 0;
  let lastError: unknown;
  while (attempt <= retries) {
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: finalHeaders
      });

      if (response.status === 429 || response.status === 503) {
        const delay = 250 * (attempt + 1);
        await sleep(delay);
        attempt += 1;
        continue;
      }

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed with status ${response.status}`);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      lastError = error;
      if (attempt >= retries) {
        throw error;
      }
      await sleep(150 * (attempt + 1));
      attempt += 1;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Unknown API error');
}

export type Guardian = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
};

export type Child = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  guardians: Guardian[];
  createdAt: string;
};

export type AttendanceRecord = {
  id: string;
  bookingId: string;
  checkInAt?: string | null;
  checkOutAt?: string | null;
};

export type Booking = {
  id: string;
  childId: string;
  slotId: string;
  status: string;
  child: Child;
  attendance?: AttendanceRecord | null;
};

export type ProgramSlot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookings: Booking[];
};

export async function listChildren() {
  return apiFetch<Child[]>('/children', { method: 'GET' });
}

export async function createChild(payload: {
  firstName: string;
  lastName: string;
  birthDate: string;
  guardians?: { name: string; email?: string; phone?: string }[];
}) {
  return apiFetch<Child>('/children', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function listSlots(date: string) {
  const params = new URLSearchParams({ date });
  return apiFetch<ProgramSlot[]>(`/slots?${params.toString()}`, { method: 'GET' });
}

export async function createBooking(payload: { childId: string; slotId: string }) {
  return apiFetch<Booking>('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function checkIn(payload: { bookingId: string }) {
  return apiFetch<AttendanceRecord>('/attendance/check-in', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function checkOut(payload: { bookingId: string }) {
  return apiFetch<AttendanceRecord>('/attendance/check-out', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
