import { useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Valor ordenable; si falta, la columna no ordena. */
  sortValue?: (row: T) => string | number;
  align?: 'left' | 'right';
  className?: string;
  /** Oculta la columna en mobile (en la vista de cards solo se muestran las primarias). */
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  /** Barra con acciones masivas, se muestra al haber selección. */
  bulkActions?: (ids: string[]) => ReactNode;
  empty?: ReactNode;
  caption?: string;
  maxHeight?: string;
}

export function DataTable<T>({
  rows, columns, rowKey, onRowClick, selectable, selected = [], onSelectedChange, bulkActions, empty, caption, maxHeight = '60vh',
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const sv = col.sortValue;
    return [...rows].sort((a, b) => {
      const va = sv(a), vb = sv(b);
      const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'es');
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [rows, columns, sort]);

  const allIds = sorted.map(rowKey);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.includes(id));
  const toggleAll = () => onSelectedChange?.(allSelected ? [] : allIds);
  const toggleOne = (id: string) =>
    onSelectedChange?.(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  if (rows.length === 0 && empty) return <>{empty}</>;

  const primaryCols = columns.filter((c) => !c.hideOnMobile);

  return (
    <div>
      {selectable && selected.length > 0 && bulkActions && (
        <div className="mb-2 flex items-center gap-3 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm no-print" role="status">
          <span className="font-medium">{selected.length} seleccionados</span>
          {bulkActions(selected)}
        </div>
      )}

      {/* Desktop: tabla con header sticky */}
      <div className="hidden md:block rounded-lg border border-border bg-card shadow-card overflow-auto" style={{ maxHeight }}>
        <Table>
          {caption && <caption className="sr-only">{caption}</caption>}
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              {selectable && (
                <TableHead className="w-10">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Seleccionar todos" />
                </TableHead>
              )}
              {columns.map((c) => (
                <TableHead key={c.key} className={cn(c.align === 'right' && 'text-right', c.className)}>
                  {c.sortValue ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-foreground"
                      onClick={() =>
                        setSort((s) => (s?.key === c.key ? { key: c.key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key: c.key, dir: 'asc' }))
                      }
                    >
                      {c.header}
                      {sort?.key === c.key && (sort.dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </button>
                  ) : (
                    c.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row) => {
              const id = rowKey(row);
              return (
                <TableRow
                  key={id}
                  data-state={selected.includes(id) ? 'selected' : undefined}
                  className={cn(onRowClick && 'cursor-pointer')}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selected.includes(id)} onCheckedChange={() => toggleOne(id)} aria-label="Seleccionar fila" />
                    </TableCell>
                  )}
                  {columns.map((c) => (
                    <TableCell key={c.key} className={cn('tabular', c.align === 'right' && 'text-right', c.className)}>
                      {c.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: cards */}
      <ul className="md:hidden space-y-2">
        {sorted.map((row) => {
          const id = rowKey(row);
          return (
            <li key={id}>
              <div
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={() => onRowClick?.(row)}
                onKeyDown={(e) => e.key === 'Enter' && onRowClick?.(row)}
                className="rounded-lg border border-border bg-card p-3 shadow-card space-y-1.5"
              >
                {primaryCols.map((c, i) => (
                  <div key={c.key} className={cn('flex items-center justify-between gap-3', i === 0 && 'font-medium')}>
                    {i > 0 && <span className="text-xs text-muted-foreground">{c.header}</span>}
                    <span className="min-w-0 truncate">{c.cell(row)}</span>
                  </div>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
