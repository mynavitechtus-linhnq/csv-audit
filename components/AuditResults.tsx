"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AuditResult, ParsedCSVData } from "@/lib/types";
import { t } from "@/lib/i18n";
import { useLanguage } from "@/lib/LanguageProvider";
import AuditDataView from "./AuditDataView";

interface AuditResultsProps {
  auditResult: AuditResult;
  originalData: ParsedCSVData;
  onBack: () => void;
  onReAudit: () => void;
}

export default function AuditResults({
  auditResult,
  originalData,
  onBack,
  onReAudit,
}: AuditResultsProps) {
  const language = useLanguage();
  const uniqueColumns = Array.from(
    new Set(
      auditResult.errors.map((e) => e.columnName).filter((col) => col.trim()),
    ),
  ).sort();
  const errorRate = (
    (auditResult.totalErrors /
      (auditResult.totalRows * auditResult.totalColumns)) *
    100
  ).toFixed(2);

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-destructive/10 to-background border border-destructive/20">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">
              {t(language, "audit.results")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t(language, "audit.review")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={onReAudit} size="lg" className="gap-2">
              {t(language, "audit.reAudit")}
            </Button>
            <Button variant="outline" onClick={onBack}>
              {t(language, "audit.back")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-muted rounded">
            <p className="text-xs text-muted-foreground">
              {t(language, "audit.totalErrors")}
            </p>
            <p className="text-2xl font-bold text-destructive">
              {auditResult.totalErrors}
            </p>
          </div>
          <div className="p-3 bg-muted rounded">
            <p className="text-xs text-muted-foreground">
              {t(language, "audit.errorRate")}
            </p>
            <p className="text-2xl font-bold">{errorRate}%</p>
          </div>
          <div className="p-3 bg-muted rounded">
            <p className="text-xs text-muted-foreground">
              {t(language, "audit.affectedColumns")}
            </p>
            <p className="text-2xl font-bold">{uniqueColumns.length}</p>
          </div>
          <div className="p-3 bg-muted rounded">
            <p className="text-xs text-muted-foreground">
              {t(language, "audit.totalRecords")}
            </p>
            <p className="text-2xl font-bold">{auditResult.totalRows}</p>
          </div>
        </div>
      </Card>

      {auditResult.totalErrors > 0 && (
        <AuditDataView auditResult={auditResult} originalData={originalData} />
      )}

      {auditResult.totalErrors === 0 && (
        <Card className="p-12 text-center">
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">
              {t(language, "audit.noErrorsFound")}
            </p>
            <p className="text-muted-foreground">
              {t(language, "audit.allPassed")}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
