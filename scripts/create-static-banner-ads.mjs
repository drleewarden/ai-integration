import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceImage = path.join(root, "public", "ava-hart-reference-freckles.png");
const outputDir = path.join(root, "public", "ads");
const imageBase64 = await readFile(sourceImage, "base64");
const imageHref = `data:image/png;base64,${imageBase64}`;

const palette = {
  midnight: "#0f1526",
  deep: "#0a0f1c",
  tint: "#1c2340",
  cream: "#f5f0e8",
  white: "#fffdf9",
  gold: "#c9a84c",
  goldLight: "#e8c96a",
  forest: "#3d7a5f",
};

const campaign = {
  headlineLines: ["Stop guessing", "where AI fits."],
  compactHeadlineLines: ["Find AI", "savings."],
  shortHeadline: "Stop guessing where AI fits.",
  bodyLines: ["Get a practical AI audit", "for your business."],
  squareBodyLines: ["Get a practical AI audit", "for your business."],
  cta: "Find my AI wins",
  shortCta: "Find AI wins",
};

const esc = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function baseDefs(id, width, height) {
  return `
  <defs>
    <linearGradient id="bg-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette.deep}"/>
      <stop offset="0.55" stop-color="${palette.midnight}"/>
      <stop offset="1" stop-color="${palette.tint}"/>
    </linearGradient>
    <linearGradient id="gold-${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${palette.goldLight}"/>
      <stop offset="1" stop-color="${palette.gold}"/>
    </linearGradient>
    <clipPath id="clip-portrait-${id}">
      <rect x="0" y="0" width="${width}" height="${height}" rx="0"/>
    </clipPath>
    <radialGradient id="portraitFade-${id}" cx="50%" cy="50%" r="70%">
      <stop offset="0" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="0.78" stop-color="#ffffff" stop-opacity="0.95"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <mask id="portraitMask-${id}">
      <rect width="${width}" height="${height}" fill="url(#portraitFade-${id})"/>
    </mask>
    <pattern id="grid-${id}" width="28" height="28" patternUnits="userSpaceOnUse">
      <path d="M28 0H0V28" fill="none" stroke="${palette.cream}" stroke-opacity="0.05" stroke-width="1"/>
    </pattern>
  </defs>`;
}

function badge(x, y, text, size = 10) {
  return `
  <text x="${x}" y="${y}" font-family="'DM Mono', 'Courier New', monospace" font-size="${size}" letter-spacing="2" fill="${palette.goldLight}" text-transform="uppercase">${esc(text)}</text>`;
}

function cta(x, y, w, h, text, fontSize = 13) {
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(8, h / 2)}" fill="url(#gold-current)"/>
  <text x="${x + w / 2}" y="${y + h / 2 + fontSize * 0.35}" text-anchor="middle" font-family="'Syne', Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="${palette.midnight}">${esc(text)}</text>`;
}

