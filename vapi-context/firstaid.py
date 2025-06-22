from pypdf import PdfReader

reader = PdfReader('first_aid_manual.pdf')
with open('first_aid_manual_all_pages.txt', 'w', encoding='utf-8') as f:
    for i, page in enumerate(reader.pages[9:], start=10):
        # Skip pages 181 to 192 (inclusive)
        if 181 <= i <= 192:
            continue
        text = page.extract_text()
        f.write(f"--- Page {i} ---\n")
        f.write(text if text else "")
        f.write("\n\n")