#!/usr/bin/env python3
"""
Simple markdown-to-pptx converter tailored for our slide deck format.
- Splits slides by lines that are only '---'
- Slide title: first line beginning with '#' (strip '# ')
- Slide body: content before 'Speaker notes:'
- Notes: content after 'Speaker notes:'

Outputs: presentation/D365_Test_Framework_Presentation.pptx
"""
import re
from pathlib import Path
from pptx import Presentation
from pptx.util import Inches, Pt

ROOT = Path(__file__).resolve().parents[1]
MD_PATH = ROOT / 'presentation' / 'D365_Test_Framework_Presentation.md'
OUT_PATH = ROOT / 'presentation' / 'D365_Test_Framework_Presentation.pptx'

if not MD_PATH.exists():
    print(f"Error: markdown file not found: {MD_PATH}")
    raise SystemExit(1)

text = MD_PATH.read_text(encoding='utf-8')
# split on lines that contain only '---'
chunks = re.split(r'(?m)^\s*---\s*$', text)
# filter out empty chunks and frontmatter (having 'title:' in chunk start)
slides = []
for c in chunks:
    s = c.strip()
    if not s:
        continue
    # skip frontmatter if present
    if re.search(r'^title\s*:\s*', s, re.IGNORECASE | re.MULTILINE):
        continue
    slides.append(s)

prs = Presentation()
# remove any default slides
if prs.slides:
    pass

for idx, s in enumerate(slides, start=1):
    # extract speaker notes
    parts = re.split(r'(?mi)^speaker notes:\s*', s, maxsplit=1)
    body = parts[0].strip()
    notes = parts[1].strip() if len(parts) > 1 else ''

    # find title - first line starting with '#'
    title = None
    lines = [ln for ln in body.splitlines() if ln.strip()]
    for ln in lines:
        m = re.match(r'^#{1,6}\s*(.*)', ln)
        if m:
            title = m.group(1).strip()
            break
    if not title:
        # fallback to first non-empty line as title
        title = lines[0].strip() if lines else f"Slide {idx}"

    # remove the title line from body text for the content box
    content_lines = body.splitlines()
    if content_lines and re.match(r'^#{1,6}\s*', content_lines[0]):
        content_lines = content_lines[1:]
    # join as paragraph text
    content = '\n'.join([ln.strip() for ln in content_lines if ln.strip()])

    # Create slide with title and content
    layout = prs.slide_layouts[1] if len(prs.slide_layouts) > 1 else prs.slide_layouts[0]
    slide = prs.slides.add_slide(layout)
    # set title
    try:
        slide.shapes.title.text = title
    except Exception:
        # create a title textbox
        txBox = slide.shapes.add_textbox(Inches(0.5), Inches(0.2), Inches(9), Inches(0.6))
        tf = txBox.text_frame
        tf.text = title
        tf.paragraphs[0].font.size = Pt(24)

    # set content placeholder or create textbox
    body_placeholder = None
    for shape in slide.placeholders:
        if shape.placeholder_format.type._idx == 1:  # BODY placeholder
            body_placeholder = shape
            break
    if body_placeholder is not None:
        try:
            body_placeholder.text = content
        except Exception:
            # fallback
            tb = slide.shapes.add_textbox(Inches(0.5), Inches(1.2), Inches(9), Inches(4.5))
            tb.text_frame.text = content
    else:
        tb = slide.shapes.add_textbox(Inches(0.5), Inches(1.2), Inches(9), Inches(4.5))
        tb.text_frame.text = content

    # add speaker notes
    if notes:
        notes_slide = slide.notes_slide
        notes_text_frame = notes_slide.notes_text_frame
        notes_text_frame.text = notes

print(f"Creating PPTX: {OUT_PATH}")
OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
prs.save(str(OUT_PATH))
print("Done.")
