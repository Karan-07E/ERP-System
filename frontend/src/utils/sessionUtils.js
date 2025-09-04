/**
 * Utility functions for handling session when tabs are closed
 */

/**
 * Handles tab close or browser navigation events
 * If the page is being closed, perform logout when the user returns
 * @param {Function} logoutCallback - Function to call to perform logout
 */
export const setupTabCloseListener = (logoutCallback) => {
  // Generate a unique session ID for this tab
  if (!sessionStorage.getItem('sessionId')) {
    sessionStorage.setItem('sessionId', Date.now().toString());
  }

  // Listen for beforeunload event (when user closes tab or navigates away)
  const handleBeforeUnload = () => {
    // When tab is being closed, mark the session for cleanup
    sessionStorage.setItem('tabClosed', 'true');
  };

  // When the page loads, check if we're returning after a tab close
  const checkTabClosed = () => {
    console.log('Checking for previous tab close...', {
      tabClosed: sessionStorage.getItem('tabClosed'),
      sessionId: sessionStorage.getItem('sessionId')
    });
    
    if (sessionStorage.getItem('tabClosed') === 'true') {
      console.log('Previous tab was closed without logout. Auto-logging out...');
      // Tab was closed previously, so log out
      logoutCallback();
      // Clean up session storage
      sessionStorage.removeItem('tabClosed');
      sessionStorage.removeItem('sessionId');
    } else {
      console.log('Session is fresh or continuing');
    }
  };

  // Add event listener for tab close
  window.addEventListener('beforeunload', handleBeforeUnload);
  
  // Run check immediately on page load
  checkTabClosed();

  // Return a cleanup function to remove event listeners
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
};
