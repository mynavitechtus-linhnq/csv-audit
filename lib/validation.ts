import { ValidationRule, ValidationError, ParsedCSVData, ValidationRuleType } from './types';

export function validateCell(
  value: string,
  rule: ValidationRule
): { isValid: boolean; error?: string } {
  const trimmed = value.trim();

  switch (rule.ruleType) {
    case ValidationRuleType.REQUIRED:
      return {
        isValid: trimmed.length > 0,
        error: trimmed.length === 0 ? rule.errorMessage : undefined,
      };

    case ValidationRuleType.EMAIL: {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = trimmed.length === 0 || emailRegex.test(trimmed);
      return {
        isValid,
        error: !isValid ? rule.errorMessage : undefined,
      };
    }

    case ValidationRuleType.NUMBER: {
      const isValid = trimmed.length === 0 || !isNaN(Number(trimmed));
      return {
        isValid,
        error: !isValid ? rule.errorMessage : undefined,
      };
    }

    case ValidationRuleType.DATE: {
      if (trimmed.length === 0) return { isValid: true };
      
      const dateFormat = rule.params?.dateFormat || 'YYYY/MM/DD';
      // Simple date format validation - supports YYYY/MM/DD, YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY
      const dateRegex = /^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}$/;
      const isValid = dateRegex.test(trimmed) && !isNaN(Date.parse(trimmed));
      return {
        isValid,
        error: !isValid ? rule.errorMessage : undefined,
      };
    }

    case ValidationRuleType.ENUM: {
      if (!rule.params?.enumValues || rule.params.enumValues.length === 0) {
        return { isValid: true };
      }
      const isValid = trimmed.length === 0 || rule.params.enumValues.includes(trimmed);
      return {
        isValid,
        error: !isValid ? rule.errorMessage : undefined,
      };
    }

    case ValidationRuleType.BOOLEAN: {
      if (trimmed.length === 0) return { isValid: true };
      const isValid = ['true', 'false', 'yes', 'no', '0', '1'].includes(trimmed.toLowerCase());
      return {
        isValid,
        error: !isValid ? rule.errorMessage : undefined,
      };
    }

    case ValidationRuleType.PATTERN: {
      if (!rule.params?.pattern) {
        return { isValid: true };
      }
      try {
        const regex = new RegExp(rule.params.pattern);
        const isValid = trimmed.length === 0 || regex.test(trimmed);
        return {
          isValid,
          error: !isValid ? rule.errorMessage : undefined,
        };
      } catch {
        return { isValid: true };
      }
    }

    case ValidationRuleType.MIN_LENGTH: {
      const minLen = rule.params?.minLength ?? 0;
      const isValid = trimmed.length === 0 || trimmed.length >= minLen;
      return {
        isValid,
        error: !isValid ? rule.errorMessage : undefined,
      };
    }

    case ValidationRuleType.MAX_LENGTH: {
      const maxLen = rule.params?.maxLength ?? Infinity;
      const isValid = trimmed.length === 0 || trimmed.length <= maxLen;
      return {
        isValid,
        error: !isValid ? rule.errorMessage : undefined,
      };
    }

    default:
      return { isValid: true };
  }
}

export function runAudit(
  data: ParsedCSVData,
  rules: ValidationRule[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  data.rows.forEach((row, rowIndex) => {
    rules.forEach((rule) => {
      const value = row[rule.columnName] || '';
      
      // Check if field is required and empty
      if (rule.isRequired && value.trim().length === 0) {
        errors.push({
          rowIndex: rowIndex + 1, // 1-indexed for display
          columnName: rule.columnName,
          value,
          errorMessage: rule.errorMessage,
          ruleId: rule.id,
        });
        return;
      }
      
      const { isValid, error } = validateCell(value, rule);

      if (!isValid && error) {
        errors.push({
          rowIndex: rowIndex + 1, // 1-indexed for display
          columnName: rule.columnName,
          value,
          errorMessage: error,
          ruleId: rule.id,
        });
      }
    });
  });

  return errors;
}

export function parseCSV(fileContent: string): ParsedCSVData | null {
  try {
    // Simple CSV parser with auto delimiter detection (comma or semicolon)
    const lines = fileContent.split('\n').filter(line => line.trim());
    if (lines.length === 0) return null;

    // Detect delimiter: use semicolon if more in header, else comma
    const commaCount = (lines[0].match(/,/g) || []).length;
    const semicolonCount = (lines[0].match(/;/g) || []).length;
    const delimiter = semicolonCount > commaCount ? ';' : ',';

    // Remove quotes from headers and trim
    const headers = lines[0]
      .split(delimiter)
      .map(h => {
        let header = h.trim();
        if ((header.startsWith('"') && header.endsWith('"')) || 
            (header.startsWith("'") && header.endsWith("'"))) {
          header = header.slice(1, -1);
        }
        return header;
      });
    const rows: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter).map(v => {
        let value = v.trim();
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        return value;
      });
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }
    return { headers, rows };
  } catch {
    return null;
  }
}
