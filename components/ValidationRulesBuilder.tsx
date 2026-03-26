"use client";

import React, { useState, useMemo } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ValidationRule, ValidationRuleType } from "@/lib/types";
import { t, getDefaultErrorMessage, Language } from "@/lib/i18n";
import { useLanguage } from "@/lib/LanguageProvider";

interface ValidationRulesBuilderProps {
  columns: string[];
  onAddRule: (rule: ValidationRule) => void;
  onRemoveRule: (ruleId: string) => void;
  rules: ValidationRule[];
}

const getRuleTypes = (
  language: Language,
): { value: ValidationRuleType; label: string }[] => [
  { value: ValidationRuleType.STRING, label: t(language, "rules.string") },
  { value: ValidationRuleType.REQUIRED, label: t(language, "rules.required") },
  { value: ValidationRuleType.EMAIL, label: t(language, "rules.email") },
  { value: ValidationRuleType.NUMBER, label: t(language, "rules.number") },
  { value: ValidationRuleType.DATE, label: t(language, "rules.date") },
  { value: ValidationRuleType.BOOLEAN, label: t(language, "rules.boolean") },
  { value: ValidationRuleType.ENUM, label: t(language, "rules.enum") },
  { value: ValidationRuleType.PATTERN, label: t(language, "rules.pattern") },
  {
    value: ValidationRuleType.MIN_LENGTH,
    label: t(language, "rules.minLength"),
  },
  {
    value: ValidationRuleType.MAX_LENGTH,
    label: t(language, "rules.maxLength"),
  },
];

