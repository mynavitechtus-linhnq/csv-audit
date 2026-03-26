export enum ValidationRuleType {
  STRING = "string",
  REQUIRED = "required",
  EMAIL = "email",
  NUMBER = "number",
  PATTERN = "pattern",
  DATE = "date",
  ENUM = "enum",
  BOOLEAN = "boolean",
  MIN_LENGTH = "minLength",
  MAX_LENGTH = "maxLength",
}

export interface ValidationRule {
  id: string;
  columnName: string;
  ruleType: ValidationRuleType;
  errorMessage: string;
  isRequired?: boolean;
  params?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    dateFormat?: string;
    enumValues?: string[];
  };
}

export interface ValidationError {
  rowIndex: number;
  columnName: string;
  value: string;
  errorMessage: string;
  ruleId: string;
}

export interface ParsedCSVData {
  headers: string[];
  rows: Record<string, string>[];
}

export interface AuditResult {
  totalRows: number;
  totalColumns: number;
  totalErrors: number;
  errors: ValidationError[];
}
