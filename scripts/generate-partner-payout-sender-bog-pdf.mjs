/**
 * Partner guide: payout sender & BOG reporting (PDF).
 *   node scripts/generate-partner-payout-sender-bog-pdf.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(__dirname, "..");
const apiDocDir = path.resolve(docsRoot, "../transika-api/doc");
const outPath = path.join(apiDocDir, "partner-payout-sender-bog.pdf");

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
const CODE_BG = "#f1f5f9";
const MARGIN = 56;

const doc = new PDFDocument({
  size: "A4",
  margins: { top: MARGIN, bottom: MARGIN + 18, left: MARGIN, right: MARGIN },
  bufferPages: true,
  info: {
    Title: "Transika Partner Guide — Payout Sender (BOG Reporting)",
    Author: "Transika Ltd",
    Subject:
      "tGHS payout sender fields, origin currency, webhooks, and Bank of Ghana reporting",
  },
});

const stream = fs.createWriteStream(outPath);
doc.pipe(stream);

function ensureSpace(min = 72) {
  if (doc.y > doc.page.height - doc.page.margins.bottom - min) {
    doc.addPage();
  }
}

function h1(t) {
  ensureSpace(64);
  doc.font("Helvetica-Bold").fontSize(14).fillColor(INDIGO).text(t);
  doc.moveDown(0.2);
  const y = doc.y;
  doc
    .strokeColor(RULE)
    .lineWidth(1)
    .moveTo(doc.page.margins.left, y)
    .lineTo(doc.page.width - doc.page.margins.right, y)
    .stroke();
  doc.moveDown(0.75);
}

function h2(t) {
  ensureSpace(40);
  doc.moveDown(0.35);
  doc.font("Helvetica-Bold").fontSize(11).fillColor(INK).text(t);
  doc.moveDown(0.25);
}

function h3(t) {
  ensureSpace(32);
  doc.moveDown(0.2);
  doc.font("Helvetica-Bold").fontSize(10).fillColor(INK).text(t);
  doc.moveDown(0.18);
}

function p(t) {
  ensureSpace(28);
  doc.font("Helvetica").fontSize(10).fillColor(INK).text(t, {
    lineGap: 2.8,
    paragraphGap: 4,
  });
  doc.moveDown(0.35);
}

function bullets(items) {
  for (const item of items) {
    ensureSpace(20);
    doc.font("Helvetica").fontSize(10).fillColor(INK).text(`•  ${item}`, {
      indent: 6,
      lineGap: 2.4,
      paragraphGap: 2,
    });
    doc.moveDown(0.1);
  }
  doc.moveDown(0.25);
}

function table(headers, rows, colWidths) {
  const left = doc.page.margins.left;
  const usable =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const widths = colWidths ?? headers.map(() => usable / headers.length);
  const pad = 5;
  const fontSize = 8.5;

  function drawRow(cells, bold, fill) {
    const heights = cells.map((c, i) =>
      doc.heightOfString(String(c), {
        width: widths[i] - pad * 2,
        lineGap: 1.4,
      }),
    );
    const rowH = Math.max(...heights, 13) + pad * 2;
    ensureSpace(rowH + 8);

    if (fill) {
      doc.save().rect(left, doc.y, usable, rowH).fill(fill).restore();
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
          lineGap: 1.4,
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
  doc.moveDown(0.55);
}

function codeBlock(text, fontSize = 7.2) {
  const left = doc.page.margins.left;
  const usable =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const pad = 8;
  doc.font("Courier").fontSize(fontSize);
  const h =
    doc.heightOfString(text, { width: usable - pad * 2, lineGap: 1.1 }) +
    pad * 2;
  ensureSpace(h + 12);
  const y0 = doc.y;
  doc.save().rect(left, y0, usable, h).fill(CODE_BG).restore();
  doc
    .font("Courier")
    .fontSize(fontSize)
    .fillColor(INK)
    .text(text, left + pad, y0 + pad, {
      width: usable - pad * 2,
      lineGap: 1.1,
    });
  doc.y = y0 + h;
  doc.moveDown(0.45);
}

function writeFooters(title) {
  const range = doc.bufferedPageRange();
  const usable =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    const bottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc
      .font("Helvetica")
      .fontSize(7.5)
      .fillColor(MUTED)
      .text(`${title}  ·  Page ${i + 1} of ${range.count}`, doc.page.margins.left, doc.page.height - 28, {
        width: usable,
        align: "center",
        lineBreak: false,
      });
    doc.page.margins.bottom = bottom;
  }
}

// ——— Cover ———
{
  const logo = logoCandidates.find((f) => fs.existsSync(f));
  if (logo) {
    try {
      doc.image(logo, MARGIN, MARGIN + 6, { height: 32 });
      doc.y = MARGIN + 58;
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
    .fontSize(16)
    .fillColor(INK)
    .text("Partner Guide — Payout Sender");
  doc.moveDown(0.15);
  doc.font("Helvetica-Bold").fontSize(13).fillColor(MUTED).text("Bank of Ghana reporting");
  doc.moveDown(0.85);

  p(
    "Customer-facing reference for Live tGHS payout integrations: remitter (sender) KYC on create, origin currency vs GHS payout amount, webhook examples, and failure handling.",
  );

  doc.moveDown(0.4);
  h3("API base URLs");
  doc.font("Helvetica").fontSize(10).fillColor(INDIGO);
  doc.text("Live:  POST /v1/tghs/payout", { lineGap: 2 });
  doc.text("Test:  POST /v1/sandbox/tghs/payout", { lineGap: 2 });
  doc.fillColor(INK);
  doc.moveDown(0.6);

  doc.font("Helvetica").fontSize(10).fillColor(MUTED);
  doc.text("Transika Ltd");
  doc.moveDown(0.15);
  doc.text("Reg. CS248401025 · Tse Addo — Accra, Ghana");
  doc.moveDown(0.15);
  doc
    .fillColor(INDIGO)
    .text("support@tran-sika.com", {
      link: "mailto:support@tran-sika.com",
      underline: true,
    });
  doc.fillColor(MUTED);
  doc.moveDown(0.8);
  doc
    .font("Helvetica")
    .fontSize(9)
    .text(`Document version ${new Date().toISOString().slice(0, 10)}`);
}

// ——— 1. API vs requirement ———
doc.addPage();
h1("1. API vs your integration requirement");

p(
  "On POST /v1/tghs/payout, the sender object is optional in the API schema — a payout without it still processes.",
);
p(
  "For Live production and Bank of Ghana (BOG) compliance, you must send a complete sender block on every payout. Without it, originator KYC is not stored and regulatory reporting for that transaction is incomplete.",
);
p(
  "After create, GET /v1/tghs/redemptions* omits sender PII and returns senderProvided: true when remitter data was captured. Webhooks include the stored sender on data.payout.",
);

h2("Required top-level payout fields");
table(
  ["Field", "Required", "Notes"],
  [
    ["amount", "Yes", "GHS payout amount — tGHS burned and GHS disbursed (always cedi)"],
    ["beneficiaryId", "Yes", "Beneficiary in the same environment"],
    ["reference", "Yes", "Your correlation id (max 64 characters)"],
    ["idempotencyKey", "Yes", "8–64 chars; same merchant + env + key returns existing redemption"],
    ["sender", "Yes (you)", "Required for BOG reporting (optional in raw API)"],
  ],
  [95, 52, 293],
);

// ——— 2. Sender fields ———
h1("2. Required sender fields (BOG)");

p(
  "Send sender on every Live payout. Use top-level sender only — not senderDetails or a legacy transaction block (unknown keys return HTTP 422).",
);

table(
  ["Field", "Required", "Format / values"],
  [
    ["fullName", "Yes*", "1–200 characters"],
    ["idType", "Yes", "passport | national_id | drivers_license | other"],
    ["idNumber", "Yes", "1–64 characters (must pair with idType)"],
    ["transactionType", "Yes", "e.g. remittance"],
    ["purpose", "Yes", "e.g. family_support, goods, services"],
    ["remittance", "Yes", "Your partner / invoice reference (1–200)"],
    ["currency", "Yes", "Origin currency — ISO code (USD, EUR, GBP, …)"],
    ["amount", "Yes", "Origin amount — in sender.currency, not GHS"],
    ["country", "Yes", "ISO-3166-1 alpha-2 remitter country (US, ES, GB, …)"],
    ["idCountry", "Yes", "ISO-3166-1 alpha-2 ID issuing country"],
    ["nationality", "Yes", "ISO-3166-1 alpha-2"],
  ],
  [88, 42, 310],
);

p("* Alternative: firstName + lastName (both required together) instead of fullName.");

p(
  "Transika partner payouts are cross-border remittances: the remitter pays in a foreign origin currency; the beneficiary receives GHS in Ghana. Always send origin currency and amount on sender.",
);

h2("Origin currency vs GHS payout");
p("A payout has two amounts in different roles:");

table(
  ["Where", "Field", "Meaning"],
  [
    ["Top level", "amount", "Ghana leg — GHS paid out (burn + MoMo/bank). Always cedi."],
    [
      "Inside sender",
      "currency",
      "Origin currency — ISO code of what the remitter paid in (USD, EUR, GBP, …).",
    ],
    [
      "Inside sender",
      "amount",
      "Origin amount — value in that origin currency, not the GHS payout figure.",
    ],
  ],
  [78, 62, 300],
);

p(
  "Example: customer sends EUR 100 from Spain; beneficiary receives GHS 1,680. You send top-level amount: 1680.00 (GHS) and sender: { currency: \"EUR\", amount: 100, … }.",
);
p(
  "BOG reporting uses the sender block (and stored transaction snapshot) for the remittance / origin side. The top-level amount is the Ghana disbursement only. Origin and GHS amounts are independent.",
);

h2("Optional sender fields (not required for BOG)");
table(
  ["Field", "Notes"],
  [
    ["addressLine1, addressLine2, city, region, postalCode", "Address"],
    ["phone, email", "Contact"],
    ["dateOfBirth", "YYYY-MM-DD"],
  ],
  [175, 265],
);

// ——— 3. Examples ———
doc.addPage();
h1("3. Example create request");

p(
  "Remitter pays EUR 100 in Spain; IMTO pays GHS 1,680 in Ghana. Top-level amount is always GHS; sender carries the origin leg.",
);

codeBlock(`POST /v1/tghs/payout
Authorization: Bearer <live_api_key>
Content-Type: application/json`);

codeBlock(`{
  "amount": 1680.00,
  "beneficiaryId": "6efd9aee-bc48-4a4c-bc41-183f9fbd8c3b",
  "reference": "INV-1001",
  "idempotencyKey": "payout-inv-1001-eur100",
  "sender": {
    "fullName": "Maria Garcia",
    "idType": "passport",
    "idNumber": "XDE123456",
    "transactionType": "remittance",
    "purpose": "family_support",
    "remittance": "INV-1001",
    "currency": "EUR",
    "amount": 100.00,
    "country": "ES",
    "idCountry": "ES",
    "nationality": "ES"
  }
}`);

p(
  "Here amount: 1680.00 is GHS paid out; sender.currency / sender.amount are EUR 100 — what the remitter paid before conversion.",
);
p("Sandbox: same body against POST /v1/sandbox/tghs/payout with your Test API key.");

// ——— 4. Webhooks ———
doc.addPage();
h1("4. Webhook example — tghs.payout.burn_failed");

p(
  "Failure statuses are receipt states, not HTTP errors. Your endpoint receives a signed POST with a JSON body like:",
);

codeBlock(`{
  "id": "3f2c1a90-7b4e-4d1a-9c8f-2a1b0c9d8e7f",
  "type": "tghs.payout.burn_failed",
  "created": "2026-09-02T12:48:05.110Z",
  "data": {
    "payout": {
      "id": "9ce685a9-5886-4de6-871a-041bdb95f592",
      "environment": "live",
      "amount": "1680.00",
      "reference": "INV-1001",
      "status": "burn_failed",
      "failureReason": "Circle burn submission failed",
      "sender": {
        "fullName": "Maria Garcia",
        "idType": "passport",
        "idNumber": "XDE123456",
        "currency": "EUR",
        "amount": 100,
        "country": "ES"
      },
      "beneficiaryLabel": "MTN 9460",
      "paymentMode": "momo"
    }
  }
}`, 6.8);

h2("Webhook headers");
codeBlock(`Content-Type: application/json
X-Transika-Event: tghs.payout.burn_failed
X-Transika-Delivery: <delivery-id>
X-Transika-Timestamp: <unix-seconds>
X-Transika-Signature: t=<timestamp>,v1=<hex>`);

p("Verify the HMAC signature before trusting the body.");

h2("What burn_failed means");
bullets([
  "Final — polling will not turn this receipt into success.",
  "Ghana payment was never sent.",
  "tGHS was not consumed (Live: no on-chain burn; Test: ledger restored).",
  "Action: fail the payout on your side. Retry with a new idempotencyKey (and new reference if you use one per attempt).",
]);

h2("payout_failed (summary)");
p(
  "When burn succeeded but Ghana disbursement failed: status is payout_failed. tGHS was burned; you may treat as terminal on your side and refund your customer after confirming with Transika (ops may retry or reissue tGHS).",
);

// ——— 5. Quick reference ———
doc.addPage();
h1("5. Quick reference");

table(
  ["Topic", "Detail"],
  [
    ["Top-level amount", "GHS payout (Ghana leg)"],
    ["sender.currency", "Origin currency (foreign ISO code — what remitter paid in)"],
    ["sender.amount", "Origin amount in that currency (not GHS)"],
    ["Sender on create", "Required for you; optional in API schema"],
    [
      "Only optional sender fields",
      "Address lines, city, region, postal code, phone, email, date of birth",
    ],
    ["GET redemptions", "senderProvided: true; no sender PII"],
    ["Webhooks", "Full sender on data.payout"],
    ["Invalid keys", "senderDetails, top-level transaction → HTTP 422"],
  ],
  [148, 292],
);

doc.moveDown(0.6);
p(
  "For payout failure details and additional response samples, contact Transika support or refer to the Transika API documentation.",
);
doc.moveDown(0.4);
doc.font("Helvetica-Bold").fontSize(10).fillColor(INK).text("Transika Support");
doc.moveDown(0.15);
doc
  .font("Helvetica")
  .fontSize(10)
  .fillColor(INDIGO)
  .text("support@tran-sika.com", {
    link: "mailto:support@tran-sika.com",
    underline: true,
  });

writeFooters("Transika Partner Guide — Payout Sender (BOG)");
doc.end();

await new Promise((resolve, reject) => {
  stream.on("finish", resolve);
  stream.on("error", reject);
});

console.log(`Wrote ${outPath}`);
