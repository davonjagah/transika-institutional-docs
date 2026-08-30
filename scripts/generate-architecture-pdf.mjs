/**
 * Transika Institutional — System Architecture (PDF).
 *   node scripts/generate-architecture-pdf.mjs
 *
 * Continuous text flow (no forced section page-breaks). Diagrams are compact
 * and only start on a new page when the current page cannot fit them — and
 * never when already at the top of a page (avoids blank pages).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(__dirname, "..");
const outPath = path.join(docsRoot, "Transika-System-Architecture.pdf");
const logoCandidates = [
  path.join(docsRoot, "logo", "light.png"),
  path.resolve(docsRoot, "../transika-app/public/brand/logo.png"),
  path.resolve(docsRoot, "../transika-admin/public/brand/logo.png"),
];

const require = createRequire(
  path.resolve(docsRoot, "../transika-api/package.json"),
);
const PDFDocument = require("pdfkit");

const INDIGO = "#453CCC";
const INDIGO_SOFT = "#EEF0FF";
const INK = "#0f172a";
const MUTED = "#64748b";
const RULE = "#cbd5e1";
const BOX_FILL = "#F8FAFC";
const BOX_STROKE = "#94A3B8";
const ACCENT_FILL = "#EEF2FF";
const MARGIN = 50;

const doc = new PDFDocument({
  size: "A4",
  margins: { top: MARGIN, bottom: MARGIN + 20, left: MARGIN, right: MARGIN },
  info: {
    Title: "Transika Institutional — System Architecture",
    Author: "Transika Ltd",
    Subject: "Nontechnical overview + technical architecture for Transika/",
  },
  bufferPages: true,
  autoFirstPage: true,
});

const stream = fs.createWriteStream(outPath);
doc.pipe(stream);

const pageW = () => doc.page.width - MARGIN * 2;
const pageBottom = () => doc.page.height - MARGIN - 28;

/** Absolute doc.text(x,y) leaves the cursor to the right — always reset. */
function resetCursor(y) {
  doc.x = MARGIN;
  if (y != null) doc.y = y;
}

/** Fit a block; skip addPage if we are already at the top (prevents blanks). */
function need(h) {
  resetCursor();
  if (doc.y <= MARGIN + 8) return;
  if (doc.y + h > pageBottom()) doc.addPage();
  resetCursor();
}

function h1(t) {
  need(72);
  doc.moveDown(0.25);
  resetCursor();
  doc.font("Helvetica-Bold").fontSize(14).fillColor(INDIGO).text(t, {
    width: pageW(),
  });
  const y = doc.y + 2;
  doc
    .strokeColor(RULE)
    .lineWidth(1)
    .moveTo(MARGIN, y)
    .lineTo(doc.page.width - MARGIN, y)
    .stroke();
  resetCursor(y + 10);
}

function h2(t) {
  need(40);
  doc.moveDown(0.2);
  resetCursor();
  doc.font("Helvetica-Bold").fontSize(11).fillColor(INK).text(t, {
    width: pageW(),
  });
  doc.moveDown(0.18);
  resetCursor();
}

function p(t) {
  resetCursor();
  doc.font("Helvetica").fontSize(9.5).fillColor(INK).text(t, {
    width: pageW(),
    lineGap: 2.2,
    paragraphGap: 2,
  });
  doc.moveDown(0.22);
  resetCursor();
}

function bullets(items) {
  resetCursor();
  for (const item of items) {
    doc.font("Helvetica").fontSize(9.5).fillColor(INK).text(`•  ${item}`, {
      width: pageW(),
      indent: 4,
      lineGap: 1.8,
    });
    doc.moveDown(0.05);
    resetCursor();
  }
  doc.moveDown(0.15);
  resetCursor();
}

function kv(rows) {
  resetCursor();
  for (const [k, v] of rows) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(INDIGO).text(k, {
      width: pageW(),
    });
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(INK)
      .text(v, { width: pageW(), indent: 8, lineGap: 1.8 });
    doc.moveDown(0.2);
    resetCursor();
  }
}

