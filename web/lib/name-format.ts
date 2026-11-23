import { formats } from "@sep/core";

export type NameFormat = "slug" | "pascal" | "camel" | "snake";

/** The cases a name can be copied in, in menu order. */
export const NAME_FORMATS: { id: NameFormat; label: string; example: string }[] = [
  { id: "slug", label: "kebab-case", example: formats("my project").slug },
  { id: "pascal", label: "PascalCase", example: formats("my project").pascal },
  { id: "camel", label: "camelCase", example: formats("my project").camel },
  { id: "snake", label: "snake_case", example: formats("my project").snake },
];

export const formatLabel = (id: NameFormat) => NAME_FORMATS.find((f) => f.id === id)?.label ?? id;

export const formatName = (name: string, id: NameFormat) => formats(name)[id];
