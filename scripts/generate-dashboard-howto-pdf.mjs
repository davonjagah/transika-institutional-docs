/**
 * Generates Transika Dashboard — How to use (PDF).
 *   node scripts/generate-dashboard-howto-pdf.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(__dirname, "..");
const outPath = path.join(docsRoot, "Transika-Dashboard-How-to-Use.pdf");
const logoCandidates = [
  path.join(docsRoot, "logo", "light.png"),
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
const MARGIN = 56;

const doc = new PDFDocument({
  size: "A4",
  margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
  info: {
    Title: "Transika Dashboard - How to use",
    Author: "Transika Ltd",
    Subject: "Merchant guide: Login, OTC to tGHS, Team, Development",
  },
});

const stream = fs.createWriteStream(outPath);
doc.pipe(stream);

/** Start a major section on a fresh page (except the first body section). */
let startedBody = false;
function sectionPage() {
  if (!startedBody) {
    startedBody = true;
    return;
  }
  doc.addPage();
}

function h1(t) {
  doc.font("Helvetica-Bold").fontSize(16).fillColor(INDIGO).text(t);
  doc.moveDown(0.25);
  const y = doc.y;
  doc
    .strokeColor(RULE)
    .lineWidth(1)
    .moveTo(doc.page.margins.left, y)
    .lineTo(doc.page.width - doc.page.margins.right, y)
    .stroke();
  doc.moveDown(1);
}

function h2(t) {
  doc.moveDown(0.65);
  doc.font("Helvetica-Bold").fontSize(12).fillColor(INK).text(t);
  doc.moveDown(0.35);
}

function p(t) {
  doc.font("Helvetica").fontSize(10.5).fillColor(INK).text(t, {
    lineGap: 3.5,
    paragraphGap: 6,
  });
  doc.moveDown(0.55);
}

function bullets(items) {
  for (const item of items) {
    doc.font("Helvetica").fontSize(10.5).fillColor(INK).text(`•  ${item}`, {
      indent: 8,
      lineGap: 3,
      paragraphGap: 4,
    });
    doc.moveDown(0.2);
  }
  doc.moveDown(0.35);
}

function steps(items) {
  items.forEach((item, i) => {
    doc.font("Helvetica").fontSize(10.5).fillColor(INK).text(`${i + 1}.  ${item}`, {
      indent: 8,
      lineGap: 3,
      paragraphGap: 4,
    });
    doc.moveDown(0.2);
  });
  doc.moveDown(0.35);
}

function note(label, body) {
  doc.moveDown(0.2);
  doc.font("Helvetica-Bold").fontSize(10).fillColor(INDIGO).text(label);
  doc.moveDown(0.15);
  doc.font("Helvetica").fontSize(10).fillColor(INK).text(body, { lineGap: 3 });
  doc.moveDown(0.55);
}

function kv(rows) {
  for (const [k, v] of rows) {
    doc.font("Helvetica-Bold").fontSize(10).fillColor(INDIGO).text(k);
    doc.moveDown(0.1);
    doc.font("Helvetica").fontSize(10).fillColor(INK).text(v, {
      indent: 12,
      lineGap: 2.5,
    });
    doc.moveDown(0.4);
  }
  doc.moveDown(0.2);
}

const DASHBOARD_URL = "https://institutional.tran-sika.com/";
const API_URL = "https://institutional-api.tran-sika.com/";

/** Clickable URL (visible + PDF link annotation). */
function linkLine(url, opts = {}) {
  const size = opts.size ?? 10.5;
  const indent = opts.indent ?? 0;
  doc
    .font("Helvetica")
    .fontSize(size)
    .fillColor(INDIGO)
    .text(url, { indent, link: url, underline: true, lineGap: 2 });
  doc.fillColor(INK);
}

function labeledLink(label, url) {
  doc.font("Helvetica-Bold").fontSize(10.5).fillColor(INDIGO).text(label);
  doc.moveDown(0.12);
  linkLine(url);
  doc.moveDown(0.35);
}

