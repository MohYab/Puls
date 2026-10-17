import { useQuery } from "@tanstack/react-query";
import { retryUnlessClientError } from "../../utils/queryRetry";
import type { Doctor } from "../../types/doctor";
import { getDoctors } from "./doctorService";

// Defined outside the hook so TanStack Query can reuse the sorted result between renders.
function sortByName(doctors: Doctor[]) {
  return [...doctors].sort((a, b) => a.user.name.localeCompare(b.user.name, "sv"));
}

export function useDoctors(enabled = true) {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors,
    select: sortByName,
    enabled,
    retry: retryUnlessClientError,
  });
}
