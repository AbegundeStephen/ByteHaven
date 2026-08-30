import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/** True only after the client has mounted — avoids SSR/localStorage
 * hydration mismatches for persisted client state like the cart. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
