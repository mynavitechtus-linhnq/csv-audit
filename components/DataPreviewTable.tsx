"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/lib/LanguageProvider";

interface DataPreviewTableProps {
  headers: string[];
  rows: Record<string, string>[];
}

export default function DataPreviewTable({
  headers,
  rows,
}: DataPreviewTableProps) {
  const language = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [maxRows, setMaxRows] = useState(30);
  const [search, setSearch] = useState("");

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const lower = search.toLowerCase();
    return rows.filter((row) =>
      headers.some((header) =>
        (row[header] || "").toLowerCase().includes(lower),
      ),
    );
  }, [search, rows, headers]);

  const totalPages = Math.ceil(filteredRows.length / maxRows);
  const startIndex = (currentPage - 1) * maxRows;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + maxRows);

  const handleRowsPerPageChange = (value: string) => {
    setMaxRows(parseInt(value));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder={t(language, "audit.searchPlaceholder")}
          className="border rounded px-2 py-1 text-sm w-84"
        />
      </div>
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {t(language, "audit.showingRows")
            .replace("{{shown}}", paginatedRows.length.toString())
            .replace("{{total}}", filteredRows.length.toString())}
        </p>
        <Select
          value={maxRows.toString()}
          onValueChange={handleRowsPerPageChange}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">
              {t(language, "audit.rowsPerPage.30")}
            </SelectItem>
            <SelectItem value="50">
              {t(language, "audit.rowsPerPage.50")}
            </SelectItem>
            <SelectItem value="100">
              {t(language, "audit.rowsPerPage.100")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ScrollArea className="w-full border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12 text-center font-semibold">
                #
              </TableHead>
              {headers.map((header) => (
                <TableHead
                  key={header}
                  className="font-semibold whitespace-nowrap"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={headers.length + 1}
                  className="text-center text-muted-foreground py-8"
                >
                  {t(language, "audit.notFound")}
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row, idx) => (
                <TableRow key={idx} className="hover:bg-muted/50">
                  <TableCell className="text-center text-xs text-muted-foreground font-medium">
                    {startIndex + idx + 1}
                  </TableCell>
                  {headers.map((header) => (
                    <TableCell
                      key={`${idx}-${header}`}
                      className="text-sm whitespace-nowrap"
                    >
                      {row[header] || t(language, "audit.emptyCell")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {/* Show first page if not in visible range */}
              {totalPages > 6 && currentPage > 4 && (
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(1);
                    }}
                    isActive={currentPage === 1}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
              )}

              {/* Show ... if needed before current range */}
              {totalPages > 6 && currentPage > 5 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Show up to 5 pages around current */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum =
                  currentPage <= 3
                    ? i + 1
                    : currentPage >= totalPages - 2
                      ? totalPages - 4 + i
                      : currentPage - 2 + i;
                if (pageNum > 0 && pageNum <= totalPages) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNum);
                        }}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                return null;
              })}

              {/* Show ... if needed after current range */}
              {totalPages > 6 && currentPage < totalPages - 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Always show last page if not in visible range */}
              {totalPages > 6 && currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(totalPages);
                    }}
                    isActive={currentPage === totalPages}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1);
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
