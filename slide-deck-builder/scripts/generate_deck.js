/**
 * generate_deck.js — .pptx generation scaffold (PptxGenJS)
 *
 * Copy this file to /home/claude/deck/generate.js, fill in the slide functions
 * with real content from the source document, then run:
 *
 *   node /home/claude/deck/generate.js
 *
 * ---------------------------------------------------------------------------
 * SETUP (run once, before generating)
 * ---------------------------------------------------------------------------
 *   pip install markitdown --break-system-packages
 *   npm install -g pptxgenjs react react-dom react-icons sharp
 *
 * ---------------------------------------------------------------------------
 * SLIDE GENERATION PRINCIPLES
 * ---------------------------------------------------------------------------
 * - Build each slide as a function for clarity.
 * - Add speaker notes to every slide with 1-2 sentences of talking points.
 * - Use real content from the source document — no placeholders.
 * - For metrics/KPIs: use the large stat callout layout (60-72pt number).
 * - For processes: use numbered shape + text rows.
 * - For quotes: dark background card with centered white text.
 *
 * ---------------------------------------------------------------------------
 * HARD CONSTRAINTS (violating these corrupts the file or looks AI-generated)
 * ---------------------------------------------------------------------------
 * - Never use `#` with hex colors in PptxGenJS (causes corruption). Use "065A82".
 * - Never reuse option objects across shape calls — use factory functions for shadows.
 * - Use `bullet: true`, never the unicode bullet character.
 * - Use `breakLine: true` between array items.
 * - Never draw accent lines under titles.
 * See ../references/design.md for the full design system (palettes, type, layouts).
 */

const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

// --- Theme -----------------------------------------------------------------
// Replace with the palette chosen in Phase 3. See ../references/design.md.
const THEME = {
  dark: "21295C",   // cover + closing slide background
  accent: "1C7293",  // primary accent
  light: "FFFFFF",   // content slide background
  muted: "888888",   // captions / labels
  headerFont: "Georgia",
  bodyFont: "Calibri",
};

// --- Helpers ---------------------------------------------------------------

// Icon helper — always use fresh objects
async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

// Shadow factory — never reuse, always call fresh
const makeShadow = () => ({
  type: "outer", blur: 6, offset: 2, color: "000000", opacity: 0.12
});

// --- Presentation ----------------------------------------------------------

let pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "Deck Title";

// --- Slide builders --------------------------------------------------------
// One function per slide. Vary the layout — never repeat the same layout twice
// in a row (title only / two-column / icon row / 2x2 grid / large stat callout /
// quote card / timeline / table). See ../references/design.md.

function addCoverSlide() {
  const slide = pres.addSlide();
  slide.background = { color: THEME.dark };
  slide.addText("Deck Title", {
    x: 0.6, y: 2.1, w: 8.5, h: 1.0,
    fontFace: THEME.headerFont, fontSize: 40, bold: true, color: THEME.light,
  });
  slide.addText("Subtitle / tagline", {
    x: 0.6, y: 3.1, w: 8.5, h: 0.5,
    fontFace: THEME.bodyFont, fontSize: 16, color: THEME.light,
  });
  slide.addNotes("Opening line: who this is for and what they will get.");
}

function addStatSlide(value, label) {
  const slide = pres.addSlide();
  slide.addText(value, {
    x: 0.6, y: 1.8, w: 5.0, h: 1.6,
    fontFace: THEME.headerFont, fontSize: 66, bold: true, color: THEME.accent,
  });
  slide.addText(label, {
    x: 0.6, y: 3.4, w: 5.0, h: 0.5,
    fontFace: THEME.bodyFont, fontSize: 12, color: THEME.muted,
  });
  slide.addNotes("Explain what drove this number and why it matters.");
}

function addBulletSlide(title, bullets) {
  const slide = pres.addSlide();
  slide.addText(title, {
    x: 0.5, y: 0.5, w: 9.0, h: 0.9,
    fontFace: THEME.headerFont, fontSize: 36, bold: true, color: THEME.dark,
  });
  slide.addText(
    bullets.map((t) => ({ text: t, options: { bullet: true, breakLine: true } })),
    {
      x: 0.5, y: 1.6, w: 5.6, h: 3.2,
      fontFace: THEME.bodyFont, fontSize: 16, color: "333333", align: "left",
    }
  );
  // Every slide needs a visual element — no text-only slides.
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 6.4, y: 1.6, w: 3.1, h: 3.2,
    fill: { color: THEME.accent }, shadow: makeShadow(),
  });
  slide.addNotes("One or two sentences of talking points for this slide.");
}

function addQuoteSlide(quote, attribution) {
  const slide = pres.addSlide();
  slide.background = { color: THEME.dark };
  slide.addText(quote, {
    x: 1.0, y: 1.8, w: 8.0, h: 1.8,
    fontFace: THEME.headerFont, fontSize: 26, italic: true,
    color: THEME.light, align: "center",
  });
  slide.addText(attribution, {
    x: 1.0, y: 3.7, w: 8.0, h: 0.4,
    fontFace: THEME.bodyFont, fontSize: 12, color: THEME.light, align: "center",
  });
  slide.addNotes("Use safe social proof phrasing if the customer is confidential.");
}

// --- Build -----------------------------------------------------------------

async function build() {
  addCoverSlide();
  // [additional slides here — follow the blueprint chosen in Phase 2]

  await pres.writeFile({ fileName: "/home/claude/deck/output.pptx" });
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});

module.exports = {
  THEME,
  iconToBase64Png,
  makeShadow,
  addCoverSlide,
  addStatSlide,
  addBulletSlide,
  addQuoteSlide,
};
