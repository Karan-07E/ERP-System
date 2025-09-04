/**
 * Browser compatibility polyfills for session management features
 */

// Session Storage check
(function() {
  try {
    if (typeof sessionStorage === "undefined") {
      console.warn("Session storage not available. Auto-logout functionality may be limited.");
    }
  } catch (e) {
    console.warn("Session storage access denied. Auto-logout functionality may be limited.");
  }
})();

// BeforeUnload event check
(function() {
  if (typeof window.addEventListener !== "function") {
    console.warn("Window event listener not available. Auto-logout functionality may be limited.");
  }
})();
