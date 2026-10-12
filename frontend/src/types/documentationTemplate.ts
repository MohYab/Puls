import type { NoteContent } from "./note";

export interface DocumentationTemplate {
  id: string;
  name: string;
  description: string | null;
  templateContent: {
    sections: (keyof NoteContent)[];
  };
}