function note(label, body) {
  need(52);
  resetCursor();
  const x = MARGIN;
  const w = pageW();
  const pad = 8;
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(INDIGO);
  const labelH = doc.heightOfString(label, { width: w - pad * 2 });
  doc.font("Helvetica").fontSize(8.5).fillColor(INK);
  const bodyH = doc.heightOfString(body, { width: w - pad * 2, lineGap: 1.5 });
  const h = pad + labelH + 4 + bodyH + pad;
  need(h);
  const y0 = doc.y;
  doc.roundedRect(x, y0, w, h, 5).fillAndStroke(INDIGO_SOFT, RULE);
  doc
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .fillColor(INDIGO)
    .text(label, x + pad, y0 + pad, { width: w - pad * 2, lineBreak: false });
  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor(INK)
    .text(body, x + pad, y0 + pad + labelH + 4, {
      width: w - pad * 2,
      lineGap: 1.5,
    });
  resetCursor(y0 + h + 6);
}

function caption(t) {
  resetCursor();
  doc
    .font("Helvetica-Oblique")
    .fontSize(7.5)
    .fillColor(MUTED)
    .text(t, { width: pageW(), align: "center" });
  doc.moveDown(0.3);
  resetCursor();
}

function steps(title, items) {
  need(20 + items.length * 14);
  resetCursor();
  doc.font("Helvetica-Bold").fontSize(9).fillColor(INDIGO).text(title, {
    width: pageW(),
  });
  doc.moveDown(0.1);
  items.forEach((s, i) => {
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(INK)
      .text(`${i + 1}.  ${s}`, { width: pageW(), indent: 4, lineGap: 1.5 });
    doc.moveDown(0.04);
    resetCursor();
  });
  doc.moveDown(0.2);
  resetCursor();
}

/** Single-row chip diagram — always fits in ~36pt. */
function chips(labels, title) {
  need(title ? 56 : 42);
  resetCursor();
  if (title) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(INDIGO).text(title, {
      width: pageW(),
    });
    doc.moveDown(0.12);
    resetCursor();
  }
  const gap = 6;
  const n = labels.length;
  const bw = (pageW() - gap * (n - 1)) / n;
  const h = 28;
  const y = doc.y;
  let x = MARGIN;
  for (let i = 0; i < n; i++) {
    doc.roundedRect(x, y, bw, h, 4).fillAndStroke(ACCENT_FILL, BOX_STROKE);
    doc
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .fillColor(INK)
      .text(labels[i], x + 3, y + 9, {
        width: bw - 6,
        align: "center",
        lineBreak: false,
      });
    if (i < n - 1) {
      const ax = x + bw;
      doc
        .strokeColor(INDIGO)
        .lineWidth(1)
        .moveTo(ax + 1, y + h / 2)
        .lineTo(ax + gap - 1, y + h / 2)
        .stroke();
    }
    x += bw + gap;
  }
  resetCursor(y + h + 4);
}

/** 2-row package grid. */
function packageGrid(rows) {
  const cols = 3;
  const gap = 6;
  const bw = (pageW() - gap * (cols - 1)) / cols;
  const bh = 36;
  const rowGap = 8;
  const rowsN = Math.ceil(rows.length / cols);
  need(rowsN * (bh + rowGap) + 8);
  resetCursor();
  let y = doc.y;
  rows.forEach((cell, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = MARGIN + col * (bw + gap);
    const yy = y + row * (bh + rowGap);
    doc.roundedRect(x, yy, bw, bh, 4).fillAndStroke(
      cell.accent ? ACCENT_FILL : BOX_FILL,
      BOX_STROKE,
    );
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor(INK)
      .text(cell.title, x + 4, yy + 6, {
        width: bw - 8,
        align: "center",
        lineBreak: false,
      });
    doc
      .font("Helvetica")
      .fontSize(6.5)
      .fillColor(MUTED)
      .text(cell.sub, x + 4, yy + 20, {
        width: bw - 8,
        align: "center",
        lineBreak: false,
      });
  });
  resetCursor(y + rowsN * (bh + rowGap) + 2);
}

