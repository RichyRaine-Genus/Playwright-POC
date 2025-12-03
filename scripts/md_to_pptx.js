const fs = require('fs');
const path = require('path');
const PptxGenJS = require('pptxgenjs');

const ROOT = path.resolve(__dirname, '..');
const mdPath = path.join(ROOT, 'presentation', 'D365_Test_Framework_Presentation.md');
const outPath = path.join(ROOT, 'presentation', 'D365_Test_Framework_Presentation.pptx');

if (!fs.existsSync(mdPath)) {
  console.error('Markdown file not found:', mdPath);
  process.exit(1);
}

const text = fs.readFileSync(mdPath, 'utf8');
// split on lines that are only '---' (unix or windows)
const chunks = text.split(/\r?\n---\r?\n/);

const slides = [];
for (let c of chunks) {
  const s = c.trim();
  if (!s) continue;
  // skip frontmatter
  if (/^title\s*:/mi.test(s)) continue;
  slides.push(s);
}

const pres = new PptxGenJS();
for (let i = 0; i < slides.length; i++) {
  const s = slides[i];
  // split speaker notes
  const parts = s.split(/^speaker notes:\s*/im);
  const body = parts[0].trim();
  const notes = parts[1] ? parts[1].trim() : '';

  // get title = first line starting with '#'
  const lines = body.split(/\r?\n/).map(l => l.trim());
  let title = null;
  for (let ln of lines) {
    const m = ln.match(/^#{1,6}\s*(.*)/);
    if (m) { title = m[1].trim(); break; }
  }
  if (!title) {
    // fallback
    title = lines.find(l => l.length > 0) || `Slide ${i+1}`;
  }

  // remove the title line from content if present
  let contentLines = body.split(/\r?\n/);
  if (contentLines.length && /^#{1,6}\s*/.test(contentLines[0])) {
    contentLines = contentLines.slice(1);
  }
  const content = contentLines.map(l => l.trim()).filter(Boolean).join('\n');

  const slide = pres.addSlide();
  slide.addText(title, { x: 0.5, y: 0.25, fontSize: 26, bold: true, color: '2E74B5' });
  if (content) {
    slide.addText(content, { x: 0.5, y: 1.0, fontSize: 14, color: '363636', w: '88%', h: 4.5, wrap: true });
  }
  if (notes) {
    try {
      slide.addNotes(notes);
    } catch (e) {
      // some versions might not support addNotes - ignore
      // fallback: add notes text small at bottom
      slide.addText('\nNotes:\n' + notes, { x: 0.5, y: 5.6, fontSize: 10, color: '666666', w: '88%' });
    }
  }
}

pres.writeFile({ fileName: outPath }).then(() => {
  console.log('PPTX created:', outPath);
}).catch(err => {
  console.error('Error creating PPTX:', err);
  process.exit(1);
});
