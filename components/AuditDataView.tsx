"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/lib/LanguageProvider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AuditResult, ParsedCSVData, ValidationError } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AuditDataViewProps {
  auditResult: AuditResult;
  originalData: ParsedCSVData;
}

export default function AuditDataView({
  auditResult,
  originalData,
}: AuditDataViewProps) {
  const language = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const [search, setSearch] = useState("");

  const handleExportErrors = () => {
    // Get unique row indices that have errors
    const errorRowIndices = new Set(
      auditResult.errors.map((e) => e.rowIndex - 1),
    ); // Convert to 0-indexed

    // Filter original data to only include rows with errors
    const rowsWithErrors = originalData.rows.filter((_, idx) =>
      errorRowIndices.has(idx),
    );

    // Create CSV content using original data headers and rows with errors
    const headers = originalData.headers;
    const csvRows = rowsWithErrors.map((row) =>
      headers.map((col) => {
        const value = row[col] || "";
        return `"${value.toString().replace(/"/g, '""')}"`;
      }),
    );

    const csvContent = [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `audit-errors-${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create a map of errors for quick lookup
  const errorMap = useMemo(() => {
    const map = new Map<string, ValidationError[]>();
    auditResult.errors.forEach((error) => {
      const key = `${error.rowIndex - 1}-${error.columnName}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(error);
    });
    return map;
  }, [auditResult.errors]);

  const getCellErrors = (
    rowIndex: number,
    columnName: string,
  ): ValidationError[] => {
    const key = `${rowIndex}-${columnName}`;
    return errorMap.get(key) || [];
  };

  const rowsWithErrors = useMemo(() => {
    const errorRowIndices = new Set(
      auditResult.errors.map((e) => e.rowIndex - 1),
    );
    return originalData.rows.map((row, idx) => ({
      row,
      idx,
      hasErrors: errorRowIndices.has(idx),
    }));
  }, [auditResult.errors, originalData.rows]);

  const displayData = showErrorsOnly
    ? rowsWithErrors.filter((r) => r.hasErrors)
    : rowsWithErrors;

  // Filter data by search
  const filteredData = useMemo(() => {
    if (!search.trim()) return displayData;
    const lower = search.toLowerCase();
    return displayData.filter(({ row }) =>
      Object.values(row).some((val) =>
        (val || "").toLowerCase().includes(lower),
      ),
    );
  }, [search, displayData]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRows = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center mb-4 gap-2 sm:gap-0">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={t(language, "audit.searchPlaceholder")}
            className="border rounded px-2 py-1 text-sm w-full sm:w-84"
          />
          <div className="flex gap-2 mt-2 sm:mt-0 sm:ml-auto">
            <Button
              variant={showErrorsOnly ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setShowErrorsOnly(!showErrorsOnly);
                setCurrentPage(1);
              }}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              {showErrorsOnly
                ? t(language, "audit.showingErrorsOnly")
                : t(language, "audit.showAllRows")}
            </Button>

            <Button
              onClick={handleExportErrors}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {t(language, "audit.exportErrors")}
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t(language, "audit.showingRows")
              .replace("{{shown}}", paginatedRows.length.toString())
              .replace("{{total}}", displayData.length.toString())}
          </p>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value: string) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-32">
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

        <ScrollArea className="w-full overflow-x-auto rounded-lg border mt-4">
          <Table className="min-w-[600px] text-xs sm:text-sm">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12 text-center font-semibold">
                  #
                </TableHead>
                {originalData.headers.map((header) => (
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
              {paginatedRows.map(({ row, idx: actualRowIndex }) => (
                <TableRow key={actualRowIndex} className="hover:bg-muted/50">
                  <TableCell className="text-center text-xs text-muted-foreground font-medium">
                    {actualRowIndex + 1}
                  </TableCell>
                  {originalData.headers.map((header) => {
                    const errors = getCellErrors(actualRowIndex, header);
                    const cellHasError = errors.length > 0;

                    return (
                      <TableCell
                        key={`${actualRowIndex}-${header}`}
                        className={`text-sm whitespace-nowrap ${
                          cellHasError ? "bg-destructive/20" : ""
                        }`}
                      >
                        {cellHasError && errors.length > 0 ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 cursor-help">
                                  <span className="truncate">
                                    {row[header] ||
                                      t(language, "audit.emptyCell")}
                                  </span>
                                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <div className="space-y-1">
                                  {errors.map((error, idx) => (
                                    <div key={idx} className="text-sm">
                                      {error.errorMessage}
                                    </div>
                                  ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span>
                            {row[header] || t(language, "audit.emptyCell")}
                          </span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    aria-label={t(language, "pagination.previous")}
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  >
                    {t(language, "pagination.previous")}
                  </PaginationPrevious>
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
                    <span className="px-1.5 text-muted-foreground">...</span>
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
                  if (pageNum < 1 || pageNum > totalPages) return null;
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
                })}

                {/* Show ... if needed after current range */}
                {totalPages > 6 && currentPage < totalPages - 4 && (
                  <PaginationItem>
                    <span className="px-1.5 text-muted-foreground">...</span>
                  </PaginationItem>
                )}

                {/* Show last page if not in visible range */}
                {totalPages > 6 && currentPage < totalPages - 3 && (
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
                    aria-label={t(language, "pagination.next")}
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
                  >
                    {t(language, "pagination.next")}
                  </PaginationNext>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>
    </div>
  );
}
