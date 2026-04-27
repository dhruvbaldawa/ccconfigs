// ABOUTME: Shared JSONC parsing helpers for ccconfigs generators and tests.
// ABOUTME: Supports comments and trailing commas without pulling target-specific dependencies.

function normalizeNewlines(value: string): string {
  return value.replace(/\r\n/g, '\n');
}

function stripJsonComments(input: string): string {
  let output = '';
  let inString = false;
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let index = 0; index < input.length; index++) {
    const char = input[index];
    const next = input[index + 1];

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false;
        output += char;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false;
        index++;
      } else if (char === '\n') {
        output += char;
      }
      continue;
    }

    if (inString) {
      output += char;

      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      output += char;
      continue;
    }

    if (char === '/' && next === '/') {
      inLineComment = true;
      index++;
      continue;
    }

    if (char === '/' && next === '*') {
      inBlockComment = true;
      index++;
      continue;
    }

    output += char;
  }

  return output;
}

function stripTrailingCommas(input: string): string {
  let output = '';
  let inString = false;
  let escaped = false;

  for (let index = 0; index < input.length; index++) {
    const char = input[index];

    if (inString) {
      output += char;

      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }

      continue;
    }

    if (char === '"') {
      inString = true;
      output += char;
      continue;
    }

    if (char === ',') {
      let lookahead = index + 1;

      while (lookahead < input.length && /\s/.test(input[lookahead])) {
        lookahead++;
      }

      if (lookahead < input.length && (input[lookahead] === '}' || input[lookahead] === ']')) {
        continue;
      }
    }

    output += char;
  }

  return output;
}

export function parseJsonc<T>(raw: string): T {
  const normalized = normalizeNewlines(raw).trim();
  if (!normalized) {
    return {} as T;
  }

  const withoutComments = stripJsonComments(normalized);
  const withoutTrailingCommas = stripTrailingCommas(withoutComments);
  return JSON.parse(withoutTrailingCommas) as T;
}
