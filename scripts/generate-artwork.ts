// Generate hand-drawn-on-paper blueprint artwork for bicaralabs using Gemini (nano-banana).
// Deps live in ../manairalabs-website/node_modules, so run from there:
//   cd ../manairalabs-website && set -a && source .env && set +a \
//     && npx tsx ../manairalabs-consulting/scripts/generate-artwork.ts
// Output -> manairalabs-consulting/public/artwork/*.png

import { GoogleGenAI } from '@google/genai';
import mime from 'mime';
import { writeFile, mkdir, readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../public/artwork');

// nano-banana; fall back to the older experimental image model if unavailable.
const MODELS = ['gemini-2.5-flash-image', 'gemini-2.0-flash-exp-image-generation'];

// Shared style so every drawing reads as one hand-drawn set.
const STYLE = `A richly DETAILED and COMPLEX engineering blueprint study — an intricate technical drawing, not a
simple icon. Combine an EXPLODED assembly (main parts separated along their axes with thin dashed
alignment lines) WITH CUTAWAY cross-sections and several small auxiliary detail insets / enlarged views.
Many components and sub-assemblies, section hatching, dimension lines with arrowheads and ticks, callout
leaders. Keep it engineering-grade and dense but still elegant and readable; asymmetric composition, a
few parts cropped at the edges. Hand-drawn with a fine blue ballpoint pen on pale light-blue engineering
grid paper: sketchy slightly-imperfect linework, light cross-hatch shading. A few small hand-lettered
part labels are fine, but NO colour names, NO hex codes, NO watermark, NO signature. Monochrome blue
ballpoint ink on light-blue paper.`;

// UI-mockup style for portfolio (app screens, not machines) — same hand-drawn blueprint look.
const MOCKUP_STYLE = `A hand-drawn UI wireframe / app-screen mockup, sketched by hand with a fine blue ballpoint pen on
pale light-blue grid paper. Show the app inside a browser window or phone frame, with interface elements
— panels, lists, buttons, chat bubbles, tables, charts — drawn as neat sketchy wireframe boxes and
placeholder lines (use squiggles / lorem-style strokes for text, not real words). Annotate a couple of
parts with small hand-lettered callout labels and dimension ticks, like a designer's blueprint. Sketchy
slightly-imperfect linework, monochrome blue ballpoint on light-blue paper, generous spacing, elegant.
NO real brand logos, NO colour names, NO hex codes, NO watermark.`;

// Professional aerospace-CAD style, driven by an uploaded reference drawing (ESA INTEGRAL).
const CAD_STYLE = `Match the drawing TYPE and precision of the attached reference engineering drawing — a clean
EXPLODED AXONOMETRIC CAD assembly with part callouts on straight leader lines, coordinate-axis arrows, a
drawing-sheet border with zone markers, and a title block in the bottom-right — BUT render it as a
BLUEPRINT: crisp thin dark-blue (#0F6CAB) technical lines on pale light-blue engineering GRAPH-PAPER, with
a fine, even blue grid covering the whole sheet. High resolution with sharp, smooth anti-aliased lines.
The exploded assembly should fill most of the sheet. Precise, clean and professional — NOT sketchy, NOT
hand-drawn, NO shading or 3D rendering, no colour fills.
IMPORTANT: do NOT render ANY text, letters, numbers, labels, dimensions, callout text, or title-block
text anywhere in the image — leave every label position and the title block completely blank/empty.
Text is added separately, so the drawing itself must contain zero words.`;

const IMAGES: { filename: string; aspect: string; subject: string; style?: string; ref?: string }[] = [
  { filename: 'hero-cad', aspect: '16:9', style: CAD_STYLE,
    ref: '/private/tmp/claude-501/-Users-arifsetiawan-projects-manairalabs-bicara-mgmt/e3de4ad2-aae7-4379-a2d5-d848adc03297/scratchpad/ref2.jpg',
    subject:
    'an EXPLODED axonometric assembly of an abstract modular device, its units separated and floating apart along a vertical centre axis — from top: a detailed compute unit, a flat rounded module, a boxy module beside a mesh panel, a drum/cylinder, a platform with ports, and a base ring. Include thin leader lines, small node dots and coordinate-axis arrows, but absolutely NO text or labels anywhere' },

  { filename: 'exploded-modules', aspect: '4:3', subject:
    'an exploded axonometric of cubic building modules floating apart along their assembly axes, joined by dashed construction guide lines; only a partial cluster, several cubes cropped off the edges' },
  { filename: 'structural-frame', aspect: '16:9', subject:
    'a fragment of an architectural space-frame / steel truss — a partial lattice of beams and joint nodes in perspective, incomplete and cropped, with one joint detail enlarged and called out beside it' },
  { filename: 'jet-engine', aspect: '4:3', subject:
    'a highly-detailed turbofan JET ENGINE cutaway in longitudinal section — the fan, multi-stage low- and high-pressure compressors, combustion chamber, turbine stages, shafts and exhaust nozzle, with individual blades, plus two exploded detail insets of a blade and a bearing; intricate mechanical engineering drawing' },
  { filename: 'rocket-cutaway', aspect: '4:3', subject:
    'a complex launch VEHICLE study combining exploded and cutaway views — multiple stages separated along a vertical axis, an engine cluster of nozzles, fuel and oxidiser tanks shown in cross-section, interstage structures and an avionics bay, with several small section details and callouts' },
  { filename: 'satellite-detail', aspect: '4:3', subject:
    'a detailed SATELLITE / spacecraft study — the central bus with an internal cutaway, deployed and folded solar arrays, dish and horn antennas, reaction wheels, thrusters and sensor booms, with several labelled subsystem detail insets and dashed deployment paths' },
  { filename: 'ai-core', aspect: '16:9', subject:
    'a dense system schematic of an AI platform — a central compute core wired to memory, a retrieval store, a guardrail module and I/O nodes, with sub-modules, right-angled data buses and small enlarged detail call-outs, like an intricate engineering block diagram' },

  { filename: 'hero-main', aspect: '16:9', subject:
    'a grand, wide master architecture blueprint of the AI system a whole business runs on — a central AI engine/core in the middle wired out to labelled modules spread across the sheet: a chat / agent unit, a data store, a guardrail gate, a finance panel, a CRM board, and integration ports on the edges — combining exploded assembly, cutaway and schematic wiring, with dimension lines, connection buses and callout details; dense but elegant, filling the whole wide sheet' },

  // --- per-article blog covers (one representative drawing each) ---
  { filename: 'cover-costs', aspect: '16:9', subject:
    'an exploded AI system where each module is tagged like a line item in a bill of materials, with dimension lines and a small totals / cost table in the corner — a cost breakdown drawn as an engineering parts list' },
  { filename: 'cover-use-cases', aspect: '16:9', subject:
    'a catalogue plate of five distinct small machine modules in a row, each numbered 01–05 — a chat/handset agent, a document scanner, a knowledge-store drum, a report press, and a funnel — each a compact labelled technical sketch' },
  { filename: 'cover-governance', aspect: '16:9', subject:
    'a control / governance schematic — an AI core inside a fenced enclosure with an access gate, a large kill-switch lever, a log spool, and least-privilege valves on the data lines, with warning callouts' },
  { filename: 'cover-bahasa', aspect: '16:9', subject:
    'a language-translation apparatus drawn as a machine — text entering one side and leaving the other through tuning dials labelled for tone and register, a rotating dictionary drum and a small waveform, like a linguistics engine' },
  { filename: 'cover-finetune-rag', aspect: '16:9', subject:
    'a comparison plate of three labelled apparatus side by side — a simple lever, a retrieval library arm reaching into shelves, and a precision tuning machine with fine adjustment screws — each captioned as a method' },
  { filename: 'cover-infra-cloud', aspect: '16:9', subject:
    'a decision / comparison drawing — an on-premise server-rack cabinet beside a cloud-hosted node, joined by a switch and a forking selector, with dimension lines and small trade-off callouts' },
  { filename: 'cover-whatsapp', aspect: '16:9', subject:
    'a messaging-agent switchboard schematic — a handset / speech bubble feeding messages into an AI routing engine that branches to an auto-reply arm and a human-handoff arm, drawn like a telephone-exchange diagram' },
  { filename: 'cover-buy-build', aspect: '16:9', subject:
    'a decision-tree apparatus forking into an off-the-shelf boxed unit on one branch and a custom-fabricated assembly on the other, both feeding into a combined stack, labelled buy / build / both' },
  { filename: 'cover-data-private', aspect: '16:9', subject:
    'a cutaway of a secure data vault enclosure containing an AI core — a boundary wall, combination lock, access valves, and a residency marker pin — a data-privacy schematic' },
  { filename: 'cover-pilot-production', aspect: '16:9', subject:
    'a horizontal production-pipeline apparatus with four labelled stages — scope, build, harden, ship — parts travelling along a conveyor, with a 90-day dimension scale ruled beneath it' },

  // --- portfolio app-screen mockups (UI wireframes, not machines) ---
  { filename: 'portfolio-whatsapp', aspect: '16:9', style: MOCKUP_STYLE, subject:
    'a phone showing a WhatsApp-style customer-service chat (message bubbles and quick-reply chips) beside a browser "agent console" dashboard with a conversation queue list and a hand-off-to-human button' },
  { filename: 'portfolio-bookkeeping', aspect: '16:9', style: MOCKUP_STYLE, subject:
    'a browser finance dashboard — summary balance cards and a cashflow chart along the top, a transactions / ledger table below, and a small side chat panel where a user types a transaction in plain language' },
  { filename: 'portfolio-extraction', aspect: '16:9', style: MOCKUP_STYLE, subject:
    'a browser document-extraction screen — an uploaded invoice/document preview on the left and an extracted structured-data table with field rows on the right, with a confirm button' },
  { filename: 'portfolio-knowledge', aspect: '16:9', style: MOCKUP_STYLE, subject:
    'a browser internal-knowledge assistant — a chat/search panel in the centre with a typed question and an answer, and a side list of cited source documents' },
  { filename: 'portfolio-leads', aspect: '16:9', style: MOCKUP_STYLE, subject:
    'a browser CRM lead board — a pipeline of lead cards arranged in columns, each card with a small AI "score" badge, and a right-hand side panel showing a selected lead\'s details' },
];

async function generate(ai: GoogleGenAI, img: (typeof IMAGES)[number]) {
  const prompt = `${img.style ?? STYLE}\n\nSubject: ${img.subject}.\nAspect ratio ${img.aspect}.`;
  const parts: any[] = [];
  if (img.ref) {
    const buf = await readFile(img.ref);
    const ext = img.ref.split('.').pop()!.toLowerCase();
    parts.push({ inlineData: { mimeType: `image/${ext === 'jpg' ? 'jpeg' : ext}`, data: buf.toString('base64') } });
  }
  parts.push({ text: prompt });
  for (const model of MODELS) {
    try {
      console.log(`\n[${img.filename}] model=${model}${img.ref ? ' (+ref)' : ''} ...`);
      const response = await ai.models.generateContentStream({
        model,
        config: {
          responseModalities: ['IMAGE', 'TEXT'] as any,
          imageConfig: { aspectRatio: img.aspect, imageSize: '2K' } as any,
        },
        contents: [{ role: 'user' as const, parts }],
      });
      let saved = false;
      for await (const chunk of response) {
        const part = chunk.candidates?.[0]?.content?.parts?.[0];
        const inline = part?.inlineData;
        if (inline?.data) {
          const ext = mime.getExtension(inline.mimeType || '') || 'png';
          const file = path.join(OUTPUT_DIR, `${img.filename}.${ext}`);
          await writeFile(file, Buffer.from(inline.data, 'base64'));
          console.log(`  saved ${file}`);
          saved = true;
        } else if (chunk.text) {
          console.log(`  note: ${chunk.text.slice(0, 120)}`);
        }
      }
      if (saved) return;
      console.log('  (no image in response, trying next model)');
    } catch (e: any) {
      console.log(`  error on ${model}: ${e?.message || e}`);
    }
  }
  console.error(`  FAILED: ${img.filename}`);
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY required (source manairalabs-website/.env).');
    process.exit(1);
  }
  const only = process.argv.slice(2);
  const list = only.length ? IMAGES.filter((i) => only.includes(i.filename)) : IMAGES;
  await mkdir(OUTPUT_DIR, { recursive: true });
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  console.log(`Generating ${list.length} drawing(s) -> ${OUTPUT_DIR}`);
  for (const img of list) await generate(ai, img);
  console.log('\nDone.');
}

main();
