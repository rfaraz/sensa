
# Extract text from HTML
import re
import html as html_lib
import pprint

# Load the HTML file
with open("aha_manual.txt", "r", encoding="utf-8") as f:
    html = f.read()

# Helper to clean HTML text
def clean_html(text):
    text = re.sub(r"<[^>]+>", "", text)  # remove tags
    return html_lib.unescape(text.strip())  # decode HTML entities

# Find all caption-table pairs
tables = re.findall(r"<caption>(.*?)</caption>(.*?)</table>", html, re.DOTALL)

# Extract data into a dict
result = {}

for caption, table_content in tables:
    key = clean_html(caption)
    steps = re.findall(r"<td[^>]*>(.*?)</td>", table_content, re.DOTALL)
    cleaned_steps = [clean_html(step) for step in steps]
    result[key] = cleaned_steps

# Write results to output file
with open("aha_output.txt", "w", encoding="utf-8") as out_f:
    pprint.pprint(result, stream=out_f)