const ads = [
  {
    file: "creative-milk-ai-audit-300x250.svg",
    id: "mrec",
    width: 300,
    height: 250,
    svg() {
      const id = this.id;
      return `
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="250" viewBox="0 0 300 250" role="img" aria-label="Creative Milk AI audit banner ad">
${baseDefs(id, 300, 250).replaceAll("gold-current", `gold-${id}`)}
<rect width="300" height="250" fill="url(#bg-${id})"/>
<rect width="300" height="250" fill="url(#grid-${id})"/>
<path d="M0 214 C74 184 138 218 300 172 L300 250 L0 250 Z" fill="${palette.forest}" opacity="0.32"/>
<image href="${imageHref}" x="164" y="12" width="142" height="252" preserveAspectRatio="xMidYMid slice" mask="url(#portraitMask-${id})"/>
<rect x="14" y="14" width="268" height="222" rx="6" fill="none" stroke="${palette.gold}" stroke-opacity="0.32"/>
${badge(24, 38, "Creative Milk", 9)}
<text x="24" y="76" font-family="'Cormorant Garamond', Georgia, serif" font-size="31" font-weight="700" fill="${palette.white}">
  <tspan x="24" dy="0">${esc(campaign.compactHeadlineLines[0])}</tspan>
  <tspan x="24" dy="32">${esc(campaign.compactHeadlineLines[1])}</tspan>
</text>
<text x="24" y="145" font-family="'Syne', Arial, sans-serif" font-size="12.5" fill="${palette.cream}" opacity="0.92">
  <tspan x="24" dy="0">${esc(campaign.bodyLines[0])}</tspan>
  <tspan x="24" dy="18">${esc(campaign.bodyLines[1])}</tspan>
</text>
<g>${cta(24, 204, 124, 28, campaign.shortCta, 12).replaceAll("gold-current", `gold-${id}`)}</g>
</svg>`.trim();
    },
  },
  {
    file: "creative-milk-ai-audit-728x90.svg",
    id: "leaderboard",
    width: 728,
    height: 90,
    svg() {
      const id = this.id;
      return `
<svg xmlns="http://www.w3.org/2000/svg" width="728" height="90" viewBox="0 0 728 90" role="img" aria-label="Creative Milk AI audit leaderboard banner ad">
${baseDefs(id, 728, 90).replaceAll("gold-current", `gold-${id}`)}
<rect width="728" height="90" fill="url(#bg-${id})"/>
<rect width="728" height="90" fill="url(#grid-${id})"/>
<path d="M420 0 C494 34 575 26 728 6 L728 90 L424 90 Z" fill="${palette.forest}" opacity="0.28"/>
<image href="${imageHref}" x="594" y="-36" width="112" height="198" preserveAspectRatio="xMidYMid slice" mask="url(#portraitMask-${id})"/>
<rect x="10" y="10" width="708" height="70" rx="5" fill="none" stroke="${palette.gold}" stroke-opacity="0.3"/>
${badge(28, 30, "Creative Milk", 9)}
<text x="28" y="61" font-family="'Cormorant Garamond', Georgia, serif" font-size="29" font-weight="700" fill="${palette.white}">${esc(campaign.shortHeadline)}</text>
<g>${cta(484, 26, 124, 30, campaign.shortCta, 12).replaceAll("gold-current", `gold-${id}`)}</g>
</svg>`.trim();
    },
  },
  {
    file: "creative-milk-ai-audit-160x600.svg",
    id: "skyscraper",
    width: 160,
    height: 600,
    svg() {
      const id = this.id;
      return `
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="600" viewBox="0 0 160 600" role="img" aria-label="Creative Milk AI audit skyscraper banner ad">
${baseDefs(id, 160, 600).replaceAll("gold-current", `gold-${id}`)}
<rect width="160" height="600" fill="url(#bg-${id})"/>
<rect width="160" height="600" fill="url(#grid-${id})"/>
<path d="M0 462 C44 418 104 450 160 394 L160 600 L0 600 Z" fill="${palette.forest}" opacity="0.34"/>
<image href="${imageHref}" x="-12" y="282" width="184" height="326" preserveAspectRatio="xMidYMid slice" mask="url(#portraitMask-${id})"/>
<rect x="12" y="12" width="136" height="576" rx="6" fill="none" stroke="${palette.gold}" stroke-opacity="0.3"/>
${badge(24, 42, "Creative Milk", 8)}
<text x="24" y="99" font-family="'Cormorant Garamond', Georgia, serif" font-size="31" font-weight="700" fill="${palette.white}">
  <tspan x="24" dy="0">Find AI</tspan>
  <tspan x="24" dy="34">savings.</tspan>
</text>
<text x="24" y="220" font-family="'Syne', Arial, sans-serif" font-size="12" fill="${palette.cream}" opacity="0.92">
  <tspan x="24" dy="0">Get a practical</tspan>
  <tspan x="24" dy="17">AI audit.</tspan>
</text>
<g>${cta(24, 283, 112, 31, campaign.shortCta, 12).replaceAll("gold-current", `gold-${id}`)}</g>
</svg>`.trim();
    },
  },
  {
    file: "creative-milk-ai-audit-1080x1080.svg",
    id: "square",
    width: 1080,
    height: 1080,
    svg() {
      const id = this.id;
      return `
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080" role="img" aria-label="Creative Milk AI audit square static ad">
${baseDefs(id, 1080, 1080).replaceAll("gold-current", `gold-${id}`)}
<rect width="1080" height="1080" fill="url(#bg-${id})"/>
<rect width="1080" height="1080" fill="url(#grid-${id})"/>
<path d="M0 826 C248 708 438 858 1080 650 L1080 1080 L0 1080 Z" fill="${palette.forest}" opacity="0.32"/>
<image href="${imageHref}" x="590" y="110" width="430" height="764" preserveAspectRatio="xMidYMid slice" mask="url(#portraitMask-${id})"/>
<rect x="56" y="56" width="968" height="968" rx="8" fill="none" stroke="${palette.gold}" stroke-opacity="0.3"/>
${badge(88, 145, "Creative Milk", 22)}
<text x="88" y="245" font-family="'Cormorant Garamond', Georgia, serif" font-size="96" font-weight="700" fill="${palette.white}">
  <tspan x="88" dy="0">${esc(campaign.compactHeadlineLines[0])}</tspan>
  <tspan x="88" dy="98">${esc(campaign.compactHeadlineLines[1])}</tspan>
</text>
<text x="92" y="560" font-family="'Syne', Arial, sans-serif" font-size="33" fill="${palette.cream}" opacity="0.92">
  <tspan x="92" dy="0">${esc(campaign.squareBodyLines[0])}</tspan>
  <tspan x="92" dy="48">${esc(campaign.squareBodyLines[1])}</tspan>
</text>
<g>${cta(92, 694, 292, 70, campaign.cta, 28).replaceAll("gold-current", `gold-${id}`)}</g>
</svg>`.trim();
    },
  },
];

await mkdir(outputDir, { recursive: true });

for (const ad of ads) {
  const svg = `${ad.svg()}\n`;
  const svgPath = path.join(outputDir, ad.file);
  await writeFile(svgPath, svg, "utf8");
  await sharp(Buffer.from(svg))
    .resize(ad.width, ad.height, { fit: "fill" })
    .png()
    .toFile(`${svgPath}.png`);
}

const manifest = {
  campaign: "Creative Milk AI Audit",
  character: "Ava Hart",
  sourceImage: "public/ava-hart-reference-freckles.png",
  files: ads.map(({ file, width, height }) => ({
    svg: `public/ads/${file}`,
    png: `public/ads/${file}.png`,
    width,
    height,
  })),
};

await writeFile(
  path.join(outputDir, "creative-milk-ai-audit-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);
