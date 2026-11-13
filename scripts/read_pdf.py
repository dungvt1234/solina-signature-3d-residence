import fitz

pdf_path = r"C:/Users/DELL/.gemini/antigravity/brain/8084aae1-8c22-4b12-90db-e95cd52c59e2/.user_uploaded/media_1794591996172_891726f4.pdf"
doc = fitz.open(pdf_path)
for i, page in enumerate(doc):
    print(f"\n=== TRANG {i+1} ===")
    print(page.get_text())