// ─── Cover ───────────────────────────────────────────────────────────────
{
  const logo = logoCandidates.find((f) => fs.existsSync(f));
  if (logo) {
    try {
      doc.image(logo, MARGIN, MARGIN, { height: 32 });
      resetCursor(MARGIN + 48);
    } catch {
      resetCursor(MARGIN);
    }
  } else {
    resetCursor(MARGIN);
  }

  doc.font("Helvetica-Bold").fontSize(24).fillColor(INDIGO).text("Transika", {
    width: pageW(),
  });
  doc
    .font("Helvetica-Bold")
    .fontSize(15)
    .fillColor(INK)
    .text("Institutional System Architecture", { width: pageW() });
  doc.moveDown(0.35);
  resetCursor();
  p(
    "Nontechnical overview first, then a technical deep-dive of the Transika/ platform: OTC desk, tGHS custody on Base, Ghana payouts, merchant and ops apps.",
  );
  kv([
    ["Scope", "Transika Institutional only (Transika/ folder)"],
    ["Audience", "Business stakeholders -> then engineering"],
  ]);
  resetCursor();
  doc.font("Helvetica").fontSize(9).fillColor(MUTED);
  doc.text(
    `Transika Ltd · info@tran-sika.com · ${new Date().toISOString().slice(0, 10)}`,
    { width: pageW() },
  );
  doc.moveDown(0.45);
  resetCursor();
  doc.font("Helvetica-Bold").fontSize(10).fillColor(INK).text("Contents", {
    width: pageW(),
  });
  doc.moveDown(0.15);
  resetCursor();
  bullets([
    "A. Nontechnical overview",
    "1-4  Layout, context, runtime, API domains",
    "5-8  Auth, OTC, tGHS, Ghana payouts",
    "9-10 Ops console, security & operations",
  ]);
}

// ─── A ───────────────────────────────────────────────────────────────────
h1("A. Nontechnical overview");
p(
  "Transika Institutional helps regulated money-movement businesses trade foreign currency against Ghana cedis, hold value as tGHS (a Ghana-cedi stable token), and pay out to mobile money or bank accounts in Ghana — with Transika operations supervising sensitive steps.",
);

h2("What it is for");
bullets([
  "OTC desk — quoted buy/sell of stablecoins against GHS (not a public exchange)",
  "tGHS treasury — digital Ghana-cedi balance for institutional partners",
  "Ghana payouts — send GHS to MoMo or bank beneficiaries after a trade or redemption",
  "Partner self-serve dashboard + optional API, with Transika ops controlling KYB and Live mode",
]);

chips(["Partners", "Transika Ops", "Providers"], "Who is involved");
caption("Figure A — Three audiences");
bullets([
  "Partners — dashboard for trades, beneficiaries, tGHS redeem; API keys if enabled",
  "Transika ops — KYB, Live enable, quotes, mint with multisig, treasury monitoring",
  "Providers — Circle (wallets), Base (tGHS mint/burn), Transika Payout Service (Ghana MoMo/bank)",
]);

steps("Typical partner journey", [
  "Sign up -> KYB review by ops -> product access",
  "Start in Test mode (rehearsal); Live requires a separate ops enable",
  "OTC: quote -> accept -> fund/proof -> ops confirms -> settle (tGHS or Ghana payout)",
  "Redeem tGHS to a saved MoMo/bank beneficiary when local cash is needed",
]);

kv([
  [
    "OTC desk",
    "Human-supervised conversion. Quoted prices, checked funding, intentional settlement.",
  ],
  [
    "tGHS treasury",
    "Cedi-denominated digital balance. Live uses on-chain tGHS; redeem pays out in Ghana.",
  ],
  [
    "Test vs Live",
    "Test = safe practice. Live = real money, only after KYB + explicit Live enable.",
  ],
]);
p(
  "Sections 1-10 below are the technical architecture for implementers. The overview above is enough for a business or ops briefing.",
);

