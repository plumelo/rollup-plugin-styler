import path from "path";

export const isAbsolutePath = (path: string): boolean => /^(?:\/|(?:[A-Za-z]:)?[/\\|])/.test(path);

export const isRelativePath = (path: string): boolean => /^\.?\.[/\\]/.test(path);

export function normalizePath(...paths: string[]): string {
  const f = path.join(...paths).replaceAll("\\", "/");
  return /^\.[/\\]/.test(paths[0]) ? `./${f}` : f;
}

export const resolvePath = (...paths: string[]): string => normalizePath(path.resolve(...paths));

export const relativePath = (from: string, to: string): string =>
  normalizePath(path.relative(from, to));

export const humanlizePath = (file: string): string => relativePath(process.cwd(), file);
