import { useState } from 'react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FeeChip, MedicalChip, StatusChip } from '@/components/domain';
import { clubStore } from '@/demo/store';
import { useClubModel, fmtDate, longMonthLabel, type MemberRow } from '@/demo/selectors';
import { formatARS } from '@/types/club';

interface Props {
  member: MemberRow | null;
  onClose: () => void;
}

const age = (birth: string) => Math.floor((Date.now() - new Date(birth).getTime()) / (365.25 * 86400000));

export const MemberDetailSheet = ({ member, onClose }: Props) => {
  const { data } = useClubModel();
  const [note, setNote] = useState('');
  const fees = member ? data.fees.filter((f) => f.memberId === member.id).sort((a, b) => b.period.localeCompare(a.period)) : [];
  const sessions = member ? data.attendance.filter((s) => s.categoryId === member.categoryId && s.taken).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8) : [];
  const live = member ? data.members.find((m) => m.id === member.id) : null;

  return (
    <Sheet open={!!member} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {member && live && (
          <>
            <SheetHeader>
              <SheetTitle>{member.fullName}</SheetTitle>
              <SheetDescription>{member.categoryName} · {age(member.birthDate)} años</SheetDescription>
            </SheetHeader>
            <div className="mt-3 flex flex-wrap gap-2">
              <FeeChip status={member.feeStatus} />
              <MedicalChip status={member.medicalStatus} />
              {member.attendancePct !== null && <StatusChip tone={member.attendancePct >= 70 ? 'success' : 'warning'}>Asistencia {member.attendancePct}%</StatusChip>}
            </div>

            <Tabs defaultValue="datos" className="mt-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="datos">Datos</TabsTrigger>
                <TabsTrigger value="cuotas">Cuotas</TabsTrigger>
                <TabsTrigger value="apto">Apto</TabsTrigger>
                <TabsTrigger value="asistencia">Asist.</TabsTrigger>
                <TabsTrigger value="notas">Notas</TabsTrigger>
              </TabsList>

              <TabsContent value="datos" className="mt-4 space-y-3 text-sm">
                {[
                  ['DNI', member.dni || '—'],
                  ['Nacimiento', fmtDate(member.birthDate)],
                  ['Responsable', member.guardianName || '—'],
                  ['Teléfono', member.guardianPhone || '—'],
                  ['Email', member.email || '—'],
                  ['Socio desde', fmtDate(member.joinedAt)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-border pb-2">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium text-right break-all">{v}</span>
                  </div>
                ))}
                <div className="space-y-1 pt-1">
                  <p className="text-muted-foreground">Documentación</p>
                  <div className="flex flex-wrap gap-2">
                    <StatusChip tone={live.hasDniCopy ? 'success' : 'warning'}>{live.hasDniCopy ? 'DNI cargado' : 'Falta copia de DNI'}</StatusChip>
                    <StatusChip tone={live.hasAuthorization ? 'success' : 'warning'}>{live.hasAuthorization ? 'Autorización firmada' : 'Falta autorización'}</StatusChip>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="cuotas" className="mt-4">
                <ul className="divide-y divide-border text-sm">
                  {fees.map((f) => (
                    <li key={f.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div>
                        <p className="font-medium capitalize">{longMonthLabel(f.period)}</p>
                        <p className="text-xs text-muted-foreground tabular">{formatARS(f.amount)}{f.paidAt ? ` · pagada el ${fmtDate(f.paidAt)}` : ` · vence ${fmtDate(f.dueDate)}`}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <FeeChip status={f.status} />
                        {f.status !== 'al_dia' && (
                          <Button size="sm" variant="outline" onClick={() => { clubStore.registerPayment(f.id); toast.success('Pago registrado'); }}>
                            Registrar pago
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="apto" className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Estado</span>
                  <MedicalChip status={member.medicalStatus} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Vence</span>
                  <span className="font-medium">{fmtDate(member.medicalExpiresAt)}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const today = new Date();
                    const exp = new Date(today);
                    exp.setFullYear(exp.getFullYear() + 1);
                    clubStore.updateMedical({ memberId: member.id, issuedAt: today.toISOString().split('T')[0], expiresAt: exp.toISOString().split('T')[0] });
                    toast.success('Apto cargado por 12 meses');
                  }}
                >
                  Cargar apto nuevo
                </Button>
              </TabsContent>

              <TabsContent value="asistencia" className="mt-4">
                <ul className="divide-y divide-border text-sm">
                  {sessions.map((s) => (
                    <li key={s.id} className="flex items-center justify-between py-2">
                      <span>{fmtDate(s.date)}</span>
                      {s.presentIds.includes(member.id) ? <StatusChip tone="success">Presente</StatusChip> : <StatusChip tone="danger">Ausente</StatusChip>}
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="notas" className="mt-4 space-y-3">
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota del entrenador…" aria-label="Nota del entrenador" />
                <Button
                  size="sm"
                  disabled={!note.trim()}
                  onClick={() => { clubStore.addNote(member.id, 'Dirección', note.trim()); setNote(''); toast.success('Nota guardada'); }}
                >
                  Guardar nota
                </Button>
                <ul className="space-y-2 text-sm">
                  {live.notes.map((n) => (
                    <li key={n.id} className="rounded-md bg-muted p-3">
                      <p>{n.text}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{n.author} · {fmtDate(n.date)}</p>
                    </li>
                  ))}
                  {live.notes.length === 0 && <li className="text-muted-foreground">Sin notas todavía.</li>}
                </ul>
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