// ——— Cover ———
{
  const logo = logoCandidates.find((p) => fs.existsSync(p));
  if (logo) {
    try {
      doc.image(logo, MARGIN, MARGIN + 8, { height: 34 });
      doc.y = MARGIN + 70;
    } catch {
      doc.y = MARGIN + 20;
    }
  } else {
    doc.y = MARGIN + 20;
  }

  doc.font("Helvetica-Bold").fontSize(28).fillColor(INDIGO).text("Transika");
  doc.moveDown(0.35);
  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor(INK)
    .text("Dashboard - How to use");
  doc.moveDown(1);
  doc.font("Helvetica").fontSize(11.5).fillColor(MUTED).text(
    "Merchant guide for Login, access, Beneficiaries, OTC to tGHS, Transactions & Statements, Team, and Development (API keys & webhooks).",
    { lineGap: 4 },
  );
  doc.moveDown(0.9);
  labeledLink("Dashboard", DASHBOARD_URL);
  labeledLink("API", API_URL);
  doc.moveDown(0.5);
  doc.font("Helvetica").fontSize(10.5).fillColor(MUTED);
  doc.text("Transika Ltd");
  doc.moveDown(0.2);
  doc.text("Reg. CS248401025 · Tse Addo - Accra, Ghana");
  doc.moveDown(0.2);
  doc
    .fillColor(INDIGO)
    .text("info@tran-sika.com", { link: "mailto:info@tran-sika.com", underline: true });
  doc.fillColor(MUTED);
  doc.moveDown(1.2);
  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(MUTED)
    .text(`Generated ${new Date().toISOString().slice(0, 10)}`);
}

// ——— Contents ———
doc.addPage();
h1("Contents");
bullets([
  "1. Introduction",
  "2. Login & account",
  "3. Getting started & access",
  "4. Overview",
  "5. Beneficiaries",
  "6. OTC desk",
  "7. tGHS treasury",
  "8. Transactions & statements",
  "9. Team",
  "10. Development (API & webhooks)",
  "11. Notifications",
  "12. Quick reference",
  "13. Glossary",
]);

// ——— 1 ———
doc.addPage();
startedBody = true;
h1("1. Introduction");
p(
  "Transika Institutional is an OTC desk and managed tGHS treasury for institutional merchants. You sell (or buy) stablecoins at the desk, settle into a Ghana cedi treasury balance (tGHS), and pay out to MoMo or bank beneficiaries.",
);
p(
  "This guide covers the merchant Dashboard: sign in, request products, run OTC to tGHS, manage your team, and set up API keys and webhooks. Full HTTP reference is in the API docs linked from the sidebar.",
);
doc.font("Helvetica").fontSize(10.5).fillColor(INK).text("•  Dashboard: ", {
  indent: 8,
  continued: true,
});
doc.fillColor(INDIGO).text(DASHBOARD_URL, { link: DASHBOARD_URL, underline: true });
doc.moveDown(0.25);
doc.font("Helvetica").fontSize(10.5).fillColor(INK).text("•  API: ", {
  indent: 8,
  continued: true,
});
doc.fillColor(INDIGO).text(API_URL, { link: API_URL, underline: true });
doc.moveDown(0.25);
doc.font("Helvetica").fontSize(10.5).fillColor(INK).text("•  Support: ", {
  indent: 8,
  continued: true,
});
doc
  .fillColor(INDIGO)
  .text("info@tran-sika.com", {
    link: "mailto:info@tran-sika.com",
    underline: true,
  });
doc.moveDown(0.25);
doc
  .font("Helvetica")
  .fontSize(10.5)
  .fillColor(INK)
  .text("•  Statement issuer: Transika Ltd", { indent: 8 });
doc.moveDown(0.45);

// ——— 2 ———
sectionPage();
h1("2. Login & account");

h2("2.1 Sign in");
doc.font("Helvetica").fontSize(10.5).fillColor(INK).text("1.  Go to ", {
  indent: 8,
  continued: true,
});
doc.fillColor(INDIGO).text(DASHBOARD_URL, {
  link: DASHBOARD_URL,
  underline: true,
  continued: true,
});
doc.fillColor(INK).text(" and choose Sign in.");
doc.moveDown(0.25);
doc
  .font("Helvetica")
  .fontSize(10.5)
  .fillColor(INK)
  .text("2.  Enter email and password.", { indent: 8 });
