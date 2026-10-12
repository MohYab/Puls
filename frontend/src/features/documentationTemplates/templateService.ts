import { apiClient } from "../../services/apiClient";
import type { DocumentationTemplate } from "../../types/documentationTemplate";

export function getTemplates() {
  return apiClient.get<DocumentationTemplate[]>("/documentation-templates");
}
