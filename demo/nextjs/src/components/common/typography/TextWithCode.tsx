import { Code } from "./Typography";

/**
 * Renders text with a substring wrapped in <Code>. Use when a const string contains
 * a camelCase identifier you want to style as code.
 *
 * @example
 * <TextWithCode text="Updating with onConflict" code="onConflict" />
 */
export const TextWithCode = ({ text, code }: { text: string; code: string }) => {
  const [before, after] = text.split(code, 2);
  return (
    <>
      {before}
      <Code sx={{ fontWeight: "550 !important" }}>{code}</Code>
      {after ?? ""}
    </>
  );
}
