'use client';

import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Booking, Child, ProgramSlot, createBooking, listChildren, listSlots } from '../../lib/api';

const TODAY = format(new Date(), 'yyyy-MM-dd');

function countActiveBookings(bookings: Booking[]) {
  return bookings.filter((booking) => booking.status !== 'CANCELLED').length;
}

export default function SchedulePage() {
  const [date, setDate] = useState(TODAY);
  const [slots, setSlots] = useState<ProgramSlot[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    listChildren().then(setChildren).catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

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
      setError(err instanceof Error ? err.message : 'Failed to load slots');
    } finally {
      setLoading(false);
    }
  }

  async function handleBook(slotId: string) {
    if (!selectedChild) {
      setError('Select a child before creating a booking.');
      return;
    }
    try {
      setError(null);
      await createBooking({ childId: selectedChild, slotId });
      setSuccessMessage('Booking created successfully.');
      await refresh(date);
    } catch (err) {
      setSuccessMessage(null);
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    }
  }

  const sortedSlots = useMemo(
    () =>
      [...slots].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [slots]
  );

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Schedule</h1>
            <p className="text-sm text-slate-600">View availability and reserve program slots.</p>
          </div>
          <div className="w-full max-w-xs space-y-2">
            <Label htmlFor="schedule-date">Date</Label>
            <Input
              id="schedule-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
        </div>
        <div className="w-full max-w-xs space-y-2">
          <Label>Book for</Label>
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger>
              <SelectValue placeholder="Select a child" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {children.length === 0 ? (
                  <SelectItem disabled value="empty">
                    Add a child first
                  </SelectItem>
                ) : (
                  children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.firstName} {child.lastName}
                    </SelectItem>
                  ))
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </header>

      {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {successMessage && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{successMessage}</p>
      )}

      {loading ? (
        <p className="text-sm text-slate-600">Loading slots…</p>
      ) : sortedSlots.length === 0 ? (
        <p className="text-sm text-slate-600">No slots configured for this date.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSlots.map((slot) => {
              const activeCount = countActiveBookings(slot.bookings);
              const available = Math.max(slot.capacity - activeCount, 0);
              return (
                <TableRow key={slot.id}>
                  <TableCell className="font-medium">
                    {format(new Date(slot.startTime), 'HH:mm')} – {format(new Date(slot.endTime), 'HH:mm')}
                  </TableCell>
                  <TableCell>
                    {activeCount}/{slot.capacity} booked
                    <div className="text-xs text-slate-500">{available} spots left</div>
                  </TableCell>
                  <TableCell>
                    {slot.bookings.length === 0 ? (
                      <span className="text-slate-500">No bookings yet</span>
                    ) : (
                      <ul className="space-y-1">
                        {slot.bookings.map((booking) => (
                          <li key={booking.id}>
                            {booking.child.firstName} {booking.child.lastName}
                          </li>
                        ))}
                      </ul>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      disabled={!selectedChild || available === 0}
                      onClick={() => handleBook(slot.id)}
                    >
                      Reserve
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
