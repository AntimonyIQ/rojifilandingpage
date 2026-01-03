import { useEffect } from "react";

export function SessionSync() {
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "session" || event.key === null) {
        if (!event.newValue) {
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
