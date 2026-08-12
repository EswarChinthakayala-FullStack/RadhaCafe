import os
from PIL import Image, ImageDraw, ImageFont

def generate_og_image():
    # Dimensions: 1200 x 630 (Standard Open Graph Banner)
    width, height = 1200, 630
    
    # Create dark mahogany gradient image
    img = Image.new('RGBA', (width, height), (31, 16, 9, 255))
    draw = ImageDraw.Draw(img)
    
    # Background radial glow effect
    for r in range(450, 0, -5):
        alpha = int(25 * (1 - r / 450))
        draw.ellipse([600 - r * 1.5, 315 - r, 600 + r * 1.5, 315 + r], fill=(84, 49, 24, alpha))
        
    # Outer decorative gold border
    draw.rectangle([30, 30, width - 30, height - 30], outline=(217, 130, 91, 180), width=3)
    draw.rectangle([40, 40, width - 40, height - 40], outline=(247, 235, 220, 80), width=1)
    
    # Draw Left Text Content
    # Title "RadhaCafe"
    try:
        font_title = ImageFont.truetype("georgia.ttf", 84)
        font_badge = ImageFont.truetype("arial.ttf", 22)
        font_sub = ImageFont.truetype("arial.ttf", 28)
        font_feat = ImageFont.truetype("arial.ttf", 20)
    except Exception:
        font_title = font_badge = font_sub = font_feat = ImageFont.load_default()

    # Category Badge
    draw.rounded_rectangle([90, 85, 390, 130], radius=22, fill=(217, 130, 91, 45), outline=(217, 130, 91, 120), width=2)
    draw.text((115, 96), "☕ ARTISANAL CAFE & POS", fill=(217, 130, 91, 255), font=font_badge)
    
    # Brand Name
    draw.text((90, 160), "Radha", fill=(247, 235, 220, 255), font=font_title)
    # Calculate offset for "Cafe"
    title_bbox = draw.textbbox((90, 160), "Radha", font=font_title)
    draw.text((title_bbox[2] + 4, 160), "Cafe", fill=(217, 130, 91, 255), font=font_title)
    
    # Subtitle
    draw.text((90, 270), "Modern Cafe Management, Billing,", fill=(247, 235, 220, 230), font=font_sub)
    draw.text((90, 310), "Real-time Analytics & Thermal Printing", fill=(247, 235, 220, 230), font=font_sub)
    
    # Feature Pills
    features = ["⚡ Digital Billing", "📊 Live Analytics", "🖨️ Thermal Receipts"]
    fx = 90
    for feat in features:
        fbox = draw.textbbox((fx, 400), feat, font=font_feat)
        fw = fbox[2] - fbox[0] + 30
        draw.rounded_rectangle([fx, 390, fx + fw, 435], radius=10, fill=(255, 255, 255, 18), outline=(255, 255, 255, 40), width=1)
        draw.text((fx + 15, 400), feat, fill=(247, 235, 220, 255), font=font_feat)
        fx += fw + 16

    # Right side: Circular Vintage Emblem
    cx, cy, radius = 940, 315, 190
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=(247, 235, 220, 255))
    draw.ellipse([cx - radius + 8, cy - radius + 8, cx + radius - 8, cy + radius - 8], fill=(31, 16, 9, 255))
    draw.ellipse([cx - radius + 18, cy - radius + 18, cx + radius - 18, cy + radius - 18], outline=(247, 235, 220, 255), width=6)
    draw.ellipse([cx - radius + 28, cy - radius + 28, cx + radius - 28, cy + radius - 28], outline=(217, 130, 91, 255), width=3)
    
    # Inner medallion
    draw.ellipse([cx - 105, cy - 105, cx + 105, cy + 105], fill=(84, 49, 24, 255))
    draw.ellipse([cx - 100, cy - 100, cx + 100, cy + 100], outline=(247, 235, 220, 255), width=3)
    
    # Cup body & liquid inside medallion
    draw.polygon([(cx - 45, cy - 35), (cx - 35, cy + 35), (cx + 35, cy + 35), (cx + 45, cy - 35)], fill=(247, 235, 220, 255))
    draw.ellipse([cx - 45, cy - 43, cx + 45, cy - 27], fill=(247, 235, 220, 255), outline=(31, 16, 9, 255), width=2)
    draw.ellipse([cx - 38, cy - 41, cx + 38, cy - 29], fill=(31, 16, 9, 255))
    # Handle
    draw.arc([cx + 30, cy - 25, cx + 65, cy + 25], start=-90, end=90, fill=(247, 235, 220, 255), width=8)
    # Saucer
    draw.ellipse([cx - 60, cy + 33, cx + 60, cy + 47], fill=(247, 235, 220, 255), outline=(31, 16, 9, 255), width=2)
    
    # Save og-image.png
    os.makedirs('public', exist_ok=True)
    og_path = os.path.join('public', 'og-image.png')
    img.save(og_path, 'PNG')
    print(f"Successfully generated {og_path} (1200x630)")
    
    # Generate 512x512 Square Logo Image
    logo_size = 512
    logo_img = Image.new('RGBA', (logo_size, logo_size), (31, 16, 9, 255))
    logo_draw = ImageDraw.Draw(logo_img)
    
    lcx, lcy, lr = 256, 256, 230
    logo_draw.ellipse([lcx - lr, lcy - lr, lcx + lr, lcy + lr], fill=(247, 235, 220, 255))
    logo_draw.ellipse([lcx - lr + 10, lcy - lr + 10, lcx + lr - 10, lcy + lr - 10], fill=(31, 16, 9, 255))
    logo_draw.ellipse([lcx - lr + 22, lcy - lr + 22, lcx + lr - 22, lcy + lr - 22], outline=(247, 235, 220, 255), width=8)
    logo_draw.ellipse([lcx - lr + 34, lcy - lr + 34, lcx + lr - 34, lcy + lr - 34], outline=(217, 130, 91, 255), width=4)
    
    logo_draw.ellipse([lcx - 130, lcy - 130, lcx + 130, lcy + 130], fill=(84, 49, 24, 255))
    logo_draw.ellipse([lcx - 124, lcy - 124, lcx + 124, lcy + 124], outline=(247, 235, 220, 255), width=4)
    
    logo_draw.polygon([(lcx - 60, lcy - 45), (lcx - 45, lcy + 45), (lcx + 45, lcy + 45), (lcx + 60, lcy - 45)], fill=(247, 235, 220, 255))
    logo_draw.ellipse([lcx - 60, lcy - 55, lcx + 60, lcy - 35], fill=(247, 235, 220, 255), outline=(31, 16, 9, 255), width=3)
    logo_draw.ellipse([lcx - 50, lcy - 52, lcx + 50, lcy - 38], fill=(31, 16, 9, 255))
    logo_draw.arc([lcx + 40, lcy - 35, lcx + 85, lcy + 35], start=-90, end=90, fill=(247, 235, 220, 255), width=10)
    logo_draw.ellipse([lcx - 80, lcy + 42, lcx + 80, lcy + 60], fill=(247, 235, 220, 255), outline=(31, 16, 9, 255), width=3)

    for font_file, logo_out in [
        ('logo.png', (512, 512)),
        ('apple-touch-icon.png', (180, 180)),
        ('favicon.png', (64, 64))
    ]:
        out_p = os.path.join('public', font_file)
        resized = logo_img.resize(logo_out, Image.Resampling.LANCZOS)
        resized.save(out_p, 'PNG')
        print(f"Successfully generated {out_p} ({logo_out[0]}x{logo_out[1]})")

if __name__ == '__main__':
    generate_og_image()
