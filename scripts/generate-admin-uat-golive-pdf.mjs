/**
 * Ops Admin — Go-live UAT checklist (PDF).
 *   node scripts/generate-admin-uat-golive-pdf.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { createUatKit } from "./uat-pdf-kit.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(__dirname, "..");
const outPath = path.join(docsRoot, "Transika-Admin-Go-Live-UAT.pdf");

const require = createRequire(
  path.resolve(docsRoot, "../transika-api/package.json"),
);
const PDFDocument = require("pdfkit");

const ADMIN_URL = "https://institutional-admin.tran-sika.com/";
const API_URL = "https://institutional-api.tran-sika.com/";
const MERCHANT_URL = "https://institutional.tran-sika.com/";

const {
  doc,
  MARGIN,
  INDIGO,
  INK,
  MUTED,
  RULE,
  resetCursor,
  h1,
  h2,
  p,
  bullets,
  labeledLink,
  caseBlock,
  coverLogo,
  finish,
  pageW,
} = createUatKit(PDFDocument, {
  fs,
  outPath,
  title: "Transika Admin Go-Live UAT",
  subject: "Ops console UAT checklist for production go-live",
  logoCandidates: [
    path.join(docsRoot, "logo", "light.png"),
    path.resolve(docsRoot, "../transika-admin/public/brand/logo.png"),
    path.resolve(docsRoot, "../transika-app/public/brand/logo.png"),
  ],
});

coverLogo();
doc.font("Helvetica-Bold").fontSize(24).fillColor(INDIGO).text("Transika", {
  width: pageW(),
});
doc
  .font("Helvetica-Bold")
  .fontSize(16)
  .fillColor(INK)
  .text("Admin go-live UAT checklist", { width: pageW() });
doc
  .font("Helvetica")
  .fontSize(11)
  .fillColor(MUTED)
  .text("Ops console", { width: pageW() });
doc.moveDown(0.45);
p(
  "Confirm Institutional Admin is ready for Live production: staff access, KYB and Live enablement, OTC quote/funding, Safe mint, TPS payout institutions, treasury redemptions, and reissue. Pair with Transika-Go-Live-UAT.pdf for the same release.",
);
labeledLink("Admin", ADMIN_URL);
labeledLink("API", API_URL);
labeledLink("Merchant Dashboard", MERCHANT_URL);
doc.font("Helvetica").fontSize(9).fillColor(MUTED);
doc.text(
  `Transika Ltd · info@tran-sika.com · Generated ${new Date().toISOString().slice(0, 10)}`,
  { width: pageW() },
);
doc.moveDown(0.5);
doc.font("Helvetica-Bold").fontSize(10).fillColor(INK).text("Engagement details", {
  width: pageW(),
});
doc.moveDown(0.25);
for (const f of [
  "Release / build ref: _________________________________",
  "UAT lead (ops): __________________  Date: ____________",
  "Roles under test: [ ] admin  [ ] operations  [ ] treasury  [ ] compliance",
  "Data Mode for production proof:  [ ] Live",
  "Paired merchant UAT completed:  [ ] Yes  Ref: ________",
]) {
  doc.font("Helvetica").fontSize(9.5).fillColor(INK).text(f, { width: pageW() });
  doc.moveDown(0.32);
  resetCursor();
}

doc.addPage();
h1("How to use this UAT");
bullets([
  "Auth always uses the Live API. Sidebar Mode (Test | Live) scopes desk data — Test for rehearsal, Live for go-live proof.",
  "P0 cases must Pass (or be formally waived) before enabling Live merchants at scale.",
  "Capture evidence: merchant id, trade id, mint id, Safe tx / execution hash, redemption id, burn hash, TPS reference.",
  "Pair with the merchant Dashboard UAT (Transika-Go-Live-UAT.pdf) for the same release.",
  "Ghana payouts use Transika Payout Service (TPS) when enabled; institutions catalog maps MoMo/bank codes to TPS payout_service_code.",
  "Priority: P0 = blocks go-live; P1 = should pass; P2 = confirm when time allows.",
]);

h2("P0 ops gates");
bullets([
  "Staff login + OTP; treasury and operations can reach mint and OTC",
  "Live FX rate set; Treasury Safe is real (not placeholder) and can execute mint",
  "KYB approve → Enable Live → grant OTC → provision/whitelist Live tGHS wallet",
  "OTC deposit wallet set (Treasury Safe owner); payout service reference set if TPS requires it",
  "Payout institutions seeded/active with TPS codes for MoMo and bank rails in use",
  "Live OTC: quote → confirm funded → fiat treasury proof → Safe mint → settled",
  "Redemption path understood; retry and batch reissue practiced on Test",
  "Notifications/SSE working; sanctioned funding blocked",
]);

h1("A. Auth & staff");
caseBlock({
  id: "A1  [P0]",
  title: "Open Admin console",
  steps: [`Open ${ADMIN_URL}`, "Confirm HTTPS login page loads."],
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
    "Staff → invite treasury or operations user.",
    "Invitee opens accept-invite link, sets password, completes OTP.",
  ],
  expect: "New staff active with correct roles; can sign in again.",
});
caseBlock({
  id: "A4  [P1]",
  title: "Role nav matrix",
  steps: [
    "Sign in as operations, treasury, compliance, viewer (or simulate).",
    "Confirm Overview / Users / Operations / Compliance / Staff / Treasury visibility matches role.",
  ],
  expect: "Nav and hub tiles match permissions; Staff only for admin.",
});
caseBlock({
  id: "A5  [P1]",
  title: "Sign out",
  steps: ["Sign out from sidebar.", "Open Overview URL again."],
  expect: "Redirected to login; session cleared.",
});

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
    "Mode = Live. Open Operations → FX rate (/rates).",
    "Confirm current GHS/USDT rate; update if required for go-live.",
  ],
  expect: "Live rate saved; new quotes will use it; history shows updater.",
});
caseBlock({
  id: "B3  [P0]",
  title: "Payout institutions catalog (TPS)",
  steps: [
    "Treasury → Institutions (/treasury/institutions).",
    "Confirm MoMo and bank rows used in go-live (e.g. MTNGH, FIDELITY) are active.",
    "Confirm each has payout_service_code mapped for TPS (edit/create if missing).",
  ],
  expect:
    "Catalog loads (not 404); codes match merchant beneficiary picker; TPS codes set for rails in use.",
});
caseBlock({
  id: "B4  [P0]",
  title: "Mint Safe configuration (Live)",
  steps: [
    "Open or create a mint detail.",
    "Confirm Safe address is not the placeholder 0x1111…",
    "Connect a Treasury Safe owner wallet with MINTER_ROLE.",
  ],
  expect: "Real Safe configured; wallet connects as owner; propose available when ready.",
});
caseBlock({
  id: "B5  [P1]",
  title: "API health / webhook secret present",
  steps: [
    "Confirm institutional API is reachable over HTTPS.",
    "Confirm TPS webhook URL is registered at TPS pointing at {API_PUBLIC_URL}/v1/webhooks/transika/payout/{secret}.",
  ],
  expect: "API responds; TPS can deliver payout status webhooks to production.",
});

h1("C. Users — KYB, Live, features, wallet");
caseBlock({
  id: "C1  [P0]",
  title: "KYB approve merchant",
  steps: [
    "Users → filter Pending.",
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
    "Merchant Settings → tGHS wallet: Provision Circle SCA.",
    "Sign whitelist: Base Sepolia = WHITELIST_ROLE EOA; Base mainnet = Compliance Safe propose → co-sign → execute (confirm with execution tx hash).",
  ],
  expect: "Wallet whitelisted; ready as mint recipient for managed_tghs.",
});
caseBlock({
  id: "C5  [P0]",
  title: "OTC deposit wallet",
  pre: "Connected wallet is a Treasury Safe owner.",
  steps: [
    "Merchant Settings → OTC deposit wallet.",
    "Set the merchant-facing funding address (0x…); save.",
  ],
  expect:
    "otcDepositWallet saved; merchant OTC quotes instruct deposits to this address (not a shared placeholder).",
});
caseBlock({
  id: "C6  [P0]",
  title: "Payout service reference (TPS)",
  steps: [
    "Merchant Settings → Payout service reference.",
    "Set short id (e.g. MerchantName_Transika); save.",
  ],
  expect:
    "Reference saved; TPS Ghana payouts include this as reference (omitted only if intentionally cleared).",
});
caseBlock({
  id: "C7  [P1]",
  title: "IMTO / BOG profile",
  steps: [
    "Complete IMTO profile fields on merchant Settings.",
    "Save.",
  ],
  expect: "Profile saved; incomplete warning cleared when all required fields set.",
});
caseBlock({
  id: "C8  [P1]",
  title: "Reject / Suspend path",
  steps: [
    "On a disposable test merchant: Reject (with note) or Suspend.",
    "Confirm merchant Dashboard behaviour matches policy.",
  ],
  expect: "Status updates; desk access restricted as designed.",
});
caseBlock({
  id: "C9  [P2]",
  title: "Test Partner provision",
  steps: [
    "Users → Test partners → provision org.",
    "Copy one-time credentials (and optional webhook secret).",
  ],
  expect: "Partner KYB approved, Live locked; password login without OTP on merchant app.",
});

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
    "Open draft trade; set rate and treasury deposit address (merchant OTC wallet).",
    "Send quote.",
  ],
  expect: "Status quoted; merchant sees firm quote with TTL and correct deposit address.",
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

h1("E. Safe mint execute (P0 for Live settle)");
caseBlock({
  id: "E1  [P0]",
  title: "Propose and co-sign mint",
  pre: "Mint ready; fiat proof acknowledged; Safe owners available.",
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
  steps: ["On a disposable mint, Reject before execute."],
  expect:
    "Mint rejected; trade remains fundable/mintable per product rules without double credit.",
});

h1("F. Treasury redemptions, TPS, retry, reissue");
caseBlock({
  id: "F1  [P0]",
  title: "Redemption detail + reconcile",
  steps: [
    "Treasury → Payouts; open a redemption.",
    "Reconcile burn if pending confirmation.",
    "Confirm TPS provider ref / status when payout submitted.",
  ],
  expect: "Burn evidence / explorer visible when burned; TPS status accurate.",
});
caseBlock({
  id: "F2  [P0]",
  title: "Retry payout (Test first)",
  pre: "Redemption payout_failed or payout_pending without provider ref.",
  steps: ["On redemption detail, Retry payout."],
  expect: "Payout advances or clear error; not available if linked to active reissue.",
});
caseBlock({
  id: "F3  [P0]",
  title: "Batch reissue failed payouts (Test)",
  steps: [
    "Treasury → Failed payouts.",
    "Select eligible payout_failed rows for one merchant; enter reason.",
    "Propose reissue mint; complete Safe execute on mint detail.",
  ],
  expect:
    "Reissue mint executed; redemptions marked reissued; merchant tGHS restored for those amounts.",
});
caseBlock({
  id: "F4  [P1]",
  title: "Ledger / CSV export",
  steps: ["On Treasury, filter ledger and export CSV."],
  expect: "Export matches on-screen Mode and filters.",
});
caseBlock({
  id: "F5  [P1]",
  title: "Institution toggle / edit smoke",
  pre: "treasury:write.",
  steps: [
    "On Institutions, disable then re-enable a non-critical Test-only institution (or edit name).",
    "Confirm merchant beneficiary catalog reflects active institutions only.",
  ],
  expect: "Active flag and TPS code edits persist; merchant picker stays consistent.",
});

h1("G. Compliance & float");
caseBlock({
  id: "G1  [P1]",
  title: "tGHS wallets list",
  steps: [
    "Compliance hub → tGHS wallets.",
    "Confirm Live wallets for go-live merchants show whitelisted.",
  ],
  expect: "List loads for Mode; states match merchant Settings.",
});
caseBlock({
  id: "G2  [P1]",
  title: "Compliance Safe pause/unpause (Test or controlled Live)",
  pre: "compliance:write; Compliance Safe configured.",
  steps: [
    "Compliance → tGHS compliance.",
    "Propose pause then unpause (or document waiver if not exercised).",
  ],
  expect: "Contract paused state updates; audit history records actions.",
});
caseBlock({
  id: "G3  [P2]",
  title: "Float inventory",
  steps: [
    "Operations → Float (/inventory).",
    "Confirm balances load; copy deposit address if used.",
  ],
  expect: "Balances or clear Bridge error; address copy works.",
});

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

h1("I. Go-live decision");
p(
  "Complete after P0 cases Pass (or waived). Attach evidence: merchant id, trade/mint/redemption ids, Safe execution hashes, TPS refs, screenshots.",
);
h2("P0 tally");
bullets([
  "A Auth/staff: ........ / ....",
  "B Platform (FX, institutions, Safe): ........ / ....",
  "C KYB / Live / OTC / wallet / deposit / TPS ref: ........ / ....",
  "D OTC quote/fund/mint request: ........ / ....",
  "E Safe mint execute: ........ / ....",
  "F Redemptions / reissue: ........ / ....",
  "H Safety (sanctions): ........ / ....",
]);
h2("Open issues / waivers");
doc.font("Helvetica").fontSize(9).fillColor(MUTED).text("ID / description / owner / waiver?", {
  width: pageW(),
});
doc.moveDown(0.2);
for (let i = 0; i < 4; i++) {
  const y = doc.y + 10;
  doc.strokeColor(RULE).moveTo(MARGIN, y).lineTo(doc.page.width - MARGIN, y).stroke();
  resetCursor(y + 6);
}

doc.addPage();
h1("Sign-off");
p(
  "By signing, Transika ops confirms the Admin console and Live desk controls for this release are accepted for production use.",
);
doc.moveDown(0.35);
doc.font("Helvetica-Bold").fontSize(10).fillColor(INK).text("Transika operations / treasury", {
  width: pageW(),
});
doc.moveDown(0.3);
doc.font("Helvetica").fontSize(9.5).fillColor(INK);
doc.text("Name: _______________________________  Role: ______________", {
  width: pageW(),
});
doc.moveDown(0.35);
doc.text("Signature: __________________________  Date: ______________", {
  width: pageW(),
});
doc.moveDown(0.35);
doc.text("Decision:  [ ] Ready for Live   [ ] Not ready   [ ] Ready with waivers", {
  width: pageW(),
});
doc.moveDown(0.7);
doc.font("Helvetica-Bold").fontSize(10).fillColor(INK).text("Transika compliance / admin", {
  width: pageW(),
});
doc.moveDown(0.3);
doc.font("Helvetica").fontSize(9.5).fillColor(INK);
doc.text("Name: _______________________________  Role: ______________", {
  width: pageW(),
});
doc.moveDown(0.35);
doc.text("Signature: __________________________  Date: ______________", {
  width: pageW(),
});
doc.moveDown(0.7);
labeledLink("Admin", ADMIN_URL);
labeledLink("API", API_URL);
labeledLink("Merchant Dashboard", MERCHANT_URL);

await finish();
