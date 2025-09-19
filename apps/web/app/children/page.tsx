'use client';

import { format } from 'date-fns';
import { FormEvent, useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Child, createChild, listChildren } from '../../lib/api';

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  birthDate: '',
  guardianName: '',
  guardianEmail: '',
  guardianPhone: ''
};

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formState, setFormState] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      setLoading(true);
      const data = await listChildren();
      setChildren(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load children');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormState(INITIAL_FORM);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const guardians = formState.guardianName
        ? [
            {
              name: formState.guardianName,
              email: formState.guardianEmail || undefined,
              phone: formState.guardianPhone || undefined
            }
          ]
        : undefined;
      await createChild({
        firstName: formState.firstName,
        lastName: formState.lastName,
        birthDate: formState.birthDate,
        guardians
      });
      resetForm();
      setIsDialogOpen(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create child');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Children</h1>
          <p className="text-sm text-slate-600">Manage enrolment and guardian contacts.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>New child</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a new child</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    required
                    value={formState.firstName}
                    onChange={(event) => setFormState((prev) => ({ ...prev, firstName: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    required
                    value={formState.lastName}
                    onChange={(event) => setFormState((prev) => ({ ...prev, lastName: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Birth date</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    required
                    value={formState.birthDate}
                    onChange={(event) => setFormState((prev) => ({ ...prev, birthDate: event.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardianName">Guardian name</Label>
                <Input
                  id="guardianName"
                  placeholder="Optional"
                  value={formState.guardianName}
                  onChange={(event) => setFormState((prev) => ({ ...prev, guardianName: event.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guardianEmail">Guardian email</Label>
                  <Input
                    id="guardianEmail"
                    type="email"
                    placeholder="Optional"
                    value={formState.guardianEmail}
                    onChange={(event) => setFormState((prev) => ({ ...prev, guardianEmail: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianPhone">Guardian phone</Label>
                  <Input
                    id="guardianPhone"
                    placeholder="Optional"
                    value={formState.guardianPhone}
                    onChange={(event) => setFormState((prev) => ({ ...prev, guardianPhone: event.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Save child'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-600">Loading children…</p>
      ) : children.length === 0 ? (
        <p className="text-sm text-slate-600">No children found yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Birth date</TableHead>
              <TableHead>Guardians</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {children.map((child) => (
              <TableRow key={child.id}>
                <TableCell className="font-medium">
                  {child.firstName} {child.lastName}
                </TableCell>
                <TableCell>{format(new Date(child.birthDate), 'yyyy-MM-dd')}</TableCell>
                <TableCell>
                  {child.guardians.length === 0 ? (
                    <span className="text-slate-500">No guardians added</span>
                  ) : (
                    <ul className="space-y-1">
                      {child.guardians.map((guardian) => (
                        <li key={guardian.id}>
                          <span className="font-medium">{guardian.name}</span>
                          {guardian.email && <span className="text-slate-500"> · {guardian.email}</span>}
                          {guardian.phone && <span className="text-slate-500"> · {guardian.phone}</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
