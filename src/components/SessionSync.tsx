import { useEffect } from "react";

export function SessionSync() {
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "session" || event.key === null) {
        if (!event.newValue) {
          console.log("Session cleared in another tab. Logging out...");
          window.location.href = "/login";
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return null;
}

// import { useEffect } from "react";

// export function SessionSync() {
//   useEffect(() => {
//     const handleStorageChange = (event: StorageEvent) => {
//       // DEBUG: Uncomment this to see exactly what the browser sends
//       // console.log("Storage event:", event.key, event.newValue);

//       // 1. Check if "session" changed OR if "localStorage.clear()" was called (key is null)
//       if (event.key === "session" || event.key === null) {
//         // 2. Double check: Is the session actually gone from this tab?
//         // We read directly from localStorage to be 100% sure.
//         const sessionExists = localStorage.getItem("session");

//         if (!sessionExists) {
//           console.log("Session sync: Logout detected. Redirecting...");

//           // 3. Clear memory explicitly
//           sessionStorage.clear();

//           // 4. Force Redirect
//           window.location.href = "/login";
//         }
//       }
//     };

//     window.addEventListener("storage", handleStorageChange);

//     return () => {
//       window.removeEventListener("storage", handleStorageChange);
//     };
//   }, []);

//   return null;
// }