// ─── 1 ───────────────────────────────────────────────────────────────────
h1("1. Monorepo layout (Transika/)");
p(
  "Everything in this document lives under Transika/: API, merchant app, ops admin, docs, and TGHS smart contracts.",
);
packageGrid([
  { title: "transika-api", sub: "NestJS · port 4110", accent: true },
  { title: "transika-app", sub: "Merchant · port 3011" },
  { title: "transika-admin", sub: "Ops · port 3013" },
  { title: "transika-docs", sub: "Mintlify + PDFs" },
  {
    title: "transika-smart-contract",
    sub: "TGHS · Base / Sepolia",
    accent: true,
  },
]);
caption("Figure 1 — Packages in Transika/");
p(
  "Internal docs: transika-api/doc/. Partner docs: transika-docs/. This PDF: transika-docs/scripts/generate-architecture-pdf.mjs.",
);

// ─── 2 ───────────────────────────────────────────────────────────────────
h1("2. System context");
p(
  "Partners and ops use Transika apps; the API orchestrates custody and payout providers. Merchants never hold Circle or Safe production secrets.",
);
h2("Actors");
bullets([
  "Merchant users — JWT + OTP, team invites, OTC, beneficiaries, redeem",
  "Merchant systems — API keys (txk_live_ / txk_test_) with IP allowlists",
  "Ops staff — roles: admin, operations, treasury, compliance, viewer",
  "Treasury Safe owners — propose / co-sign mint and whitelist on Base",
]);
h2("External systems");
kv([
  ["Circle", "Developer-controlled SCAs for Live tGHS; signed webhooks"],
  ["Safe", "Multisig mint and wallet whitelist on Base"],
  ["Transika Payout Service (TPS)", "Primary Ghana MoMo/bank rail"],
  ["Hubtel / Eganow", "Legacy rails (rollback / name enquiry)"],
  ["SMTP / ZeptoMail", "OTP, invites, KYB, OTC alerts"],
  ["Chainalysis KYT", "Optional registration of OTC funding hashes"],
]);

// ─── 3 ───────────────────────────────────────────────────────────────────
h1("3. Runtime topology");
p(
  "Three frontends, one API process, one background worker, Postgres + Redis. The API runs migrations on boot; the worker does not.",
);
chips(["Frontends", "API :4110", "Worker", "Postgres", "Redis"], "Process view");
caption("Figure 2 — Runtime pieces");
bullets([
  "Live API: /v1/* · Test API: /v1/sandbox/*",
  "Auth always uses Live /v1 so cookies stay on one path",
  "Apps host-align API hostname for first-party httpOnly cookies",
  "Sandbox: sbx-institutional*.tran-sika.com · Prod: institutional*.tran-sika.com",
  "Local defaults: API 4110 · merchant 3011 · admin 3013",
]);

// ─── 4 ───────────────────────────────────────────────────────────────────
h1("4. Domain architecture (transika-api)");
p(
  "Modular NestJS. Each domain owns TypeORM entities. Schema changes via migrations only (synchronize: false).",
);
packageGrid([
  { title: "auth / ops-auth / keys", sub: "Sessions & API keys" },
  { title: "users / features", sub: "KYB · capabilities" },
  { title: "otc", sub: "Desk trades", accent: true },
  { title: "beneficiaries", sub: "MoMo / bank" },
  { title: "payouts", sub: "TPS + legacy rails", accent: true },
  { title: "tghs (in otc/)", sub: "Mint · redeem · Circle" },
  { title: "cross-border", sub: "Send abroad" },
  { title: "webhooks / notify", sub: "Outbound + SSE" },
  { title: "jobs", sub: "BullMQ worker" },
]);
caption("Figure 3 — Primary Nest modules");
h2("Background jobs");
bullets([
  "webhook-deliver / webhook-delivery-sweep",
  "transika-pending-sweep (and legacy hubtel sweep)",
  "circle-tghs-redemption-sweep · tghs-redemption-burn",
]);

