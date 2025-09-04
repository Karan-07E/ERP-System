/**
 * Utility functions for handling session when tabs are closed
 */

/**
 * Handles tab close and browser session detection
 * Uses a heartbeat system to detect when a tab has been closed and reopened
 * @param {Function} logoutCallback - Function to call to perform logout
 */
export const setupTabCloseListener = (logoutCallback) => {
  // Session constants
  const HEARTBEAT_KEY = 'authHeartbeat';
  const TAB_ID_KEY = 'authTabId'; 
  const HEARTBEAT_INTERVAL = 3000; // 3 seconds
  
  // Generate a unique tab ID for this browser tab instance
  const tabId = Math.random().toString(36).substring(2, 15);
  
  // Store the tab ID in sessionStorage (cleared when tab is closed)
  sessionStorage.setItem(TAB_ID_KEY, tabId);
  
  // Update last active timestamp function
  const updateHeartbeat = () => {
    try {
      localStorage.setItem(HEARTBEAT_KEY, JSON.stringify({
        timestamp: Date.now(),
        tabId: tabId
      }));
    } catch (e) {
      console.error('Error updating heartbeat:', e);
    }
  };

  // Start the initial heartbeat
  updateHeartbeat();
  
  // Set up periodic heartbeat to indicate the tab is still open
  const heartbeatInterval = setInterval(updateHeartbeat, HEARTBEAT_INTERVAL);
  
  // When the page loads, check if this is a new tab session
  const checkTabSession = () => {
    try {
      // If we have a tab ID in localStorage but not in sessionStorage, 
      // it means the tab was closed and reopened
      const heartbeatData = JSON.parse(localStorage.getItem(HEARTBEAT_KEY) || '{}');
      const storedTabId = heartbeatData.tabId;
      const currentTabId = sessionStorage.getItem(TAB_ID_KEY);
      
      console.log('Checking tab session:', { 
        storedTabId, 
        currentTabId, 
        heartbeatTimestamp: heartbeatData.timestamp 
      });
      
      if (storedTabId && storedTabId !== currentTabId) {
        console.log('Tab was closed and reopened. Logging out.');
        logoutCallback();
      } else {
        console.log('Same tab session continuing');
      }
    } catch (e) {
      console.error('Error checking tab session:', e);
    }
  };
  
  // Run check immediately on page load
  checkTabSession();
  
  // Force update on page visibility changes to catch more edge cases
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      checkTabSession();
      updateHeartbeat();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Return cleanup function
  return () => {
    clearInterval(heartbeatInterval);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};
