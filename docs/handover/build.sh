#!/bin/bash
# Regenerates the .docx and .pdf handover files from the Markdown sources.
# Requires: pandoc, Google Chrome.
set -e
cd "$(dirname "$0")"

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
CSS_FILE="$(mktemp /tmp/handover-XXXX.css)"
cat > "$CSS_FILE" <<'CSS'
body{font:15px/1.6 -apple-system,Helvetica,Arial,sans-serif;color:#1a1a1a;max-width:46rem;margin:2.5rem auto;padding:0 1.25rem}
h1{font-size:1.9rem;border-bottom:2px solid #111;padding-bottom:.3rem;margin-top:2.4rem}
h2{font-size:1.3rem;margin-top:2rem;border-bottom:1px solid #ccc;padding-bottom:.2rem}
h3{font-size:1.05rem;margin-top:1.4rem}
table{border-collapse:collapse;width:100%;margin:1rem 0;font-size:.92em}
th,td{border:1px solid #bbb;padding:.4rem .6rem;text-align:left;vertical-align:top}
th{background:#f0f0f0}
code{background:#f4f4f4;padding:.1rem .3rem;border-radius:3px;font-size:.88em}
pre{background:#f6f6f6;border:1px solid #e0e0e0;border-radius:5px;padding:.8rem;overflow:auto}
pre code{background:none;padding:0}
blockquote{border-left:3px solid #999;margin-left:0;padding-left:1rem;color:#444}
a{color:#0b5}
@media print{body{margin:0}h1{page-break-before:auto}}
CSS

for name in CRA8-Handover-Client CRA8-Handover-Developer; do
  echo "→ $name.docx"
  pandoc "$name.md" -o "$name.docx" --toc

  echo "→ $name.pdf"
  pandoc "$name.md" -o "$name.html" --standalone --toc --metadata title="$name" --css "$CSS_FILE" --embed-resources
  "$CHROME" --headless --disable-gpu --no-pdf-header-footer \
    --print-to-pdf="$PWD/$name.pdf" "file://$PWD/$name.html" 2>/dev/null
  rm -f "$name.html"
done

rm -f "$CSS_FILE"
echo "Done."
