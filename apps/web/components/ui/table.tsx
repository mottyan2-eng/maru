import { clsx } from 'clsx';
import { HTMLAttributes } from 'react';

type TableProps = HTMLAttributes<HTMLTableElement>;
type TableSectionProps<T> = HTMLAttributes<T>;

type TableElements = {
  Table: React.FC<TableProps>;
  Header: React.FC<TableSectionProps<HTMLTableSectionElement>>;
  Body: React.FC<TableSectionProps<HTMLTableSectionElement>>;
  Row: React.FC<TableSectionProps<HTMLTableRowElement>>;
  Head: React.FC<TableSectionProps<HTMLTableCellElement>>;
  Cell: React.FC<TableSectionProps<HTMLTableCellElement>>;
};

const TableComponents: TableElements = {
  Table: ({ className, ...props }) => (
    <table className={clsx('w-full border-collapse text-left text-sm', className)} {...props} />
  ),
  Header: ({ className, ...props }) => (
    <thead className={clsx('bg-slate-100 text-xs uppercase text-slate-600', className)} {...props} />
  ),
  Body: ({ className, ...props }) => (
    <tbody className={clsx('divide-y divide-slate-200 bg-white', className)} {...props} />
  ),
  Row: ({ className, ...props }) => (
    <tr className={clsx('hover:bg-slate-50', className)} {...props} />
  ),
  Head: ({ className, ...props }) => (
    <th className={clsx('px-4 py-3 font-medium tracking-wide', className)} {...props} />
  ),
  Cell: ({ className, ...props }) => (
    <td className={clsx('px-4 py-3 align-top text-slate-700', className)} {...props} />
  )
};

export const { Table, Header: TableHeader, Body: TableBody, Row: TableRow, Head: TableHead, Cell: TableCell } =
  TableComponents;
