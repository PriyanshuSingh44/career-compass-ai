/**
 * Validates a GitHub profile URL
 * @param url - The URL to validate
 * @returns true if valid GitHub profile URL
 */
export function isValidGitHubUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const parsedUrl = new URL(url);
    
    // Check if it's a GitHub URL
    if (!parsedUrl.hostname.match(/^(www\.)?github\.com$/i)) {
      return false;
    }
    
    // Check if it has a username (path should be /username or /username/)
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    if (pathParts.length === 0 || pathParts.length > 2) {
      return false;
    }
    
    // GitHub username validation (alphanumeric, hyphens, underscores, 1-39 chars)
    const username = pathParts[0];
    const usernameRegex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
    
    return usernameRegex.test(username);
  } catch {
    return false;
  }
}

/**
 * Validates a LinkedIn profile URL
 * @param url - The URL to validate
 * @returns true if valid LinkedIn profile URL
 */
export function isValidLinkedInUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const parsedUrl = new URL(url);
    
    // Check if it's a LinkedIn URL
    if (!parsedUrl.hostname.match(/^(www\.)?(linkedin\.com|lnkd\.in)$/i)) {
      return false;
    }
    
    // Check if it has a path (profile path)
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    return pathParts.length >= 2 && pathParts[0] === 'in';
  } catch {
    return false;
  }
}

/**
 * Extracts GitHub username from a valid GitHub URL
 * @param url - GitHub profile URL
 * @returns Username or null if invalid
 */
export function extractGitHubUsername(url: string): string | null {
  if (!isValidGitHubUrl(url)) return null;
  
  try {
    const parsedUrl = new URL(url);
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    return pathParts[0] || null;
  } catch {
    return null;
  }
}
