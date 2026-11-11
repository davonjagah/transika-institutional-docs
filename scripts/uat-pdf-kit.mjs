/**
 * Shared helpers for Transika go-live UAT PDFs.
 * Fixes: left-margin cursor after absolute draws; footers that do not spawn blank pages.
 */
export function createUatKit(PDFDocument, opts) {
  const {
    outPath,
    title,
    subject,
    logoCandidates = [],
  } = opts;

  const INDIGO = "#453CCC";
  const INK = "#0f172a";
  const MUTED = "#64748b";
  const RULE = "#cbd5e1";
  const BOX = "#e2e8f0";
  const MARGIN = 50;

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: MARGIN, bottom: MARGIN + 16, left: MARGIN, right: MARGIN },
    info: { Title: title, Author: "Transika Ltd", Subject: subject },
    bufferPages: true,
  });

  const fs = opts.fs;
  const stream = fs.createWriteStream(outPath);
  doc.pipe(stream);

  const pageW = () => doc.page.width - MARGIN * 2;
  const pageBottom = () => doc.page.height - MARGIN - 24;

  function resetCursor(y) {
    doc.x = MARGIN;
    if (y != null) doc.y = y;
  }

  function need(h) {
    resetCursor();
    if (doc.y <= MARGIN + 8) return;
    if (doc.y + h > pageBottom()) doc.addPage();
    resetCursor();
  }

  function h1(t) {
    need(64);
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
    need(36);
    resetCursor();
    doc.font("Helvetica-Bold").fontSize(11).fillColor(INK).text(t, {
      width: pageW(),
    });
    doc.moveDown(0.22);
    resetCursor();
  }

  function p(t) {
    resetCursor();
    doc.font("Helvetica").fontSize(9.5).fillColor(INK).text(t, {
      width: pageW(),
      lineGap: 2.2,
    });
    doc.moveDown(0.28);
    resetCursor();
  }

  function bullets(items) {
    resetCursor();
    for (const item of items) {
      doc.font("Helvetica").fontSize(9.5).fillColor(INK).text(`•  ${item}`, {
        width: pageW(),
        indent: 4,
        lineGap: 1.6,
      });
      doc.moveDown(0.06);
      resetCursor();
    }
    doc.moveDown(0.15);
    resetCursor();
  }

  function labeledLink(label, url) {
    resetCursor();
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(INDIGO).text(label, {
      width: pageW(),
    });
    doc.moveDown(0.06);
    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor(INDIGO)
      .text(url, { width: pageW(), link: url, underline: true });
    doc.fillColor(INK);
    doc.moveDown(0.22);
    resetCursor();
  }

  function resultBoxes() {
    resetCursor();
    const y = doc.y;
    const labels = ["Pass", "Fail", "Blocked", "N/A"];
    let x = MARGIN;
    doc.font("Helvetica").fontSize(8.5).fillColor(INK);
    for (const label of labels) {
      doc.rect(x, y, 8, 8).strokeColor(BOX).stroke();
      doc.text(label, x + 11, y - 1, { lineBreak: false });
      x += 68;
    }
    resetCursor(y + 14);
  }

  function caseBlock(c) {
    const needed = 82 + c.steps.length * 12;
    need(needed);
    resetCursor();
    doc
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .fillColor(INDIGO)
      .text(`${c.id}  ${c.title}`, { width: pageW() });
    doc.moveDown(0.18);
    resetCursor();

    if (c.pre) {
      doc
        .font("Helvetica-Oblique")
        .fontSize(8.5)
        .fillColor(MUTED)
        .text(`Precondition: ${c.pre}`, { width: pageW() });
      doc.moveDown(0.12);
      resetCursor();
    }

    doc.font("Helvetica-Bold").fontSize(8.5).fillColor(INK).text("Steps", {
      width: pageW(),
    });
    doc.moveDown(0.06);
    c.steps.forEach((s, i) => {
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(INK)
        .text(`${i + 1}.  ${s}`, { width: pageW(), indent: 4, lineGap: 1.4 });
      doc.moveDown(0.04);
      resetCursor();
    });
    doc.moveDown(0.1);

    doc.font("Helvetica-Bold").fontSize(8.5).fillColor(INK).text("Expected", {
      width: pageW(),
    });
    doc.moveDown(0.05);
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(INK)
      .text(c.expect, { width: pageW(), lineGap: 1.6 });
    doc.moveDown(0.18);
    resetCursor();

    doc.font("Helvetica").fontSize(8.5).fillColor(MUTED).text("Result", {
      width: pageW(),
    });
    doc.moveDown(0.08);
    resultBoxes();
    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(MUTED)
      .text("Tester / date / notes:", { width: pageW() });
    doc.moveDown(0.1);
    const lineY = doc.y + 8;
    doc
      .strokeColor(RULE)
      .moveTo(MARGIN, lineY)
      .lineTo(doc.page.width - MARGIN, lineY)
      .stroke();
    resetCursor(lineY + 6);
    doc
      .strokeColor(RULE)
      .moveTo(MARGIN, doc.y + 8)
      .lineTo(doc.page.width - MARGIN, doc.y + 8)
      .stroke();
    resetCursor(doc.y + 14);
    doc.moveDown(0.2);
    resetCursor();
  }

  function coverLogo() {
    const logo = logoCandidates.find((f) => fs.existsSync(f));
    if (logo) {
      try {
        doc.image(logo, MARGIN, MARGIN, { height: 30 });
        resetCursor(MARGIN + 46);
        return;
      } catch {
        /* fall through */
      }
    }
    resetCursor(MARGIN);
  }

  function writeFooters() {
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i);
      const bottom = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(MUTED)
        .text(`${title}  ·  ${i + 1} / ${range.count}`, MARGIN, doc.page.height - 26, {
          width: pageW(),
          align: "center",
          lineBreak: false,
        });
      doc.page.margins.bottom = bottom;
    }
  }

  async function finish() {
    writeFooters();
    doc.end();
    await new Promise((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);
    });
    console.log(`Wrote ${outPath}`);
  }

  return {
    doc,
    MARGIN,
    INDIGO,
    INK,
    MUTED,
    RULE,
    resetCursor,
    need,
    h1,
    h2,
    p,
    bullets,
    labeledLink,
    caseBlock,
    coverLogo,
    finish,
    pageW,
  };
}
