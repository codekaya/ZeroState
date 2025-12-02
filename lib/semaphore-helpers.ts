/**
 * Client-side helper to ensure Semaphore group is synced
 * Calls API route to sync group server-side
 */
export async function ensureGroupSynced(): Promise<void> {
  try {
    // Call API route to sync group (server-side)
    const response = await fetch('/api/semaphore/sync', {
      method: 'POST',
    });
    
    if (!response.ok) {
      console.warn('Failed to sync Semaphore group, continuing anyway');
    }
  } catch (error) {
    console.warn('Error syncing Semaphore group:', error);
    // Don't throw - allow proof generation to continue with fallback
  }
}

