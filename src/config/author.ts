// Authorship identity for the site (E-E-A-T).
// The author is the BRAND, not a named individual (by choice — the principal
// does not want to be named publicly). Google accepts Organization authorship;
// trust is carried by the company About page, real methodology, and case-study
// outcomes rather than a personal byline.
export const BRAND = {
  name: 'Bicara Labs',
  url: 'https://bicaralabs.com/about',
  // Topics the practice genuinely works in — safe, true entity signals.
  knowsAbout: [
    'AI enablement',
    'Retrieval-augmented generation (RAG)',
    'LLM deployment',
    'Custom AI development',
    'AI strategy for Indonesian businesses',
  ] as string[],
}

/** schema.org Organization for the author, for use in article JSON-LD. */
export const authorOrg = (abs: (p: string) => string) => ({
  '@type': 'Organization',
  name: BRAND.name,
  url: abs('/'),
})