export default function ValidationRulesBuilder({
  columns,
  onAddRule,
  onRemoveRule,
  rules,
}: ValidationRulesBuilderProps) {
  const language = useLanguage();
  const [selectedColumn, setSelectedColumn] = useState<string>(
    columns.length > 0 ? columns[0] : "__placeholder__",
  );
  const [selectedRuleType, setSelectedRuleType] = useState<ValidationRuleType>(
    ValidationRuleType.STRING,
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [pattern, setPattern] = useState("");
  const [minLength, setMinLength] = useState("");
  const [maxLength, setMaxLength] = useState("");
  const [dateFormat, setDateFormat] = useState(t(language, "rules.dateFormat"));
  const [enumValues, setEnumValues] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [searchColumn, setSearchColumn] = useState("");

  const filteredColumns = useMemo(() => {
    if (!searchColumn.trim()) return columns;
    // Normalize both search and column for Unicode-insensitive search
    const normalize = (str: string) =>
      str.normalize("NFKC").toLocaleLowerCase();
    const lower = normalize(searchColumn);
    return columns.filter((col) => normalize(col).includes(lower));
  }, [searchColumn, columns]);

  // Ensure selectedColumn is always valid and defaults to first filtered column
  React.useEffect(() => {
    if (filteredColumns.length === 0) {
      if (selectedColumn !== "__placeholder__")
        setSelectedColumn("__placeholder__");
    } else if (!filteredColumns.includes(selectedColumn)) {
      setSelectedColumn(filteredColumns[0]);
    }
  }, [filteredColumns]);

  const handleAddRule = () => {
    if (!selectedColumn || selectedColumn === "__placeholder__") {
      alert(t(language, "rules.selectColumnAlert"));
      return;
    }

    if (
      rules.some(
        (r) =>
          r.columnName === selectedColumn && r.ruleType === selectedRuleType,
      )
    ) {
      alert(t(language, "rules.duplicateRule"));
      return;
    }

    const finalErrorMessage =
      errorMessage || getDefaultErrorMessage(language, selectedRuleType);

    const rule: ValidationRule = {
      id: `${selectedColumn}-${selectedRuleType}-${Date.now()}`,
      columnName: selectedColumn,
      ruleType: selectedRuleType,
      errorMessage: finalErrorMessage,
      isRequired,
      params: {},
    };

    if (selectedRuleType === ValidationRuleType.PATTERN && pattern) {
      rule.params!.pattern = pattern;
    }
    if (selectedRuleType === ValidationRuleType.MIN_LENGTH && minLength) {
      rule.params!.minLength = parseInt(minLength);
    }
    if (selectedRuleType === ValidationRuleType.MAX_LENGTH && maxLength) {
      rule.params!.maxLength = parseInt(maxLength);
    }
    if (selectedRuleType === ValidationRuleType.DATE && dateFormat) {
      rule.params!.dateFormat = dateFormat;
    }
    if (selectedRuleType === ValidationRuleType.ENUM && enumValues) {
      rule.params!.enumValues = enumValues.split(",").map((v) => v.trim());
    }

    onAddRule(rule);

    // Reset form
    setSelectedColumn(columns.length > 0 ? columns[0] : "__placeholder__");
    setSelectedRuleType(
      RULE_TYPES.length > 0 ? RULE_TYPES[0].value : ValidationRuleType.STRING,
    );
    setErrorMessage("");
    setPattern("");
    setMinLength("");
    setMaxLength("");
    setDateFormat(t(language, "rules.dateFormat"));
    setEnumValues("");
    setIsRequired(false);
    setSearchColumn("");
    // If you have a search state for rule type dropdown, reset it here as well
  };

  const columnRulesCount = (col: string) =>
    rules.filter((r) => r.columnName === col).length;

  const RULE_TYPES = getRuleTypes(language).filter(
    (type) => type.value !== ValidationRuleType.REQUIRED,
  );

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <Label htmlFor="column-select" className="text-sm">
            {t(language, "rules.column")}
          </Label>
          <Select
            value={
              filteredColumns.length === 0
                ? "__placeholder__"
                : filteredColumns.includes(selectedColumn)
                  ? selectedColumn
                  : filteredColumns[0]
            }
            onValueChange={(val) => {
              if (val !== "__placeholder__") setSelectedColumn(val);
            }}
            disabled={filteredColumns.length === 0}
          >
            <SelectTrigger id="column-select">
              <SelectValue placeholder={t(language, "rules.selectColumn")} />
            </SelectTrigger>
            {filteredColumns.length > 0 ? (
              <SelectContent searchable>
                <SelectItem value="__placeholder__">
                  {t(language, "rules.selectColumn")}
                </SelectItem>
                {filteredColumns.map((col) => (
                  <SelectItem
                    key={col}
                    value={col}
                    className="whitespace-normal break-words max-w-[220px]"
                  >
                    <span className="block whitespace-normal break-words max-w-[200px]">
                      {col}
                    </span>
                    {columnRulesCount(col) > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({columnRulesCount(col)}{" "}
                        {t(language, "rules.activeRules")})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            ) : null}
          </Select>
        </div>

        <div>
          <Label htmlFor="rule-type" className="text-sm">
            {t(language, "rules.ruleType")}
          </Label>
          <Select
            value={RULE_TYPES.length === 0 ? undefined : selectedRuleType}
            onValueChange={(val) =>
              setSelectedRuleType(val as ValidationRuleType)
            }
            disabled={RULE_TYPES.length === 0}
          >
            <SelectTrigger id="rule-type">
              <SelectValue />
            </SelectTrigger>
            {RULE_TYPES.length > 0 ? (
              <SelectContent searchable>
                {RULE_TYPES.map((type) => (
                  <SelectItem
                    key={type.value}
                    value={type.value}
                    className="whitespace-normal break-words max-w-[220px]"
                  >
                    <span className="block whitespace-normal break-words max-w-[200px]">
                      {type.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            ) : null}
          </Select>
        </div>

        {selectedRuleType === ValidationRuleType.PATTERN && (
          <div>
            <Label htmlFor="pattern-input" className="text-sm">
              {t(language, "rules.pattern.label")}
            </Label>
            <Input
              id="pattern-input"
              placeholder={t(language, "rules.pattern.placeholder")}
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="text-sm"
            />
          </div>
        )}

        {selectedRuleType === ValidationRuleType.MIN_LENGTH && (
          <div>
            <Label htmlFor="minlength-input" className="text-sm">
              {t(language, "rules.minLength.label")}
            </Label>
            <Input
              id="minlength-input"
              type="number"
              placeholder={t(language, "rules.minLength.placeholder")}
              value={minLength}
              onChange={(e) => setMinLength(e.target.value)}
              className="text-sm"
              min="0"
            />
          </div>
        )}

        {selectedRuleType === ValidationRuleType.MAX_LENGTH && (
          <div>
            <Label htmlFor="maxlength-input" className="text-sm">
              {t(language, "rules.maxLength.label")}
            </Label>
            <Input
              id="maxlength-input"
              type="number"
              placeholder={t(language, "rules.maxLength.placeholder")}
              value={maxLength}
              onChange={(e) => setMaxLength(e.target.value)}
              className="text-sm"
              min="0"
            />
          </div>
        )}

        {selectedRuleType === ValidationRuleType.DATE && (
          <div>
            <Label htmlFor="date-format-input" className="text-sm">
              {t(language, "rules.dateFormat.label")}
            </Label>
            <Input
              id="date-format-input"
              placeholder={t(language, "rules.dateFormat.placeholder")}
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t(language, "rules.dateFormat.default")}
            </p>
          </div>
        )}

        {selectedRuleType === ValidationRuleType.ENUM && (
          <div>
            <Label htmlFor="enum-values-input" className="text-sm">
              {t(language, "rules.enumValues.label")}
            </Label>
            <Input
              id="enum-values-input"
              placeholder={t(language, "rules.enumValues.placeholder")}
              value={enumValues}
              onChange={(e) => setEnumValues(e.target.value)}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t(language, "rules.enumValues.separator")}
            </p>
          </div>
        )}

        <div>
          <Label htmlFor="error-msg" className="text-sm">
            {t(language, "rules.errorMessage")}
          </Label>
          <Input
            id="error-msg"
            placeholder={getDefaultErrorMessage(language, selectedRuleType)}
            value={errorMessage}
            onChange={(e) => setErrorMessage(e.target.value)}
            className="text-sm"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is-required"
            checked={isRequired}
            onCheckedChange={(checked) => setIsRequired(checked === true)}
          />
          <Label
            htmlFor="is-required"
            className="text-sm font-normal cursor-pointer"
          >
            {t(language, "rules.isRequired")}
          </Label>
        </div>

        <Button onClick={handleAddRule} className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t(language, "rules.addRule")}
        </Button>
      </div>

      {rules.length > 0 && (
        <div className="space-y-2 mt-4 pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-muted-foreground">
              {t(language, "rules.activeRules")} ({rules.length})
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => rules.forEach((r) => onRemoveRule(r.id))}
            >
              {t(language, "rules.clearAll")}
            </Button>
          </div>
          <div className="space-y-2">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-start justify-between gap-2 p-2 bg-muted rounded text-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {rule.columnName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs">
                      {t(language, "rules.type")}:{" "}
                      {RULE_TYPES.find((t) => t.value === rule.ruleType)?.label}
                    </p>
                    {rule.isRequired && (
                      <Badge
                        variant="destructive"
                        className="text-xs bg-red-100 text-red-600 border-red-200"
                      >
                        {t(language, "rules.required")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs mt-1 line-clamp-2">
                    {t(language, "rules.errorMessage")}:{" "}
                    <span className="text-red-600">{rule.errorMessage}</span>
                  </p>
                </div>
                <button
                  onClick={() => onRemoveRule(rule.id)}
                  className="flex-shrink-0 mt-1 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remove rule"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
