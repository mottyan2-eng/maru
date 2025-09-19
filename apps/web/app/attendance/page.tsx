'use client';

import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Booking, ProgramSlot, checkIn, checkOut, listSlots } from '../../lib/api';

const TODAY = format(new Date(), 'yyyy-MM-dd');

type BookingWithSlot = Booking & { slot: ProgramSlot };

export default function AttendancePage() {
  const [date, setDate] = useState(TODAY);
  const [slots, setSlots] = useState<ProgramSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    refresh(date);
  }, [date]);

  async function refresh(targetDate: string) {
    try {
      setLoading(true);
      const data = await listSlots(targetDate);
      setSlots(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }

  const bookings = useMemo<BookingWithSlot[]>(() => {
    return slots.flatMap((slot) => slot.bookings.map((booking) => ({ ...booking, slot })));
  }, [slots]);

  async function handleCheckIn(bookingId: string) {
    try {
      setError(null);
      await checkIn({ bookingId });
      setSuccessMessage('Check-in recorded.');
      await refresh(date);
    } catch (err) {
      setSuccessMessage(null);
      setError(err instanceof Error ? err.message : 'Failed to check in');
    }
  }

  async function handleCheckOut(bookingId: string) {
    try {
      setError(null);
      await checkOut({ bookingId });
      setSuccessMessage('Check-out recorded.');
      await refresh(date);
    } catch (err) {
      setSuccessMessage(null);
      setError(err instanceof Error ? err.message : 'Failed to check out');
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Attendance</h1>
          <p className="text-sm text-slate-600">Track check-ins and check-outs for today&apos;s bookings.</p>
        </div>
        <div className="w-full max-w-xs space-y-2">
          <Label htmlFor="attendance-date">Date</Label>
          <Input
            id="attendance-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
      </header>

      {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {successMessage && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{successMessage}</p>
      )}

      {loading ? (
        <p className="text-sm text-slate-600">Loading attendance…</p>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-slate-600">No bookings scheduled for this date.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Child</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => {
              const checkInAt = booking.attendance?.checkInAt ? new Date(booking.attendance.checkInAt) : null;
              const checkOutAt = booking.attendance?.checkOutAt ? new Date(booking.attendance.checkOutAt) : null;
              return (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">
                    {booking.child.firstName} {booking.child.lastName}
                  </TableCell>
                  <TableCell>
                    {format(new Date(booking.slot.startTime), 'HH:mm')} – {format(new Date(booking.slot.endTime), 'HH:mm')}
                  </TableCell>
                  <TableCell>
                    <div>{checkInAt ? `Checked in at ${format(checkInAt, 'HH:mm')}` : 'Not checked in yet'}</div>
                    <div>
                      {checkOutAt
                        ? `Checked out at ${format(checkOutAt, 'HH:mm')}`
                        : checkInAt
                          ? 'On site'
                          : 'Awaiting arrival'}
                    </div>
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button
                      variant="outline"
                      disabled={Boolean(checkInAt)}
                      onClick={() => handleCheckIn(booking.id)}
                    >
                      Check in
                    </Button>
                    <Button
                      variant="outline"
                      disabled={!checkInAt || Boolean(checkOutAt)}
                      onClick={() => handleCheckOut(booking.id)}
                    >
                      Check out
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
