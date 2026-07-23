// Single source of truth for the site's author identity (E-E-A-T).
// Google's strongest experience/expertise signal is a *named human* author, not
// an Organization. Enrich `sameAs` (LinkedIn/GitHub/etc), `description`, and any
// credentials once confirmed — keep every field factually true, never inflated.
export const AUTHOR = {
  name: 'Arif Setiawan',
  jobTitle: 'Founder & Principal, Bicara Labs',
  url: 'https://bicaralabs.com/about',
  // Topics the author genuinely works in — safe, true entity signals.
  knowsAbout: [
    'AI enablement',
    'Retrieval-augmented generation (RAG)',
    'LLM deployment',
    'Custom AI development',
    'AI strategy for Indonesian businesses',
  ] as string[],
  // Add verified profile URLs here (LinkedIn, GitHub, X) after confirmation.
  sameAs: [] as string[],
}

/** schema.org Person for the author, for use in article/breadcrumb JSON-LD. */
export const authorPerson = (abs: (p: string) => string) => ({
  '@type': 'Person',
  name: AUTHOR.name,
  jobTitle: AUTHOR.jobTitle,
  url: abs('/about'),
  knowsAbout: AUTHOR.knowsAbout,
  ...(AUTHOR.sameAs.length ? { sameAs: AUTHOR.sameAs } : {}),
})