// ─── 5 ───────────────────────────────────────────────────────────────────
h1("5. Authentication & entitlements");
h2("Merchant");
bullets([
  "Email/password + OTP (skipped for Test Partners)",
  "httpOnly access + refresh cookies",
  "API keys: txk_live_ / txk_test_ · api:read/write · mandatory IP allowlist",
  "KYB pending until ops approve; Live separately enabled",
]);
h2("Ops");
bullets([
  "Ops JWT + OTP; OPS_SEED_EMAIL / OPS_SEED_PASSWORD on boot",
  "Roles gate routes (e.g. treasury:read, compliance:write)",
]);
h2("Features & capabilities");
kv([
  ["otc / api_access", "Merchant-requestable"],
  ["cross_border", "Ops-grant only (Send abroad)"],
  ["buy_crypto_enabled", "Fiat->crypto OTC"],
  ["payout_momo / payout_bank", "OTC settle to MoMo/bank (often default off)"],
]);
note(
  "Not gated by payout caps",
  "Creating beneficiaries and redeeming tGHS stay available even when OTC MoMo/bank settle is disabled.",
);

// ─── 6 ───────────────────────────────────────────────────────────────────
h1("6. OTC desk flow");
p(
  "Quoted desk workflow: rate -> accept -> fund -> ops confirm -> settle. Crypto->fiat pays a beneficiary via the payout rail; fiat->crypto credits tGHS / mint as configured.",
);
chips(
  ["quoted", "accepted", "funded", "settling", "settled"],
  "Trade status (happy path)",
);
caption("Figure 4 — OTC lifecycle");
steps("Fiat -> crypto", [
  "Quote (USDC/USDT + GHS) -> accept -> fund with proof/tx hash",
  "Ops confirm-funded (manual desk check)",
  "Settle credits tGHS / mint path",
]);
steps("Crypto -> fiat", [
  "Partner pays assigned otc_deposit_wallet",
  "Ops confirm -> settle to MoMo/bank beneficiary",
  "PayoutService -> TPS -> webhook/sweep -> trade settled",
]);
note(
  "Deposit wallets",
  "otc_deposit_wallet is set only by a Treasury Safe owner. Quotes must use that address.",
);

// ─── 7 ───────────────────────────────────────────────────────────────────
h1("7. tGHS custody, mint & redemption");
p(
  "Test tGHS is a ledger balance. Live uses Circle SCAs. Live mint/redeem need the SCA whitelisted on TGHS (EOA on Sepolia; Compliance Safe on Base mainnet).",
);
chips(
  ["provisioning", "pending_whitelist", "whitelisted"],
  "Live wallet states",
);
caption("Figure 5 — Circle SCA lifecycle");
steps("Mint", [
  "Ops create mint request (+ funding evidence as required)",
  "Safe owners propose and meet signature threshold",
  "Execute on-chain; API reconciles; Live balance updates",
]);
chips(
  ["Redeem", "Burn", "burn_confirmed", "Ghana payout"],
  "Redemption path",
);
caption("Figure 6 — Redeem -> burn -> payout");
bullets([
  "Live redeem auto-submits burn (no ops gate on burn)",
  "Balance reserved until burn confirms; burn_failed is recoverable",
  "Circle webhooks at POST /v1/webhooks/circle; worker sweeps delays",
]);

