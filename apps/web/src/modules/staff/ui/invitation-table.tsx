import { InvitationStatus } from "./invitation-status";
import { useMemo, type Dispatch, type SetStateAction } from "react";
import {
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type { InvitationListQuery, ListedInvitation } from "@soe/contracts";
import { Button, cn } from "@soe/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@soe/ui/primitives/table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { roleLabel } from "../model/roles";
import { InvitationActions } from "./invitation-actions";

export function InvitationTable({
  invitations,
  total,
  options,
  setOptions,
  fetching,
  timeZone,
  schoolName,
}: {
  invitations: ListedInvitation[];
  total: number;
  options: InvitationListQuery;
  setOptions: Dispatch<SetStateAction<InvitationListQuery>>;
  fetching: boolean;
  timeZone: string;
  schoolName: string;
}) {
  const columns = useMemo<ColumnDef<ListedInvitation>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Profissional",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="break-words font-medium text-ink">
              {row.original.name}
            </p>
            <p className="mt-1 break-all text-muted-foreground">
              {row.original.email}
            </p>
          </div>
        ),
      },
      {
        id: "roles",
        header: "Papéis na escola",
        enableSorting: false,
        cell: ({ row }) => (
          <p className="truncate leading-6">
            {row.original.roles.slice(0, 2).map(roleLabel).join(", ")}
            {row.original.roles.length > 2 ? "…" : ""}
          </p>
        ),
      },
      {
        id: "status",
        header: "Situação",
        enableSorting: false,
        cell: ({ row }) => <InvitationStatus invitation={row.original} />,
      },
      {
        accessorKey: "createdAt",
        header: "Convidado em",
        cell: ({ row }) => (
          <time
            dateTime={row.original.createdAt}
            className="tabular-nums text-muted-foreground"
          >
            {new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
              timeZone,
            }).format(new Date(row.original.createdAt))}
          </time>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Ações</span>,
        enableSorting: false,
        cell: ({ row }) => (
          <InvitationActions
            invitation={row.original}
            schoolName={schoolName}
            timeZone={timeZone}
          />
        ),
      },
    ],
    [timeZone, schoolName],
  );
  const sorting = [
    { id: options.sortBy, desc: options.sortDirection === "desc" },
  ];
  const pagination = {
    pageIndex: Math.floor(options.offset / options.limit),
    pageSize: options.limit,
  };
  const table = useReactTable({
    columns,
    data: invitations,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    rowCount: total,
    enableSortingRemoval: false,
    enableMultiSort: false,
    state: { sorting, pagination },
    onSortingChange: (updater) => {
      const next = functionalUpdate(updater, sorting)[0];
      if (
        !next ||
        (next.id !== "name" && next.id !== "email" && next.id !== "createdAt")
      )
        return;
      const sortBy = next.id;
      setOptions((value) => ({
        ...value,
        offset: 0,
        sortBy,
        sortDirection: next.desc ? "desc" : "asc",
      }));
    },
    onPaginationChange: (updater) => {
      const next = functionalUpdate(updater, pagination);
      setOptions((value) => ({
        ...value,
        offset: next.pageIndex * next.pageSize,
      }));
    },
  });
  return (
    <div className="overflow-hidden rounded-xl border border-rule bg-surface">
      <Table
        className="min-w-[48rem] table-fixed"
        containerProps={{
          role: "region",
          "aria-label":
            "Tabela de convites, role horizontalmente em telas pequenas",
          tabIndex: 0,
          className:
            "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary",
          "aria-busy": fetching,
        }}
      >
        <caption className="sr-only">
          Convites da equipe. Datas no horário da escola.
        </caption>
        <TableHeader className="bg-canvas">
          {table.getHeaderGroups().map((group) => (
            <TableRow
              key={group.id}
              className="border-rule hover:bg-transparent"
            >
              {group.headers.map((header) => (
                <TableHead
                  key={header.id}
                  scope="col"
                  className={cn(
                    "px-4",
                    header.id === "actions"
                      ? "sticky right-0 w-14 bg-canvas px-1"
                      : header.id === "name"
                        ? "w-[30%]"
                        : header.id === "roles"
                          ? "w-[22%]"
                          : "w-[20%]",
                  )}
                  aria-sort={
                    header.column.getCanSort()
                      ? header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : header.column.getIsSorted() === "desc"
                          ? "descending"
                          : "none"
                      : undefined
                  }
                >
                  {header.column.getCanSort() ? (
                    <Button
                      variant="ghost"
                      className="min-h-11 gap-2 px-0 hover:bg-transparent"
                      disabled={fetching}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getIsSorted() === "asc" ? (
                        <ArrowUp className="size-4" aria-hidden="true" />
                      ) : header.column.getIsSorted() === "desc" ? (
                        <ArrowDown className="size-4" aria-hidden="true" />
                      ) : (
                        <ArrowUpDown
                          className="size-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                      )}
                    </Button>
                  ) : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.original.id} className="border-rule">
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    "whitespace-normal px-4 py-4 align-top",
                    cell.column.id === "actions" &&
                      "sticky right-0 bg-surface px-1",
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <nav
        aria-label="Páginas de convites"
        className="flex flex-wrap items-center justify-between gap-3 border-t border-rule px-4 py-3"
      >
        <p role="status" className="text-sm tabular-nums text-muted-foreground">
          {total === 0
            ? "0 resultados"
            : `${options.offset + 1}–${Math.min(options.offset + options.limit, total)} de ${total}`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-11 p-0"
            aria-label="Página anterior"
            disabled={!table.getCanPreviousPage() || fetching}
            onClick={() => table.previousPage()}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>
          <span className="px-1 text-sm tabular-nums">
            {pagination.pageIndex + 1} de {Math.max(1, table.getPageCount())}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-11 p-0"
            aria-label="Próxima página"
            disabled={!table.getCanNextPage() || fetching}
            onClick={() => table.nextPage()}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </nav>
    </div>
  );
}
