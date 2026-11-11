/**
 * Generates Transika Partner Ops Clarifications (PDF).
 *   node scripts/generate-partner-ops-clarifications-pdf.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(__dirname, "..");
const outPath = path.join(
  docsRoot,
  "Transika-Partner-Ops-Clarifications.pdf",
);
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
    Title: "Transika Partner Ops Clarifications",
    Author: "Transika Ltd",
    Subject:
      "Product experience, delivery nuances, escalations, reversals, edits, POD",
  },
});

const stream = fs.createWriteStream(outPath);
doc.pipe(stream);

function h1(t) {
  doc.font("Helvetica-Bold").fontSize(15).fillColor(INDIGO).text(t);
  doc.moveDown(0.25);
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
  doc.moveDown(0.45);
  doc.font("Helvetica-Bold").fontSize(11.5).fillColor(INK).text(t);
  doc.moveDown(0.3);
}

function p(t) {
  doc.font("Helvetica").fontSize(10.5).fillColor(INK).text(t, {
    lineGap: 3.2,
    paragraphGap: 5,
  });
  doc.moveDown(0.45);
}

function bullets(items) {
  for (const item of items) {
    doc.font("Helvetica").fontSize(10.5).fillColor(INK).text(`•  ${item}`, {
      indent: 6,
      lineGap: 2.8,
      paragraphGap: 3,
    });
    doc.moveDown(0.15);
  }
  doc.moveDown(0.3);
}

function ensureSpace(min = 90) {
  if (doc.y > doc.page.height - doc.page.margins.bottom - min) {
    doc.addPage();
  }
}

/** Simple 2–3 column table. */
function table(headers, rows, colWidths) {
  const left = doc.page.margins.left;
  const usable =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const widths =
    colWidths ?? headers.map(() => usable / headers.length);
  const pad = 5;
  const fontSize = 9;

  function drawRow(cells, bold, fill) {
    const heights = cells.map((c, i) =>
      doc.heightOfString(String(c), {
        width: widths[i] - pad * 2,
        lineGap: 1.5,
      }),
    );
    const rowH = Math.max(...heights, 14) + pad * 2;
    ensureSpace(rowH + 8);

    if (fill) {
      doc
        .save()
        .rect(left, doc.y, usable, rowH)
        .fill(fill)
        .restore();
    }

    let x = left;
    const y0 = doc.y;
    cells.forEach((c, i) => {
      doc
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(fontSize)
        .fillColor(INK)
        .text(String(c), x + pad, y0 + pad, {
          width: widths[i] - pad * 2,
          lineGap: 1.5,
        });
      x += widths[i];
    });
    doc.y = y0 + rowH;
    doc
      .strokeColor(RULE)
      .lineWidth(0.5)
      .moveTo(left, doc.y)
      .lineTo(left + usable, doc.y)
      .stroke();
  }

  drawRow(headers, true, "#eef2ff");
  rows.forEach((r, i) => drawRow(r, false, i % 2 === 0 ? "#f8fafc" : null));
  doc.moveDown(0.7);
}

const DASHBOARD_URL = "https://institutional.tran-sika.com/";
const API_URL = "https://institutional-api.tran-sika.com/";

function linkLine(url) {
  doc
    .font("Helvetica")
    .fontSize(10.5)
    .fillColor(INDIGO)
    .text(url, { link: url, underline: true, lineGap: 2 });
  doc.fillColor(INK);
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
    .fontSize(18)
    .fillColor(INK)
    .text("Partner Ops Clarifications");
  doc.moveDown(0.85);
  p(
    "Answers to partner questions on product & recipient experience, delivery performance (instant vs non-instant), escalation / POD access, reversals, transfer edits, and proof of payment / delivery.",
  );
  doc.moveDown(0.35);
  doc.font("Helvetica-Bold").fontSize(10.5).fillColor(INDIGO).text("Dashboard");
  doc.moveDown(0.1);
  linkLine(DASHBOARD_URL);
  doc.moveDown(0.35);
  doc.font("Helvetica-Bold").fontSize(10.5).fillColor(INDIGO).text("API");
  doc.moveDown(0.1);
  linkLine(API_URL);
  doc.moveDown(0.9);
  doc.font("Helvetica").fontSize(10.5).fillColor(MUTED);
  doc.text("Transika Ltd");
  doc.moveDown(0.2);
  doc.text("Reg. CS248401025 · Tse Addo - Accra, Ghana");
  doc.moveDown(0.2);
  doc
    .fillColor(INDIGO)
    .text("info@tran-sika.com", {
      link: "mailto:info@tran-sika.com",
      underline: true,
    });
  doc.fillColor(MUTED);
  doc.moveDown(1);
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
  "1. Product knowledge & recipient experience",
  "2. Performance nuances — delivery days & instant vs non-instant",
  "3. Escalation matrix / POD access / portal",
  "4. Reversals — process & review criteria",
  "5. Transfer edits",
  "6. POP / POD without a rail portal",
  "7. Closing",
]);

