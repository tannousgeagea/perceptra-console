/**
 * Parse a structured search query string into key-value pairs
 * Supports formats like:
 * - tag:factory
 * - tenant:AMK
 * - location:"Gate 3"
 */
export interface ParsedQuery {
    [key: string]: string;
  }
  
  export function parseQueryString(query: string): ParsedQuery {
    if (!query.trim()) return {};
    
    const result: ParsedQuery = {};
    let currentPos = 0;
    
    while (currentPos < query.length) {
      // Skip whitespace
      while (currentPos < query.length && query[currentPos] === ' ') {
        currentPos++;
      }
      
      if (currentPos >= query.length) break;
      
      // Find the key (everything up to the colon)
      const keyStart = currentPos;
      while (currentPos < query.length && query[currentPos] !== ':') {
        currentPos++;
      }
      
      if (currentPos >= query.length || query[currentPos] !== ':') {
        // No colon found, treat the rest as a general search term
        result['text'] = query.substring(keyStart).trim();
        break;
      }
      
      const key = query.substring(keyStart, currentPos).trim();
      currentPos++; // Skip the colon
      
      // Find the value
      let value = '';
      // Check if value is quoted
      if (currentPos < query.length && query[currentPos] === '"') {
        currentPos++; // Skip opening quote
        const valueStart = currentPos;
        // Find closing quote
        while (currentPos < query.length && query[currentPos] !== '"') {
          currentPos++;
        }
        value = query.substring(valueStart, currentPos);
        if (currentPos < query.length) currentPos++; // Skip closing quote
      } else {
        // Unquoted value - read until whitespace
        const valueStart = currentPos;
        while (currentPos < query.length && query[currentPos] !== ' ') {
          currentPos++;
        }
        value = query.substring(valueStart, currentPos);
      }
      
      if (key) {
        result[key] = value;
      }
    }
    
    return result;
  }
  
  /**
   * Format parsed query as an array of tag strings for the API
   * E.g., { tenant: "AMK", location: "Gate 3" } becomes ["tenant:AMK", "location:Gate 3"]
   */
  export function formatQueryAsTagParams(parsedQuery: ParsedQuery): string[] {
    return Object.entries(parsedQuery)
      .filter(([key]) => key !== 'text') // Exclude general text search
      .map(([key, value]) => `${key}:${value}`);
  }
  