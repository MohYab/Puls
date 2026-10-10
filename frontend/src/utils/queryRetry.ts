import { ApiError } from "../services/apiClient";

const MAX_RETRIES = 2;

// Client errors (4xx) cannot be fixed by retrying, so fail fast on them.
// The parameter is typed as Error so that TanStack Query infers `Error` as the query's error type.
export function retryUnlessClientError(failureCount: number, error: Error): boolean {
  if (error instanceof ApiError && error.status < 500) return false;
  return failureCount < MAX_RETRIES;
}