// ——— 1 ———
doc.addPage();
h1("1. Product knowledge & recipient experience");
p(
  "These notes support partner macros and FAQ pages for the Ghana payout product (tGHS treasury → MoMo / bank).",
);

h2("What the product does");
p(
  "Your institution converts USDT/USDC to GHS on the Transika OTC desk, holds a managed tGHS balance (a GHS claim with Transika), then pays Ghana mobile money or bank beneficiaries via the dashboard or API.",
);

h2("Recipient experience");
bullets([
  "MoMo: MTN Mobile Money, Telecel Cash, AirtelTigo Money. The recipient is credited on their wallet and typically receives a network SMS/push from the telco (not from Transika).",
  "Bank: Major Ghana banks on our payout catalog (e.g. GCB, Ecobank, Stanbic, Absa, Fidelity, Zenith, Access, and others). Credit appears via the beneficiary’s bank statement/notification.",
  "Before payout we support name enquiry so the registered holder name can be confirmed and stored.",
  "End-user status on your side should follow our payout lifecycle: approved → burn → payout_pending → completed or payout_failed, plus webhooks / polling by your reference.",
]);

h2("What recipients do not see");
p(
  "Recipients do not interact with Transika, tGHS, or crypto. They only receive GHS on MoMo or bank.",
);

// ——— 2 ———
doc.addPage();
h1("2. Performance nuances");
p(
  "Days when transfers may not complete promptly, and which routes are instant versus non-instant.",
);

table(
  ["Route", "Typical speed", "Delay / non-delivery windows"],
  [
    [
      "MoMo (MTN / Telecel / AirtelTigo)",
      "Near-instant (seconds–minutes) when the telco and rail are healthy",
      "Telco maintenance, network outages, invalid/unregistered numbers, or wallet limits can leave a transfer pending or failed",
    ],
    [
      "Bank (Ghana Send-to-Bank)",
      "Usually same-session / near-real-time on supported banks when the bank rail is up",
      "More sensitive to bank processing windows, weekends, and Ghana public holidays; some bank credits can sit pending longer than MoMo",
    ],
  ],
  [110, 160, 214],
);

h2("Operational framing for FAQs");
bullets([
  "Treat MoMo as instant / near-instant; treat bank as near-instant with higher pending risk outside banking hours.",
  "We do not batch payouts to “next business day” by design; each payout is submitted when you request it. Pending reflects rail/bank/telco behaviour, not a scheduled hold.",
  "There is no hard “do not deliver on X day” calendar on our product. Practical delays cluster around telco downtime, bank holidays/weekends, and rail incidents.",
  "Always use status / webhooks: payout_pending is not paid; only completed means the beneficiary was paid.",
]);
p(
  "If you need contractual maximum times, numeric SLAs can be attached in the commercial schedule.",
);

// ——— 3 ———
doc.addPage();
h1("3. Escalation matrix / POD access / portal");

h2("Preferred path (reduces escalations)");
p(
  "Use the Transika merchant dashboard and/or merchant API:",
);
bullets([
  "Look up by your reference or our redemption id: receipt status, amount, beneficiary snapshot, timestamps, and on-chain burn proof (burnExplorerUrl / burnTxHash).",
  "Period statements (CSV / Excel / PDF) for ledger evidence.",
]);

h2("Access requirements");
p(
  "KYB-approved merchant account, Live enabled, and dashboard users and/or API keys (api:read / api:write). Additional CS users can be provisioned on your merchant organisation if needed.",
);

