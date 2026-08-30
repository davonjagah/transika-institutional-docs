/**
 * Merchant Dashboard — Go-live UAT checklist (PDF).
 *   node scripts/generate-uat-golive-pdf.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { createUatKit } from "./uat-pdf-kit.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(__dirname, "..");
const outPath = path.join(docsRoot, "Transika-Go-Live-UAT.pdf");

const require = createRequire(
  path.resolve(docsRoot, "../transika-api/package.json"),
);
const PDFDocument = require("pdfkit");

const DASHBOARD_URL = "https://institutional.tran-sika.com/";
const API_URL = "https://institutional-api.tran-sika.com/";

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
  title: "Transika Go-Live UAT (Merchant)",
  subject: "Merchant dashboard UAT checklist for production go-live",
  logoCandidates: [
    path.join(docsRoot, "logo", "light.png"),
    path.resolve(docsRoot, "../transika-app/public/brand/logo.png"),
  ],
});

// Cover
coverLogo();
doc.font("Helvetica-Bold").fontSize(24).fillColor(INDIGO).text("Transika", {
  width: pageW(),
});
doc
  .font("Helvetica-Bold")
  .fontSize(16)
  .fillColor(INK)
  .text("Go-live UAT checklist", { width: pageW() });
doc
  .font("Helvetica")
  .fontSize(11)
  .fillColor(MUTED)
  .text("Merchant Dashboard", { width: pageW() });
doc.moveDown(0.45);
p(
  "Confirm the Institutional Dashboard and API are ready for Live production. Execute each case, mark Pass / Fail / Blocked / N/A, and complete sign-off before go-live. Pair with Transika-Admin-Go-Live-UAT.pdf for the same release.",
);
labeledLink("Dashboard", DASHBOARD_URL);
labeledLink("API", API_URL);
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
  "Merchant / institution: ________________________________",
  "Environment:  [ ] Test rehearsal   [ ] Live go-live proof",
  "UAT lead: ______________________  Date: ______________",
  "Transika ops contact: ________________________________",
  "Build / release ref: _________________________________",
]) {
  doc.font("Helvetica").fontSize(9.5).fillColor(INK).text(f, { width: pageW() });
  doc.moveDown(0.32);
  resetCursor();
}

doc.addPage();
h1("How to use this UAT");
bullets([
  "Run Test cases first. Live cases only after KYB approved and Live enabled.",
  "Use a UAT merchant (or Test Partner) plus a production-candidate for Live proof.",
  "Record evidence: screenshots, trade IDs, tx hashes, webhook IDs, statement exports.",
  "Any Fail/Blocked on a P0 case blocks go-live until resolved or formally waived.",
  "P0 = must pass; P1 = should pass; P2 = nice to confirm.",
  "Ghana payouts use Transika Payout Service (TPS) when enabled on the platform.",
]);

h2("P0 go-live gates");
bullets([
  "Login + OTP (or Test Partner path) on production Dashboard",
  "KYB approved; Live enabled by Transika ops",
  "OTC feature approved; Live OTC settle to managed tGHS",
  "Live tGHS reflects mint; Live payout to MoMo/bank completes or fails cleanly after burn",
  "Statements show mint / disbursement for the period",
  "Live API key + webhook (if API in scope)",
  "Sign-off completed by merchant and Transika",
]);

h1("A. Access & login");
caseBlock({
  id: "A1  [P0]",
  title: "Open production Dashboard",
  steps: [
    `Open ${DASHBOARD_URL}`,
    "Confirm Sign in / Get started over HTTPS without certificate errors.",
  ],
  expect: "Page loads; Sign in and Get started available.",
});
caseBlock({
  id: "A2  [P0]",
  title: "Create account or accept invite",
  steps: [
    "Create account via Get started, or open an owner invite link.",
    "Complete email OTP.",
    "Land on Overview.",
  ],
  expect: "Authenticated on Overview.",
});
caseBlock({
  id: "A3  [P0]",
  title: "Sign in with OTP",
  pre: "Existing merchant user (not Test Partner).",
  steps: [
    "Sign out if needed.",
    "Sign in with email and password; enter OTP from email.",
  ],
  expect: "OTP accepted; Overview loads; Mode switcher visible.",
});
caseBlock({
  id: "A4  [P1]",
  title: "Forgot password",
  steps: [
    "Request password reset from Sign in.",
    "Open email link; set new password; sign in.",
  ],
  expect: "Reset succeeds; user can sign in.",
});
caseBlock({
  id: "A5  [P1]",
  title: "Sign out",
  steps: ["Sign out from profile menu.", "Open /home again."],
  expect: "Session ended; redirected to login.",
});

h1("B. KYB, Live & features");
caseBlock({
  id: "B1  [P0]",
  title: "KYB approved",
  steps: [
    "Confirm no blocking KYB banner (or ops has approved).",
  ],
  expect: "kybStatus = approved for the go-live merchant.",
});
caseBlock({
  id: "B2  [P0]",
  title: "Live mode enabled",
  steps: [
    "Switch Mode to Live.",
    "If blocked, Transika ops enables Live on the merchant.",
  ],
  expect: "Live selectable; Live lists load (may be empty).",
});
caseBlock({
  id: "B3  [P0]",
  title: "OTC feature unlocked",
  steps: [
    "Settings -> Features (or locked OTC nav).",
    "Request OTC if needed; after ops grant, confirm OTC and tGHS in the menu.",
  ],
  expect: "OTC approved; OTC and tGHS nav unlocked.",
});
caseBlock({
  id: "B4  [P1]",
  title: "API access (if in scope)",
  steps: [
    "Request API access under Features if locked.",
    "After approval, open API keys and Webhooks.",
  ],
  expect: "api_access approved; keys and webhooks reachable.",
});
caseBlock({
  id: "B5  [P1]",
  title: "Test vs Live isolation",
  steps: [
    "Note a Test trade or balance.",
    "Switch to Live; confirm Test item is absent.",
  ],
  expect: "Test and Live data do not mix.",
});

h1("C. Beneficiaries");
caseBlock({
  id: "C1  [P0]",
  title: "Add MoMo beneficiary",
  steps: [
    "Beneficiaries -> Add.",
    "Select MoMo network from catalog (e.g. MTNGH), enter number, resolve name, save.",
  ],
  expect: "Beneficiary saved with resolved account name.",
});
caseBlock({
  id: "C2  [P0]",
  title: "Add bank beneficiary",
  steps: [
    "Add a Ghana bank beneficiary from the catalog (e.g. FIDELITY), resolve, save.",
  ],
  expect: "Bank beneficiary saved and listed.",
});
caseBlock({
  id: "C3  [P1]",
  title: "Search / delete",
  steps: [
    "Search for a saved beneficiary.",
    "Delete a disposable test beneficiary if allowed.",
  ],
  expect: "Search works; delete removes the record (or is correctly forbidden).",
});

h1("D. OTC to managed tGHS (Test)");
caseBlock({
  id: "D1  [P0]",
  title: "Create sell-crypto trade -> tGHS (Test)",
  pre: "Mode = Test; OTC unlocked.",
  steps: [
    "OTC -> New trade.",
    "Sell crypto; asset defaults to USDC (change if needed); network defaults ethereum.",
    "Settle mode: Managed tGHS; submit; open trade detail.",
  ],
  expect: "Trade created; detail page loads.",
});
caseBlock({
  id: "D2  [P0]",
  title: "Accept quote and fund (Test)",
  steps: [
    "Accept the quote.",
    "Submit funding proof / tx hash as required.",
    "Use Complete in Test / simulate-ops if available to advance.",
  ],
  expect: "Trade reaches funded then settled (or clear waiting state with ops).",
});
caseBlock({
  id: "D3  [P0]",
  title: "tGHS Test balance credited",
  steps: [
    "Open tGHS (Test) after settle.",
    "Confirm balance and Activities / Transactions show the mint.",
  ],
  expect: "Balance and activity match the settled OTC amount.",
});

h1("E. OTC to managed tGHS (Live) - P0");
caseBlock({
  id: "E1  [P0]",
  title: "Live OTC trade to managed tGHS",
  pre: "Live enabled; OTC approved; funding available per ops limits.",
  steps: [
    "Mode = Live.",
    "Create sell-crypto trade; settle Managed tGHS; accept quote.",
    "Fund to the instructed address; paste tx hash / proofs.",
    "Wait for Transika mint / settle.",
  ],
  expect: "Trade Settled; record trade id and funding tx hash.",
});
caseBlock({
  id: "E2  [P0]",
  title: "Live tGHS balance after mint",
  steps: [
    "tGHS (Live): confirm balance and wallet/explorer link.",
    "Transactions show the Live mint.",
  ],
  expect: "Live balance matches opening + mint - any Live payouts.",
});
caseBlock({
  id: "E3  [P1]",
  title: "Decline / cancel path",
  steps: ["Create a trade and decline quote or cancel while allowed."],
  expect: "Trade declined/cancelled; no unexpected tGHS credit.",
});

h1("F. tGHS payouts (TPS rail)");
caseBlock({
  id: "F1  [P0]",
  title: "Test payout to MoMo or bank",
  pre: "Test tGHS balance > 0; beneficiary saved.",
  steps: [
    "tGHS -> Pay; amount; select beneficiary; submit.",
    "Open receipt; refresh until terminal status.",
  ],
  expect:
    "Burn and Ghana payout complete or fail with clear status; balance updated. Rail is TPS when platform-enabled.",
});
caseBlock({
  id: "F2  [P0]",
  title: "Live payout (go-live proof)",
  pre: "Live tGHS; approved beneficiary; within limits.",
  steps: [
    "Mode = Live. Pay a controlled amount to MoMo or bank.",
    "Capture redemption id, burn tx hash, final status.",
  ],
  expect:
    "Completed preferred; if payout_failed after burn, balance reduced and ops informed for remint.",
});
caseBlock({
  id: "F3  [P1]",
  title: "Payout receipt & explorer",
  steps: [
    "From receipt, open burn explorer link.",
    "Confirm amount and wallet match.",
  ],
  expect: "Explorer shows burn for the redemption amount.",
});

h1("G. Transactions & statements");
caseBlock({
  id: "G1  [P0]",
  title: "Transactions list",
  steps: [
    "Open Transactions in Test and Live.",
    "Filter/search; open a mint and a payout.",
  ],
  expect: "Rows match tGHS activity; deep links correct.",
});
caseBlock({
  id: "G2  [P0]",
  title: "Generate statement",
  steps: [
    "Account statements; date range covering UAT mints/payouts; Generate.",
    "Confirm FX/mint and Disbursement lines (and Reversal if reminted).",
  ],
  expect: "Closing balance matches period credits minus burned disbursements.",
});
caseBlock({
  id: "G3  [P1]",
  title: "Export statement",
  steps: ["Download CSV, Excel, and PDF for the same period."],
  expect: "All three download; figures match on-screen.",
});

h1("H. Team");
caseBlock({
  id: "H1  [P1]",
  title: "Invite operator",
  pre: "Signed in as Owner.",
  steps: [
    "Settings -> Team; invite Operator.",
    "Invitee accepts and signs in.",
  ],
  expect: "Member appears; invitee can use OTC/tGHS per role.",
});
caseBlock({
  id: "H2  [P2]",
  title: "Role change / remove",
  steps: [
    "Change a member to View only; confirm restrictions.",
    "Remove a test member or cancel a pending invite.",
  ],
  expect: "Permissions and membership update correctly.",
});

h1("I. Development (API & webhooks)");
caseBlock({
  id: "I1  [P0 if API]",
  title: "Create Test API key",
  steps: [
    "Create Test key with api:read + api:write and allowed IPs.",
    "Call GET /v1/sandbox/tghs (or equivalent) from an allowlisted IP.",
  ],
  expect: "Authenticated Test API succeeds from allowed IP.",
});
caseBlock({
  id: "I2  [P0 if API]",
  title: "Create Live API key",
  pre: "Live enabled.",
  steps: [
    "Create Live key with scopes and allowed IPs.",
    `Call ${API_URL}v1/tghs (or me) from allowlisted IP; reject from non-allowlisted.`,
  ],
  expect: "Live key works; non-allowlisted IP rejected.",
});
caseBlock({
  id: "I3  [P0 if API]",
  title: "Webhook endpoint + test",
  steps: [
    "Webhooks -> add HTTPS endpoint (Test).",
    "Save signing secret; Send test; verify signature on receiver.",
  ],
  expect: "Test delivery received and verified.",
});
caseBlock({
  id: "I4  [P1]",
  title: "Live webhook on payout",
  pre: "Live webhook registered.",
  steps: [
    "Complete Live payout (F2).",
    "Confirm tghs.payout.* delivered to Live endpoint.",
  ],
  expect: "Signed Live event matches redemption status.",
});

h1("J. Notifications & security smoke");
caseBlock({
  id: "J1  [P1]",
  title: "In-app notifications",
  steps: [
    "Trigger an OTC or payout event.",
    "Open header bell; mark read.",
  ],
  expect: "Notification for current Mode; deep link works.",
});
caseBlock({
  id: "J2  [P1]",
  title: "HTTPS / console smoke",
  steps: [
    "Confirm Dashboard and API are HTTPS only.",
    "No blocking console errors on Overview, OTC, tGHS (ignore expected logged-out /me 401).",
  ],
  expect: "Secure origins; key pages usable.",
});

h1("K. Go-live decision");
p(
  "Complete after all P0 cases are Pass (or waived in writing). Attach evidence pack.",
);
h2("P0 tally");
bullets([
  "A Access/login: ........ / ....",
  "B KYB / Live / OTC: ........ / ....",
  "C Beneficiaries: ........ / ....",
  "D Test OTC->tGHS: ........ / ....",
  "E Live OTC->tGHS: ........ / ....",
  "F Payouts: ........ / ....",
  "G Statements: ........ / ....",
  "I API/webhooks (if in scope): ........ / .... or N/A",
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
  "By signing, the parties confirm UAT evidence supports production Live use of Transika Institutional for this merchant, within agreed limits.",
);
doc.moveDown(0.35);
doc.font("Helvetica-Bold").fontSize(10).fillColor(INK).text("Merchant", {
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
doc.font("Helvetica-Bold").fontSize(10).fillColor(INK).text("Transika", {
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
doc.text("Live enabled in ops:  [ ] Yes   Date/time: ____________________", {
  width: pageW(),
});
doc.moveDown(0.7);
labeledLink("Dashboard", DASHBOARD_URL);
labeledLink("API", API_URL);

await finish();