doc.moveDown(0.25);
doc
  .font("Helvetica")
  .fontSize(10.5)
  .fillColor(INK)
  .text("3.  If prompted, enter the 6-digit one-time code from email.", {
    indent: 8,
  });
doc.moveDown(0.25);
doc
  .font("Helvetica")
  .fontSize(10.5)
  .fillColor(INK)
  .text("4.  You land on Overview.", { indent: 8 });
doc.moveDown(0.45);

h2("2.2 Create account");
doc.font("Helvetica").fontSize(10.5).fillColor(INK).text("1.  Go to ", {
  indent: 8,
  continued: true,
});
doc.fillColor(INDIGO).text(DASHBOARD_URL, {
  link: DASHBOARD_URL,
  underline: true,
  continued: true,
});
doc.fillColor(INK).text(" and choose Get started (or Create account).");
doc.moveDown(0.25);
doc
  .font("Helvetica")
  .fontSize(10.5)
  .fillColor(INK)
  .text(
    "2.  Enter name, account (organisation) name, email, and password (minimum 8 characters).",
    { indent: 8 },
  );
doc.moveDown(0.25);
doc
  .font("Helvetica")
  .fontSize(10.5)
  .fillColor(INK)
  .text("3.  Verify with the email OTP.", { indent: 8 });
doc.moveDown(0.25);
doc
  .font("Helvetica")
  .fontSize(10.5)
  .fillColor(INK)
  .text("4.  Continue to Overview.", { indent: 8 });
doc.moveDown(0.45);

h2("2.3 Accept an invite");
steps([
  "Open the invite link from your organisation owner.",
  "Set your name and password.",
  "Verify OTP and join that merchant account.",
]);

h2("2.4 Forgot / reset password");
steps([
  "On login, choose Forgot password and enter your email.",
  "Open the reset link from email and set a new password.",
]);

h2("2.5 Account notes");
bullets([
  "Most merchants require OTP after password.",
  "Test Partner accounts may skip OTP and remain Test-only (Live locked).",
  "Live trading and Live API keys require Transika to enable Live on your merchant.",
]);

// ——— 3 ———
sectionPage();
h1("3. Getting started & access");

h2("3.1 KYB status");
p(
  "Until KYB is approved you may see a banner. Pending, rejected, or suspended status limits product use. Contact Transika if you need help with approval.",
);

h2("3.2 Test vs Live mode");
bullets([
  "Use the Mode switcher in the sidebar (Test | Live).",
  "Test and Live data are completely separate: balances, trades, payouts, keys, and webhooks.",
  "An amber banner appears in Test mode.",
  "Live is unavailable until Transika enables it for your merchant.",
]);

h2("3.3 Feature request");
p(
  "Some products are locked until you request access. Locked menu items show Request or Pending and open Settings -> Features.",
);
kv([
  ["OTC", "Unlocks OTC desk and tGHS treasury"],
  ["API access", "Unlocks API keys and Webhooks"],
]);
steps([
  "Open Settings -> Features (or click a locked nav item).",
  "Request access for the product you need.",
  "Wait for Transika approval (Pending -> Approved).",
  "Optionally control whether the product appears in the navbar.",
]);

// ——— 4 + 5 ———
sectionPage();
h1("4. Overview");
p(
  "Path: Overview. Shortcuts into OTC, tGHS, and Transactions, plus recent OTC trades when OTC is unlocked. Use this as your daily landing page.",
);

h1("5. Beneficiaries");
p(
  "Path: Beneficiaries. Save MoMo and bank accounts before payouts or OTC settle-to-fiat.",
);
steps([
  "Click Add beneficiary.",
  "Choose network (MoMo or bank).",
  "Enter account details and resolve the account name.",
  "Approve / save. Search or delete later as needed.",
]);
note(
  "Tip",
  "Create beneficiaries before your first tGHS Pay. OTC settle to managed tGHS does not need a beneficiary; Ghana payouts do.",
);

