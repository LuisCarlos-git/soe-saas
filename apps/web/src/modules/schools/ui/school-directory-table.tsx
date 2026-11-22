import { useMemo, type Dispatch, type SetStateAction } from "react";
import { Link } from "@tanstack/react-router";
import {
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type { ManagedSchool, ManagedSchoolsQuery } from "@soe/contracts";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@soe/ui/primitives/dropdown-menu";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Settings,
  Users,
} from "lucide-react";

export function SchoolDirectoryTable({
  schools,
  total,
  options,
  setOptions,
  fetching,
  mode,
}: {
  schools: ManagedSchool[];
  total: number;
  options: ManagedSchoolsQuery;
  setOptions: Dispatch<SetStateAction<ManagedSchoolsQuery>>;
  fetching: boolean;
  mode: "settings" | "professionals";
}) {
  const columns = useMemo<ColumnDef<ManagedSchool>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Escola",
        cell: ({ row }) => (
          <div className="space-y-1">
            <Link
              to={
                mode === "settings"
                  ? "/schools/$organizationId/settings"
                  : "/schools/$organizationId/professionals"
              }
              params={{ organizationId: row.original.id }}
              className="inline-flex min-h-11 items-center break-words font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-primary"
            >
              {row.original.name}
            </Link>
            <p className="text-xs text-muted-foreground">
              {row.original.supportTeamLabel}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "academicYear",
        header: "Ano letivo",
        cell: ({ row }) => (
          <div className="space-y-1 tabular-nums">
            <p>{row.original.academicYear}</p>
            <p className="break-words text-xs text-muted-foreground">
              {row.original.timeZone.replaceAll("_", " ")}
            </p>
          </div>
        ),
      },
      {
        id: "professionals",
        header: "Profissionais ativos",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.original.activeProfessionals}
          </span>
        ),
      },
      {
        id: "invitations",
        header: "Convites pendentes",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="space-y-1 tabular-nums">
            <p>{row.original.pendingInvitations}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.totalInvitations} no total
            </p>
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Ações</span>,
        enableSorting: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-11 p-0"
                aria-label={`Ações da escola ${row.original.name}`}
              >
                <MoreHorizontal className="size-5" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild className="min-h-11">
                <Link
                  to="/schools/$organizationId/professionals"
                  params={{ organizationId: row.original.id }}
                >
                  <Users className="size-4" aria-hidden="true" />
                  Ver profissionais
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="min-h-11">
                <Link
                  to="/schools/$organizationId/settings"
                  params={{ organizationId: row.original.id }}
                >
                  <Settings className="size-4" aria-hidden="true" />
                  Configurar escola
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [mode],
  );
  const sorting = [
    { id: options.sortBy, desc: options.sortDirection === "desc" },
  ];
  const pagination = {
    pageIndex: options.offset / options.limit,
    pageSize: options.limit,
  };
  const table = useReactTable({
    columns,
    data: schools,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    rowCount: total,
    enableSortingRemoval: false,
    enableMultiSort: false,
    state: { sorting, pagination },
    onSortingChange: (updater) => {
      const next = functionalUpdate(updater, sorting)[0];
      if (!next || (next.id !== "name" && next.id !== "academicYear")) return;
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
            "Escolas que você administra, role horizontalmente em telas pequenas",
          tabIndex: 0,
          "aria-busy": fetching,
          className:
            "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary",
        }}
      >
        <caption className="sr-only">
          Escolas administradas, profissionais ativos e convites.
        </caption>
        <TableHeader className="bg-canvas">
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="border-rule">
              {group.headers.map((header) => (
                <TableHead
                  key={header.id}
                  scope="col"
                  className={cn(
                    "whitespace-normal px-4",
                    header.id === "actions"
                      ? "sticky right-0 w-14 bg-canvas px-1"
                      : header.id === "name"
                        ? ""
                        : header.id === "academicYear"
                          ? "w-40"
                          : "w-32",
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
                        <ArrowUpDown className="size-4" aria-hidden="true" />
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
        aria-label="Páginas de escolas"
        className="flex flex-wrap items-center justify-between gap-3 border-t border-rule px-4 py-3"
      >
        <p role="status" className="text-sm tabular-nums text-muted-foreground">
          {options.offset + 1}–{Math.min(options.offset + options.limit, total)}{" "}
          de {total}
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
