// A tiny channel between the API client (plain TypeScript) and AuthProvider
// (React). The client reports an expired session; the provider logs out.

type Listener = () => void;

const unauthorizedListeners = new Set<Listener>();

export function onUnauthorized(listener: Listener): () => void {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
}

export function notifyUnauthorized(): void {
  unauthorizedListeners.forEach((listener) => listener());
}