// ——— 6 ———
sectionPage();
h1("6. OTC desk");

h2("6.1 What it is");
p(
  "Trade USDT or USDC for Ghana cedis. For treasury use, settle to managed tGHS so the amount credits your tGHS balance after Transika confirms funding and mints.",
);

h2("6.2 Trade list");
p(
  "Path: OTC. Tabs: Needs you / All / Settled. Actions: New trade, Refresh, View tGHS, export CSV by date.",
);

h2("6.3 Create an OTC to tGHS trade");
steps([
  "OTC -> New trade.",
  "Choose Sell crypto (stablecoin to GHS/tGHS).",
  "Select asset and network (for example USDT on Base).",
  "Enter amount.",
  "Choose settle mode: Managed tGHS (not MoMo/bank beneficiary).",
  "Submit and open the trade detail page.",
]);

h2("6.4 Trade lifecycle");
kv([
  ["Quoted", "Accept or decline the quote"],
  ["Accepted", "Fund: paste the crypto funding tx hash (and proofs if asked)"],
  ["Funded", "Wait for Transika to confirm and mint tGHS"],
  ["Settled", "Done - check tGHS balance"],
  ["Cancelled / rejected / expired", "Terminal - start a new trade if needed"],
]);

h2("6.5 Test mode");
p(
  "In Test, you may see Complete in Test on non-terminal trades. That simulates the ops path so you can practice without Live funding.",
);

h2("6.6 After settle");
bullets([
  "tGHS balance increases under tGHS for the current Mode.",
  "Transactions and Activities show the mint.",
  "Statements show FX conversion/GHS Provisioning for that mint.",
]);

// ——— 7 ———
sectionPage();
h1("7. tGHS treasury");

h2("7.1 Balance & wallet");
p(
  "Path: tGHS. View balance for the selected Mode. Wallet tab shows your address (copy / open explorer). Minting is done via OTC settle to managed tGHS.",
);

h2("7.2 Pay (disbursement)");
steps([
  "tGHS -> Pay.",
  "Enter amount (tGHS and GHS are 1:1).",
  "Select a beneficiary.",
  "Complete originator / transaction fields as required.",
  "Submit. tGHS is burned and Ghana payout is initiated.",
  "Open the payout receipt to track burn hash and status; Refresh if needed.",
]);

h2("7.3 Activities");
p("Filter mints and payouts, export CSV, and open individual payout receipts.");

h2("7.4 Statuses to know");
bullets([
  "Completed - payout succeeded.",
  "Payout failed after burn - wallet already reduced; Transika remints as a statement Reversal when reissued.",
  "In flight (burn / payout pending) - watch the receipt and notifications.",
]);

// ——— 8 ———
sectionPage();
h1("8. Transactions & statements");

h2("8.1 Transactions");
p(
  "Path: Transactions. Lists tGHS mints and payouts for the current Mode. Search and filter; open a mint to its OTC trade or a payout to its redemption receipt. Use the card link to Account statements.",
);

h2("8.2 Statements");
p(
  "Path: Statements (from Transactions). Issued by Transika Ltd. Choose from/to dates (maximum 92 days), Generate, then download CSV, Excel, or PDF.",
);
kv([
  ["FX conversion/GHS Provisioning", "OTC or admin mint credited"],
  ["Disbursement", "tGHS burned for a payout (including failed burns)"],
  ["Reversal", "Remint after a failed payout (credit)"],
]);
p(
  "Opening and closing balances are built from these lines so they track burned and minted tGHS for the period.",
);

// ——— 9 ———
sectionPage();
h1("9. Team");

h2("9.1 Roles");
kv([
  ["Owner", "Full control including invites and team management"],
  ["Operator", "Day-to-day OTC, tGHS, and operations"],
  ["View only", "Read-only access"],
]);

h2("9.2 Invite and manage");
steps([
  "Settings -> Team.",
  "Owner invites by email and chooses Operator or View only.",
  "Invitee completes Accept invite (see Login).",
  "Owner can change role, remove a member, or cancel a pending invite.",
]);

h2("9.3 General profile");
p("Settings -> General shows your name, email, role, and merchant name.");