h2("Escalation when self-serve is not enough");
p(
  "For example US error assertions needing rail-level POD.",
);
bullets([
  "Email: support@tran-sika.com",
  "Include: your transaction id / reference, Transika redemption id (if known), amount, currency, beneficiary (masked OK), date/time (UTC), and reason (POD / failed / stuck pending / US customer dispute).",
]);
p(
  "We do not currently expose a separate rail partner portal for CSPartner direct POD download. Rail confirmations for disputes are fulfilled by Transika ops from our receipt and provider records.",
);

// ——— 4 ———
doc.addPage();
h1("4. Reversals — process & review criteria");
p(
  "A successful Ghana credit (status completed) is not auto-reversible via API. “Reversal” on our ledger means restoring tGHS after a failed payout, not clawing back money already in a recipient wallet.",
);

table(
  ["Situation", "Process"],
  [
    [
      "Payout failed after burn (payout_failed)",
      "Ops may retry the same payout on the rail, or reissue tGHS to your balance (statement line: Reversal) so you can pay again. Reissue eligibility typically waits a short failed-age window (default 24 hours unless waived).",
    ],
    [
      "Stuck payout_pending",
      "Escalate; we reconcile with the rail (callback / status check) and close to completed or failed.",
    ],
    [
      "Completed but customer claims not paid",
      "Escalate with ids (especially US). We investigate against rail confirmation / external txn id and share POD. True bank/MoMo clawback is exceptional and case-by-case with evidence — not a self-serve product.",
    ],
    [
      "Customer wants money back after successful delivery",
      "Not a Transika reversal product; treat under your refund policy / new collection. We will not reverse successful credits without a documented error case.",
    ],
  ],
  [160, 324],
);

h2("Happy to review");
bullets([
  "Failed or stuck payouts",
  "Mismatches (wrong amount/status)",
  "All US customer error assertions",
  "POD requests tied to a concrete transaction id",
]);

h2("Not appropriate escalations");
bullets([
  "Requests to edit or reverse a confirmed successful payout without an asserted error",
  "Speculative “please reverse just in case”",
  "Amount/beneficiary changes after submission (see transfer edits)",
]);
p(
  "We acknowledge you will always escalate US customer errors; that is expected and supported.",
);

// ——— 5 ———
doc.addPage();
h1("5. Transfer edits");
p("No. Submitted payouts cannot be edited (amount, beneficiary, account, or network).");
bullets([
  "Correct path: wait for terminal status. If failed → retry or reissue + new payout with correct details. If completed incorrectly → escalate as an error case (US or otherwise); do not attempt an edit.",
  "Saved beneficiaries: rail fields (account number, network, name) are immutable after create; only label / your reference id can change. Wrong account → create a new beneficiary.",
]);

// ——— 6 ———
h1("6. POP / POD without a rail portal");
table(
  ["Evidence", "How you obtain it"],
  [
    [
      "Business receipt / status",
      "Merchant dashboard redemption page or GET /tghs/redemptions/{id|reference} — status, amount, beneficiary, timestamps, your reference",
    ],
    [
      "On-chain proof of redemption (burn)",
      "burnExplorerUrl / burnTxHash on the receipt",
    ],
    [
      "Ledger / statement proof",
      "Statements export (PDF / CSV / Excel)",
    ],
    [
      "Rail-level POD (telco/bank external txn confirmation) for US disputes",
      "Escalate to support@tran-sika.com with your reference + Transika id; we supply confirmation from ops records",
    ],
  ],
  [170, 314],
);
p(
  "For US customers asserting an error, escalate early with ids; we treat POD fulfilment as a compliance-supporting ops workflow.",
);

// ——— 7 ———
h1("7. Closing");
p(
  "We are happy to join a short call to align SLAs, CS user access, and the exact escalation mailbox for your CSPartner portal.",
);
doc.moveDown(0.5);
doc.font("Helvetica-Bold").fontSize(10.5).fillColor(INK).text("Transika Ops / Partnerships");
doc.moveDown(0.25);
doc
  .font("Helvetica")
  .fontSize(10.5)
  .fillColor(INDIGO)
  .text("support@tran-sika.com", {
    link: "mailto:support@tran-sika.com",
    underline: true,
  });

doc.end();

await new Promise((resolve, reject) => {
  stream.on("finish", resolve);
  stream.on("error", reject);
});

console.log(`Wrote ${outPath}`);
