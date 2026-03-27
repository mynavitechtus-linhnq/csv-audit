"use client";

import { useState } from "react";
import { AlertCircle, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UploadArea from "@/components/UploadArea";
import ValidationRulesBuilder from "@/components/ValidationRulesBuilder";
import DataPreviewTable from "@/components/DataPreviewTable";
import AuditResults from "@/components/AuditResults";
import { ParsedCSVData, ValidationRule, AuditResult } from "@/lib/types";
import { parseCSV, runAudit } from "@/lib/validation";
import { LanguageProvider } from "@/lib/LanguageProvider";
import { t, Language } from "@/lib/i18n";

export default function Home() {
  const [csvData, setCsvData] = useState<ParsedCSVData | null>(null);
  const [rules, setRules] = useState<ValidationRule[]>([]);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);

  const handleFileUpload = (
    fileContent: string,
    uploadedFileName: string,
    uploadedFileSize: string,
  ) => {
    const parsed = parseCSV(fileContent);
    if (parsed) {
      setCsvData(parsed);
      setAuditResult(null);
      setFileName(uploadedFileName);
      setFileSize(uploadedFileSize);
    }
  };

  const handleAddRule = (rule: ValidationRule) => {
    setRules([...rules, rule]);
  };

  const handleRemoveRule = (ruleId: string) => {
    setRules(rules.filter((r) => r.id !== ruleId));
  };

  const handleRunAudit = () => {
    if (!csvData || rules.length === 0) return;

    setIsAuditing(true);
    setTimeout(() => {
      const errors = runAudit(csvData, rules);
      setAuditResult({
        totalRows: csvData.rows.length,
        totalColumns: csvData.headers.length,
        totalErrors: errors.length,
        errors,
      });
      setIsAuditing(false);
    }, 500);
  };

  return (
    <LanguageProvider value={language}>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                {t(language, "title")}
              </h1>
              <p className="text-muted-foreground">{t(language, "subtitle")}</p>
            </div>
            <div className="w-32">
              <Select
                value={language}
                onValueChange={(val) => setLanguage(val as Language)}
              >
                <SelectTrigger>
                  <Globe className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!csvData ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Upload Area */}
              <Card className="lg:col-span-1 p-6 border border-dashed">
                <h2 className="text-lg font-semibold">
                  {t(language, "upload.title")}
                </h2>
                <UploadArea onFileUpload={handleFileUpload} />
              </Card>

              {/* Right Column - Empty State Message */}
              <Card className="lg:col-span-2 p-12 border border-dashed">
                <div className="flex items-center justify-center text-center h-full">
                  <div>
                    <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">
                      {t(language, "page.noCsvUploaded")}
                    </h2>
                    <p className="text-muted-foreground">
                      {t(language, "page.pleaseUploadCsv")}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Upload & Rules */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold">
                    {t(language, "upload.title")}
                  </h2>
                  <UploadArea onFileUpload={handleFileUpload} />

                  {csvData && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">
                        {t(language, "page.fileSummary")}
                      </p>
                      <div className="text-sm text-muted-foreground mt-2">
                        {fileName && (
                          <p>
                            {t(language, "page.fileName")}{" "}
                            <span className="font-semibold text-foreground">
                              {fileName}
                            </span>
                          </p>
                        )}
                        {fileSize && (
                          <p>
                            {t(language, "page.fileSize")}{" "}
                            <span className="font-semibold text-foreground">
                              {fileSize}
                            </span>
                          </p>
                        )}
                        <p>
                          {t(language, "summary.records")}:{" "}
                          <span className="font-semibold text-foreground">
                            {csvData.rows.length}
                          </span>
                        </p>
                        <p>
                          {t(language, "summary.columns")}:{" "}
                          <span className="font-semibold text-foreground">
                            {csvData.headers.length}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </Card>

                {csvData && (
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold">
                      {t(language, "rules.title")}
                    </h2>
                    <ValidationRulesBuilder
                      columns={csvData.headers}
                      onAddRule={handleAddRule}
                      onRemoveRule={handleRemoveRule}
                      rules={rules}
                    />
                  </Card>
                )}
              </div>

              {/* Right Column - Preview & Results */}
              <div className="lg:col-span-2 space-y-6">
                {csvData && !auditResult && (
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold">
                      {t(language, "preview.title")}
                    </h2>
                    <DataPreviewTable
                      headers={csvData.headers}
                      rows={csvData.rows}
                    />
                  </Card>
                )}

                {csvData && rules.length > 0 && !auditResult && (
                  <Card className="p-6">
                    <Button
                      onClick={handleRunAudit}
                      disabled={isAuditing}
                      size="lg"
                      className="w-full"
                    >
                      {isAuditing
                        ? t(language, "audit.running")
                        : t(language, "audit.runAudit")}
                    </Button>
                  </Card>
                )}

                {auditResult && (
                  <AuditResults
                    auditResult={auditResult}
                    originalData={csvData!}
                    onBack={() => setAuditResult(null)}
                    onReAudit={() => handleRunAudit()}
                  />
                )}

                {csvData && rules.length === 0 && (
                  <Card className="p-6 border border-dashed">
                    <div className="flex items-center justify-center text-center">
                      <div>
                        <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          {t(language, "page.addValidationRules")}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </LanguageProvider>
  );
}