// ——— 10 ———
sectionPage();
h1("10. Development (API & webhooks)");

h2("10.1 Unlock API access");
steps([
  "Settings -> Features -> request API access.",
  "After approval, API keys and Webhooks appear in the menu.",
  "Open API docs from the sidebar for full endpoint reference.",
]);

h2("10.2 API keys");
steps([
  "API keys -> Create.",
  "Name the key; choose test or live; set scopes (api:read / api:write).",
  "Add allowed IP addresses (required).",
  "Copy the secret immediately - it is shown once.",
  "Edit IPs or revoke keys later as needed.",
]);
note(
  "Live keys",
  "Creating Live keys requires Live to be enabled on your merchant. Prefer Test keys while integrating.",
);

h2("10.3 Webhooks");
steps([
  "Webhooks -> Add endpoint (HTTPS URL).",
  "Choose test or live and event filters (tGHS payout lifecycle).",
  "Store the signing secret; verify signatures on your server.",
  "Use Send test, Rotate secret, or Revoke as needed.",
]);

h2("10.4 Environments for developers");
doc.font("Helvetica").fontSize(10.5).fillColor(INK).text("•  API base: ", {
  indent: 8,
  continued: true,
});
doc.fillColor(INDIGO).text(API_URL, { link: API_URL, underline: true });
doc.moveDown(0.25);
doc
  .font("Helvetica")
  .fontSize(10.5)
  .fillColor(INK)
  .text("•  Live: ", { indent: 8, continued: true });
doc.fillColor(INDIGO).text(`${API_URL}v1/...`, {
  link: `${API_URL}v1/`,
  underline: true,
});
doc.moveDown(0.25);
doc
  .font("Helvetica")
  .fontSize(10.5)
  .fillColor(INK)
  .text("•  Test: ", { indent: 8, continued: true });
doc.fillColor(INDIGO).text(`${API_URL}v1/sandbox/...`, {
  link: `${API_URL}v1/sandbox/`,
  underline: true,
});
doc.moveDown(0.25);
bullets([
  "Dashboard Mode and API key environment must match the data plane you intend to use.",
  "Dashboard login is separate from API keys.",
]);

h2("10.5 Suggested integration path");
steps([
  "Request API access; create a Test key and webhook.",
  "Add beneficiaries; run OTC to managed tGHS in Test (Dashboard or API).",
  "Payout via API; consume webhooks.",
  "Reconcile with Transactions and Statements.",
  "Move to Live when enabled.",
]);

// ——— 11–13 ———
sectionPage();
h1("11. Notifications");
p(
  "The header bell shows environment-scoped alerts (for example OTC updates). Open the list, mark items read, or mark all read. Optional sound can be muted. Notifications can deep-link into the relevant trade.",
);

h1("12. Quick reference");
h2("Happy path - OTC to payout");
steps([
  "Sign in -> select Test or Live.",
  "Request OTC if the menu item is locked.",
  "Add a beneficiary (for payouts).",
  "OTC -> New -> Sell crypto -> settle Managed tGHS -> fund -> wait until Settled.",
  "tGHS -> Pay -> choose beneficiary -> confirm.",
  "Track under Transactions / payout receipt.",
  "Optional: generate a Statement for the period.",
]);

h1("13. Glossary");
kv([
  ["OTC", "Desk trade between stablecoin and GHS / tGHS"],
  ["tGHS", "Managed Ghana cedi treasury balance (1:1 with GHS)"],
  ["Disbursement", "Burn tGHS and pay Ghana MoMo or bank"],
  ["Reversal", "Remint after a failed payout"],
  ["Mode", "Test vs Live data plane in the Dashboard"],
  ["Feature request", "Ask Transika to unlock OTC or API access"],
]);
p(
  "For endpoint schemas, webhook signatures, and Test details, use the API documentation linked from the Dashboard sidebar.",
);
labeledLink("API host", API_URL);

doc.end();

await new Promise((resolve, reject) => {
  stream.on("finish", resolve);
  stream.on("error", reject);
});

console.log(`Wrote ${outPath}`);
