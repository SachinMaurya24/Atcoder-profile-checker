/**
 * Application Configuration & Default Handle Management
 *
 * HOW TO SET YOUR DEFAULT ATCODER ID:
 * -----------------------------------
 * Option 1 (In Code):
 *   Change `DEFAULT_HANDLE` below to your own AtCoder ID.
 *   Example: export const DEFAULT_HANDLE = 'my_atcoder_id';
 *
 * Option 2 (In UI):
 *   Search for your handle in the dashboard and click the "⭐ Set as Default"
 *   button on your profile banner. It will be saved in your browser's localStorage!
 *
 * Option 3 (Via URL):
 *   Append `?user=your_id` or `?handle=your_id` to the dashboard URL.
 */

// Change this to your AtCoder handle if you want to hardcode your ID as the code default
export const DEFAULT_HANDLE = 'tourist';

export const STORAGE_KEY_DEFAULT_USER = 'atcoder_viz_default_handle';

/**
 * Resolves the default handle to load when the app starts.
 * Priority:
 * 1. URL search params (?user=... or ?handle=...)
 * 2. Custom handle saved by the user in localStorage
 * 3. DEFAULT_HANDLE constant above
 */
export function getDefaultHandle() {
  if (typeof window !== 'undefined') {
    // 1. Check URL parameters
    try {
      const params = new URLSearchParams(window.location.search);
      const queryUser = params.get('user') || params.get('handle');
      if (queryUser && queryUser.trim()) {
        return queryUser.trim();
      }
    } catch {
      // Ignore URL parsing errors
    }

    // 2. Check localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DEFAULT_USER);
      if (saved && saved.trim()) {
        return saved.trim();
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  // 3. Fallback to default handle
  return DEFAULT_HANDLE;
}

/**
 * Get the currently configured default handle (localStorage > DEFAULT_HANDLE)
 */
export function getSavedDefaultHandle() {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DEFAULT_USER);
      if (saved && saved.trim()) {
        return saved.trim();
      }
    } catch {
      // Ignore localStorage errors
    }
  }
  return DEFAULT_HANDLE;
}

/**
 * Set a new default handle in localStorage
 */
export function saveDefaultHandle(handle) {
  if (typeof window !== 'undefined' && handle && handle.trim()) {
    try {
      localStorage.setItem(STORAGE_KEY_DEFAULT_USER, handle.trim());
      return true;
    } catch (e) {
      console.error('Failed to save default handle to localStorage:', e);
      return false;
    }
  }
  return false;
}

/**
 * Clear the saved default handle from localStorage (reverts back to DEFAULT_HANDLE)
 */
export function resetDefaultHandle() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY_DEFAULT_USER);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
