import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tag: z.string().default('Field Notes'),
    cover: z.string().optional(),
    dwg: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const portfolio = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/portfolio' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    client: z.string().optional(),
    tag: z.string().default('Case Study'),
    date: z.coerce.date(),
    outcome: z.string().optional(),
    cover: z.string().optional(),
    dwg: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, portfolio };
