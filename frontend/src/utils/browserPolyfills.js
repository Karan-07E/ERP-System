/**
 * Browser compatibility polyfills for session management features
 */

// Storage check
(function() {
  try {
    // Check sessionStorage
    if (typeof sessionStorage === "undefined") {
      console.warn("Session storage not available. Auto-logout functionality may be limited.");
    } else {
      // Test that sessionStorage works
      sessionStorage.setItem('test', '1');
      sessionStorage.removeItem('test');
    }
    
    // Check localStorage
    if (typeof localStorage === "undefined") {
      console.warn("Local storage not available. Auto-logout functionality may be limited.");
    } else {
      // Test that localStorage works
      localStorage.setItem('test', '1');
      localStorage.removeItem('test');
    }
  } catch (e) {
    console.warn("Storage access denied. Auto-logout functionality may be limited. Error:", e);
  }
})();

// Page Visibility API check
(function() {
  if (typeof document.addEventListener !== "function") {
    console.warn("Document event listener not available. Auto-logout functionality may be limited.");
  }
  
  // Add visibility API support for older browsers
  if (typeof document.hidden === "undefined") {
    let hidden, visibilityChange;
    
    if (typeof document.msHidden !== "undefined") {
      hidden = "msHidden";
      visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      hidden = "webkitHidden";
      visibilityChange = "webkitvisibilitychange";
    }
    
    // If found, add prefixed properties
    if (hidden) {
      Object.defineProperty(document, "hidden", {
        get: function() { return document[hidden]; }
      });
      Object.defineProperty(document, "visibilityState", {
        get: function() { 
          return document[hidden] ? "hidden" : "visible"; 
        }
      });
    }
  }
})();
