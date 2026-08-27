/**
 * Generates Transika Admin — Go-live UAT checklist (PDF).
 *   node scripts/generate-admin-uat-golive-pdf.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(__dirname, "..");
const outPath = path.join(docsRoot, "Transika-Admin-Go-Live-UAT.pdf");
const logoCandidates = [
  path.join(docsRoot, "logo", "light.png"),
  path.resolve(docsRoot, "../transika-admin/public/brand/logo.png"),
  path.resolve(docsRoot, "../transika-app/public/brand/logo.png"),
];

const require = createRequire(
  path.resolve(docsRoot, "../transika-api/package.json"),
);
const PDFDocument = require("pdfkit");

const INDIGO = "#453CCC";
const INK = "#0f172a";
const MUTED = "#64748b";
const RULE = "#cbd5e1";
const BOX = "#e2e8f0";
const MARGIN = 50;

const ADMIN_URL = "https://institutional-admin.tran-sika.com/";
const API_URL = "https://institutional-api.tran-sika.com/";
const MERCHANT_URL = "https://institutional.tran-sika.com/";

const doc = new PDFDocument({
  size: "A4",
  margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
  info: {
    Title: "Transika Admin - Go-live UAT",
    Author: "Transika Ltd",
    Subject: "Ops console UAT checklist for production go-live",
  },
});

const stream = fs.createWriteStream(outPath);
doc.pipe(stream);

function h1(t) {
  doc.font("Helvetica-Bold").fontSize(15).fillColor(INDIGO).text(t);
  doc.moveDown(0.2);
  const y = doc.y;
  doc
    .strokeColor(RULE)
    .lineWidth(1)
    .moveTo(doc.page.margins.left, y)
    .lineTo(doc.page.width - doc.page.margins.right, y)
    .stroke();
  doc.moveDown(0.85);
}

function h2(t) {
  doc.moveDown(0.4);
  doc.font("Helvetica-Bold").fontSize(11.5).fillColor(INK).text(t);
  doc.moveDown(0.3);
}

function p(t) {
  doc.font("Helvetica").fontSize(10).fillColor(INK).text(t, { lineGap: 3 });
  doc.moveDown(0.4);
}

function bullets(items) {
  for (const item of items) {
    doc.font("Helvetica").fontSize(10).fillColor(INK).text(`•  ${item}`, {
      indent: 6,
      lineGap: 2,
    });
    doc.moveDown(0.12);
  }
  doc.moveDown(0.25);
}

function labeledLink(label, url) {
  doc.font("Helvetica-Bold").fontSize(10).fillColor(INDIGO).text(label);
  doc.moveDown(0.1);
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(INDIGO)
    .text(url, { link: url, underline: true });
  doc.fillColor(INK);
  doc.moveDown(0.3);
}

function resultBoxes() {
  const y = doc.y;
  const labels = ["Pass", "Fail", "Blocked", "N/A"];
  let x = doc.page.margins.left;
  doc.font("Helvetica").fontSize(9).fillColor(INK);
  for (const label of labels) {
    doc.rect(x, y, 9, 9).strokeColor(BOX).stroke();
    doc.text(label, x + 12, y - 1, { lineBreak: false });
    x += 72;
  }
  doc.y = y + 14;
}

function caseBlock(c) {
  const needed = 88 + c.steps.length * 13;
  if (doc.y + needed > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }

  doc.font("Helvetica-Bold").fontSize(10).fillColor(INDIGO).text(`${c.id}  ${c.title}`);
  doc.moveDown(0.22);

  if (c.pre) {
    doc
      .font("Helvetica-Oblique")
      .fontSize(9)
      .fillColor(MUTED)
      .text(`Precondition: ${c.pre}`);
    doc.moveDown(0.18);
  }

  doc.font("Helvetica-Bold").fontSize(9).fillColor(INK).text("Steps");
  doc.moveDown(0.08);
  c.steps.forEach((s, i) => {
    doc.font("Helvetica").fontSize(9.5).fillColor(INK).text(`${i + 1}.  ${s}`, {
      indent: 4,
      lineGap: 1.5,
    });
    doc.moveDown(0.06);
  });
  doc.moveDown(0.12);

  doc.font("Helvetica-Bold").fontSize(9).fillColor(INK).text("Expected");
  doc.moveDown(0.06);
  doc.font("Helvetica").fontSize(9.5).fillColor(INK).text(c.expect, { lineGap: 2 });
  doc.moveDown(0.22);

  doc.font("Helvetica").fontSize(9).fillColor(MUTED).text("Result");
  doc.moveDown(0.1);
  resultBoxes();
  doc.moveDown(0.08);
  doc.font("Helvetica").fontSize(9).fillColor(MUTED).text("Tester / date / notes:");
  doc.moveDown(0.12);
  const lineY = doc.y + 10;
  doc
    .strokeColor(RULE)
    .moveTo(doc.page.margins.left, lineY)
    .lineTo(doc.page.width - doc.page.margins.right, lineY)
    .stroke();
  doc.y = lineY + 8;
  doc
    .strokeColor(RULE)
    .moveTo(doc.page.margins.left, doc.y + 10)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y + 10)
    .stroke();
  doc.y = doc.y + 16;
  doc.moveDown(0.3);
}

// Cover
{
  const logo = logoCandidates.find((f) => fs.existsSync(f));
  if (logo) {
    try {
      doc.image(logo, MARGIN, MARGIN + 6, { height: 32 });
      doc.y = MARGIN + 64;
    } catch {
      doc.y = MARGIN + 16;
    }
  } else {
    doc.y = MARGIN + 16;
  }

  doc.font("Helvetica-Bold").fontSize(26).fillColor(INDIGO).text("Transika");
  doc.moveDown(0.3);
  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor(INK)
    .text("Admin go-live UAT checklist");
  doc.moveDown(0.65);
  p(
    "Ops console checklist to confirm Transika Institutional Admin is ready for Live production: staff access, KYB and Live enablement, OTC quote/funding, Safe mint, treasury payouts, and reissue.",
  );
  labeledLink("Admin", ADMIN_URL);
  labeledLink("API", API_URL);
  labeledLink("Merchant Dashboard", MERCHANT_URL);
  doc.moveDown(0.3);
  doc.font("Helvetica").fontSize(10).fillColor(MUTED);
  doc.text("Transika Ltd  ·  info@tran-sika.com");
  doc.moveDown(0.2);
  doc.text(`Generated ${new Date().toISOString().slice(0, 10)}`);
  doc.moveDown(1);

  doc.font("Helvetica-Bold").fontSize(10).fillColor(INK).text("Engagement details (fill in)");
  doc.moveDown(0.35);
  for (const f of [
    "Release / build ref: _________________________________",
    "UAT lead (ops): __________________  Date: ____________",
    "Roles under test: [ ] admin  [ ] operations  [ ] treasury  [ ] compliance",
    "Data Mode for production proof:  [ ] Live",
    "Paired merchant UAT doc completed:  [ ] Yes  Ref: ________",
  ]) {
    doc.font("Helvetica").fontSize(10).fillColor(INK).text(f);
    doc.moveDown(0.4);
  }
}

doc.addPage();
h1("How to use this UAT");
bullets([
  "Auth always uses Live API. The sidebar Mode switcher (Test | Live) scopes desk data - use Test for rehearsal, Live for go-live proof.",
  "P0 cases must Pass (or be formally waived) before enabling Live merchants at scale.",
  "Capture evidence: merchant id, trade id, mint id, Safe tx / execution hash, redemption id, burn hash.",
  "Pair with the merchant Dashboard UAT (Transika-Go-Live-UAT.pdf) for the same release.",
  "Priority: P0 = blocks go-live; P1 = should pass; P2 = confirm when time allows.",
]);

h2("P0 ops gates (summary)");
bullets([
  "Staff can log in with OTP; treasury + operations roles can reach mint and OTC",
  "Live FX rate set; Treasury Safe is real (not placeholder) and can execute mint",
  "KYB approve -> Enable Live -> grant OTC feature -> provision/whitelist Live tGHS wallet",
  "Live OTC: quote -> confirm funded -> fiat treasury proof -> Safe mint executed -> settled",
  "Live (or Test) redemption path understood; retry and batch reissue practiced on Test",
  "Settlement provider default set; notifications/SSE working",
]);

doc.addPage();
h1("A. Auth & staff");

caseBlock({
  id: "A1  [P0]",
  title: "Open Admin console",
  steps: [
    `Open ${ADMIN_URL}`,
    "Confirm HTTPS login page loads.",
  ],
  expect: "Login page available without certificate errors.",
});

caseBlock({
  id: "A2  [P0]",
  title: "Staff login + OTP",
  steps: [
    "Sign in with ops email and password.",
    "Enter email OTP.",
    "Land on Overview.",
  ],
  expect: "Authenticated; Overview shows desk pulse; Mode switcher visible.",
});

caseBlock({
  id: "A3  [P0]",
  title: "Accept staff invite",
  pre: "Admin can invite staff.",
  steps: [
    "Staff -> invite treasury or operations user.",
    "Invitee opens accept-invite link, sets password, completes OTP.",
  ],
  expect: "New staff active with correct roles; can sign in again.",
});

caseBlock({
  id: "A4  [P1]",
  title: "Role nav matrix",
  steps: [
    "Sign in as operations, treasury, compliance, viewer (or simulate).",
    "Confirm Overview / Users / Operations / Compliance / Staff visibility matches role.",
  ],
  expect: "Nav and hub tiles match permissions; Staff only for admin.",
});

caseBlock({
  id: "A5  [P1]",
  title: "Sign out",
  steps: ["Sign out from sidebar.", "Open Overview URL again."],
  expect: "Redirected to login; session cleared.",
});

doc.addPage();
h1("B. Environment & platform readiness");

caseBlock({
  id: "B1  [P0]",
  title: "Test vs Live data isolation",
  steps: [
    "Note an OTC or mint item in Test.",
    "Switch Mode to Live; confirm the Test item is absent.",
  ],
  expect: "Mode switcher isolates sandbox vs Live data.",
});

caseBlock({
  id: "B2  [P0]",
  title: "FX rate (Live)",
  steps: [
    "Mode = Live. Open Operations -> FX rate (/rates).",
    "Confirm current GHS/USDT rate; update if required for go-live.",
  ],
  expect: "Live rate saved; new quotes will use it; history shows updater.",
});

caseBlock({
  id: "B3  [P0]",
  title: "Treasury settlement provider",
  steps: [
    "Operations -> Treasury.",
    "Set default Ghana settlement provider.",
  ],
  expect: "Default persists; used for new redemptions.",
});

caseBlock({
  id: "B4  [P0]",
  title: "Mint Safe configuration (Live)",
  steps: [
    "Open or create a mint detail.",
    "Confirm Safe address is not the placeholder 0x1111...",
    "Connect a Treasury Safe owner wallet with MINTER_ROLE.",
  ],
  expect: "Real Safe configured; wallet connects as owner; propose available when ready.",
});

doc.addPage();
h1("C. Users - KYB, Live, features, wallet");

caseBlock({
  id: "C1  [P0]",
  title: "KYB approve merchant",
  steps: [
    "Users -> filter Pending.",
    "Approve the go-live merchant (or confirm already Approved).",
  ],
  expect: "Status Approved; merchant can use Test desk after OTC grant.",
});

caseBlock({
  id: "C2  [P0]",
  title: "Enable Live",
  pre: "KYB Approved.",
  steps: [
    "On Users row, Enable Live.",
    "Confirm Live badge; Disable then re-Enable once if testing the toggle.",
  ],
  expect: "liveEnabled true; merchant can select Live and create Live keys/webhooks.",
});

caseBlock({
  id: "C3  [P0]",
  title: "Grant OTC feature",
  steps: [
    "Open merchant Settings.",
    "Enable/Approve OTC (and caps: MoMo/bank settle as required).",
  ],
  expect: "OTC approved; merchant Dashboard shows OTC and tGHS.",
});

caseBlock({
  id: "C4  [P0]",
  title: "Provision + whitelist Live tGHS wallet",
  pre: "Mode = Live on Admin.",
  steps: [
    "Merchant Settings -> tGHS wallet: Provision Circle SCA.",
    "Sign whitelist: Base Sepolia = WHITELIST_ROLE EOA; Base mainnet = Compliance Safe propose → co-sign → execute (confirm with execution tx hash).",
  ],
  expect: "Wallet whitelisted; ready as mint recipient for managed_tghs.",
});

caseBlock({
  id: "C5  [P1]",
  title: "IMTO / BOG profile",
  steps: [
    "Complete IMTO profile fields on merchant Settings.",
    "Save.",
  ],
  expect: "Profile saved; incomplete warning cleared when all required fields set.",
});

caseBlock({
  id: "C6  [P1]",
  title: "Reject / Suspend path",
  steps: [
    "On a disposable test merchant: Reject (with note) or Suspend.",
    "Confirm merchant Dashboard behaviour matches policy.",
  ],
  expect: "Status updates; desk access restricted as designed.",
});

caseBlock({
  id: "C7  [P2]",
  title: "Test Partner provision",
  steps: [
    "Users -> Test partners -> provision org.",
    "Copy one-time credentials (and optional webhook secret).",
  ],
  expect: "Partner KYB approved, Live locked; password login without OTP on merchant app.",
});

doc.addPage();
h1("D. OTC desk (ops)");

caseBlock({
  id: "D1  [P0]",
  title: "Overview queue vs OTC list",
  steps: [
    "Compare Overview Needs you counts with /otc tabs.",
    "Open the oldest actionable trade.",
  ],
  expect: "Counts align; detail matches next-action label.",
});

caseBlock({
  id: "D2  [P0]",
  title: "Send quote (crypto to fiat)",
  steps: [
    "Open draft trade; set rate and treasury deposit address.",
    "Send quote.",
  ],
  expect: "Status quoted; merchant sees firm quote with TTL.",
});

caseBlock({
  id: "D3  [P0]",
  title: "Confirm funded",
  pre: "Merchant submitted funding proof.",
  steps: [
    "Review proof and Chainalysis screening; Rescreen if needed.",
    "Confirm funded (or Reject with reason if invalid).",
  ],
  expect: "Status funded after confirm; Confirm blocked if sanctioned.",
});

caseBlock({
  id: "D4  [P0]",
  title: "Request tGHS mint (managed_tghs)",
  pre: "Trade funded; settleMode managed_tghs.",
  steps: [
    "Upload fiat treasury deposit proof (GHS into tGHS treasury).",
    "Request tGHS mint; open /mint/[id].",
  ],
  expect: "Mint request created with proof; linked to OTC trade.",
});

caseBlock({
  id: "D5  [P1]",
  title: "OTC CSV export",
  steps: ["On /otc, export CSV for a date range."],
  expect: "File downloads with expected trades for the Mode.",
});

doc.addPage();
h1("E. Safe mint execute (P0 for Live settle)");

caseBlock({
  id: "E1  [P0]",
  title: "Propose and co-sign mint",
  pre: "Mint ready; fiat proof acknowledged (OTC/admin); Safe owners available.",
  steps: [
    "On mint detail: acknowledge proof.",
    "Propose & sign with owner wallet.",
    "Second owner signs to threshold.",
  ],
  expect: "Status progresses to ready_to_execute.",
});

caseBlock({
  id: "E2  [P0]",
  title: "Execute mint via Safe",
  steps: [
    "Execute via Safe (or paste confirmed execution hash / recover).",
    "Confirm mint status executed.",
  ],
  expect: "On-chain mint confirmed; ledger credited; OTC path can settle.",
});

caseBlock({
  id: "E3  [P0]",
  title: "Merchant Live balance after mint",
  steps: [
    "Confirm merchant Dashboard Live tGHS increased.",
    "Record mint id and execution tx hash in evidence pack.",
  ],
  expect: "Merchant balance matches executed mint amount.",
});

caseBlock({
  id: "E4  [P1]",
  title: "Reject mint",
  steps: [
    "On a disposable mint, Reject before execute.",
  ],
  expect: "Mint rejected; trade remains fundable/mintable per product rules without double credit.",
});

doc.addPage();
h1("F. Treasury redemptions, retry, reissue");

caseBlock({
  id: "F1  [P0]",
  title: "Redemption detail + reconcile",
  steps: [
    "Treasury -> open a redemption.",
    "Reconcile burn if pending confirmation.",
  ],
  expect: "Burn evidence / explorer visible when burned; status accurate.",
});

caseBlock({
  id: "F2  [P0]",
  title: "Retry payout (Test first)",
  pre: "Redemption payout_failed or payout_pending without provider ref.",
  steps: [
    "On redemption detail, Retry payout.",
  ],
  expect: "Payout advances or clear error; not available if linked to active reissue.",
});

caseBlock({
  id: "F3  [P0]",
  title: "Batch reissue failed payouts (Test)",
  steps: [
    "Treasury -> Failed payouts.",
    "Select eligible payout_failed rows for one merchant; enter reason.",
    "Propose reissue mint; complete Safe execute on mint detail.",
  ],
  expect: "Reissue mint executed; redemptions marked reissued; merchant tGHS restored for those amounts.",
});

caseBlock({
  id: "F4  [P1]",
  title: "Ledger / CSV export",
  steps: ["On Treasury, filter ledger and export CSV."],
  expect: "Export matches on-screen Mode and filters.",
});

doc.addPage();
h1("G. Compliance & float");

caseBlock({
  id: "G1  [P1]",
  title: "tGHS wallets list",
  steps: [
    "Compliance hub -> tGHS wallets.",
    "Confirm Live wallets for go-live merchants show whitelisted.",
  ],
  expect: "List loads for Mode; states match merchant Settings.",
});

caseBlock({
  id: "G2  [P1]",
  title: "Compliance Safe pause/unpause (Test or controlled Live)",
  pre: "compliance:write; Compliance Safe configured.",
  steps: [
    "Compliance -> tGHS compliance.",
    "Propose pause then unpause (or document waiver if not exercised).",
  ],
  expect: "Contract paused state updates; audit history records actions.",
});

caseBlock({
  id: "G3  [P2]",
  title: "Float inventory",
  steps: [
    "Operations -> Float (/inventory).",
    "Confirm balances load; copy deposit address if used.",
  ],
  expect: "Balances or clear Bridge error; address copy works.",
});

doc.addPage();
h1("H. Notifications & safety");

caseBlock({
  id: "H1  [P1]",
  title: "Ops notifications / SSE",
  steps: [
    "Trigger OTC funding_submitted or similar.",
    "Confirm bell/notification and list soft-refresh.",
  ],
  expect: "Alert received for current Mode; deep link opens trade.",
});

caseBlock({
  id: "H2  [P0]",
  title: "Sanctioned funding blocked",
  pre: "Use Test screening scenario or documented dry-run.",
  steps: [
    "On a funding_submitted trade with sanctioned screening, attempt Confirm funded.",
  ],
  expect: "Confirm disabled or rejected; trade not funded.",
});

caseBlock({
  id: "H3  [P1]",
  title: "Disable Live / Suspend controls",
  steps: [
    "On a test merchant, Disable Live then re-Enable.",
    "Or Suspend then re-Approve per policy.",
  ],
  expect: "Flags update; merchant Live access changes accordingly.",
});

doc.addPage();
h1("I. Go-live decision");

p(
  "Complete after P0 cases Pass (or waived). Attach evidence: merchant id, trade/mint/redemption ids, Safe execution hashes, screenshots.",
);

h2("P0 tally");
bullets([
  "A Auth/staff P0: ........ / ....",
  "B Platform (FX, provider, Safe) P0: ........ / ....",
  "C KYB / Live / OTC / wallet P0: ........ / ....",
  "D OTC quote/fund/mint request P0: ........ / ....",
  "E Safe mint execute P0: ........ / ....",
  "F Redemptions / reissue P0: ........ / ....",
  "H Safety (sanctions) P0: ........ / ....",
]);

doc.moveDown(0.5);
h2("Open issues / waivers");
doc.font("Helvetica").fontSize(10).fillColor(MUTED).text("ID / description / owner / waiver?");
doc.moveDown(0.25);
for (let i = 0; i < 5; i++) {
  const y = doc.y + 12;
  doc
    .strokeColor(RULE)
    .moveTo(MARGIN, y)
    .lineTo(doc.page.width - MARGIN, y)
    .stroke();
  doc.y = y + 8;
}

doc.addPage();
h1("Sign-off");

p(
  "By signing, Transika ops confirms the Admin console and Live desk controls for this release are accepted for production use.",
);

doc.moveDown(0.5);
doc.font("Helvetica-Bold").fontSize(10).fillColor(INK).text("Transika operations / treasury");
doc.moveDown(0.35);
doc.font("Helvetica").fontSize(10).text("Name: _______________________________  Role: ______________");
doc.moveDown(0.4);
doc.text("Signature: __________________________  Date: ______________");
doc.moveDown(0.4);
doc.text("Decision:  [ ] Ready for Live   [ ] Not ready   [ ] Ready with waivers");

doc.moveDown(0.9);
doc.font("Helvetica-Bold").fontSize(10).fillColor(INK).text("Transika compliance / admin");
doc.moveDown(0.35);
doc.font("Helvetica").fontSize(10).text("Name: _______________________________  Role: ______________");
doc.moveDown(0.4);
doc.text("Signature: __________________________  Date: ______________");

doc.moveDown(1);
labeledLink("Admin", ADMIN_URL);
labeledLink("API", API_URL);
labeledLink("Merchant Dashboard", MERCHANT_URL);
doc.font("Helvetica").fontSize(9).fillColor(MUTED).text("Transika Ltd · info@tran-sika.com");

doc.end();

await new Promise((resolve, reject) => {
  stream.on("finish", resolve);
  stream.on("error", reject);
});

console.log(`Wrote ${outPath}`);
