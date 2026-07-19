export const languages = { en: 'EN', id: 'ID' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'en';

/** Derive the active locale from a pathname (`/id/...` → id, else en). */
export function getLangFromPath(pathname: string): Lang {
  return pathname.split('/')[1] === 'id' ? 'id' : 'en';
}

/** Prefix an en-root path (`/blog`) for the given locale. */
export function localize(path: string, lang: Lang): string {
  if (lang === 'id') return path === '/' ? '/id' : `/id${path}`;
  return path;
}

/** Given the current pathname, produce the equivalent path in the target locale. */
export function switchLangPath(pathname: string, target: Lang): string {
  const isId = pathname.split('/')[1] === 'id';
  const base = isId ? pathname.replace(/^\/id/, '') || '/' : pathname;
  return localize(base, target);
}