// ─── 8 ───────────────────────────────────────────────────────────────────
h1("8. Ghana payout rail (TPS)");
p(
  "PayoutService talks to pluggable rails. With TRANSIKA_PAYOUT_ENABLED, active rail is transika (TPS). Otherwise simulated (legacy Hubtel/Eganow remain for rollback).",
);
h2("Institution catalog");
bullets([
  "code — merchant networkCode (MTNGH, FIDELITY, …)",
  "payout_service_code — TPS MoMo network / bank_code (MTN, TELECEL, …)",
  "Seeded by migrations; managed in Admin -> Treasury -> Payout institutions",
]);
h2("What we send TPS");
kv([
  ["transaction_id", "Our payout_disbursements.id"],
  ["reference", "Merchant payout_service_reference (e.g. Kaprex_Transika)"],
  ["network / bank_code", "Institution payout_service_code"],
  ["ghs_amount", "Disbursement amount"],
]);
kv([
  [
    "Webhook",
    "{API_PUBLIC_URL}/v1/webhooks/transika/payout/{TRANSIKA_PAYOUT_WEBHOOK_SECRET}",
  ],
  [
    "Idempotency",
    "One disbursement per (source_type, source_id); retries reuse same id",
  ],
]);
bullets([
  "Called from: tGHS redeem after burn_confirmed; OTC crypto->fiat settle; ops retry",
]);

// ─── 9 ───────────────────────────────────────────────────────────────────
h1("9. Ops console & treasury");
p(
  "transika-admin uses ops JWT cookies against the same API. Mode toggle scopes desk data; auth always hits Live /v1.",
);
kv([
  ["Users / Settings", "KYB, Live, caps, features, IMTO, OTC wallet, TPS reference"],
  ["OTC", "Quote, funding, settle, proofs"],
  ["Mint", "Requests + Safe propose / sign / execute"],
  ["Treasury", "Reserve view, payouts, institutions, failed payouts"],
  ["Wallets / Compliance", "Circle SCA + whitelist / Safe"],
  ["Staff / Test partners", "Invites + sandbox merchants"],
]);
note(
  "Admin Docker",
  "Next standalone images must COPY public/ and .next/static (public after standalone). Brand PNGs are also webpack-imported into /_next/static/media.",
);

// ─── 10 ──────────────────────────────────────────────────────────────────
h1("10. Security & operations");
h2("Controls");
bullets([
  "CSP + HSTS + CORP/COOP on apps",
  "API-key IP allowlists fail closed",
  "Webhook path secrets (TPS / Hubtel / Eganow)",
  "Circle webhook signature verification",
  "Ops kill switches: capabilities + Live enable",
]);
h2("Inbound webhooks");
kv([
  ["TPS", "POST /v1/webhooks/transika/payout/{secret}"],
  ["Circle", "POST /v1/webhooks/circle"],
  ["Hubtel / Eganow", "POST /v1/webhooks/{provider}/payout/{secret}"],
]);
steps("Environment bring-up", [
  "Postgres + Redis; DATABASE_URL / REDIS_URL",
  "API_PUBLIC_URL, ALLOWED_ORIGINS, JWT, SMTP",
  "Enable TPS + register webhook with TPS team",
  "Build, migrate, start API + worker",
  "Deploy apps with NEXT_PUBLIC_API_URL=https://…-api…/v1 (not frontend:4110)",
  "Seed ops user; approve merchants; set institution codes & payout references",
]);
h2("Related docs");
bullets([
  "transika-api/doc/system-guide.md, architecture.md, payouts.md",
  "transika-api/doc/tghs-custody.md, otc.md, authentication.md",
]);
doc.moveDown(0.3);
doc
  .font("Helvetica-Oblique")
  .fontSize(8)
  .fillColor(MUTED)
  .text(
    "Implementation under Transika/transika-api/src and the apps is the source of truth if docs diverge.",
  );

// Footers — must stay inside the page margin box or PDFKit paginates endlessly
const range = doc.bufferedPageRange();
for (let i = 0; i < range.count; i++) {
  doc.switchToPage(range.start + i);
  const bottom = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;
  doc
    .font("Helvetica")
    .fontSize(7.5)
    .fillColor(MUTED)
    .text(
      `Transika Institutional Architecture  ·  ${i + 1} / ${range.count}`,
      MARGIN,
      doc.page.height - 28,
      { width: pageW(), align: "center", lineBreak: false },
    );
  doc.page.margins.bottom = bottom;
}

doc.end();
await new Promise((resolve, reject) => {
  stream.on("finish", resolve);
  stream.on("error", reject);
});
console.log(`Wrote ${outPath}`);
