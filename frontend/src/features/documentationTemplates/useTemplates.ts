import { useQuery } from "@tanstack/react-query";
import { retryUnlessClientError } from "../../utils/queryRetry";
import { getTemplates } from "./templateService";

export function useTemplates(enabled = true) {
  return useQuery({
    queryKey: ["documentationTemplates"],
    queryFn: getTemplates,
    enabled,
    retry: retryUnlessClientError,
  });
}
