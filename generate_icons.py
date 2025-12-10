import os
import math
from PIL import Image, ImageDraw, ImageOps

def create_gradient_heart(size):
    # Create base image
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background: Rounded Rect
    bg_color = "#0F172A"
    rect_coords = [0, 0, size, size]
    radius = size // 4
    draw.rounded_rectangle(rect_coords, radius=radius, fill=bg_color)

    # Heart Shape (Bezier-like approximation or polygon)
    # Simplified heart path for PIL
    # Center: size/2, size/2
    cx, cy = size // 2, size // 2
    scale = size * 0.04 # Match standard scaling

    # Create a separate mask for the heart to apply gradient
    heart_mask = Image.new('L', (size, size), 0)
    h_draw = ImageDraw.Draw(heart_mask)
    
    # Mathematical Heart
    points = []
    for t in range(0, 628): # 0 to 2pi * 100
        t_rad = t / 100.0
        x = 16 * math.sin(t_rad)**3
        y = -(13 * math.cos(t_rad) - 5 * math.cos(2*t_rad) - 2 * math.cos(3*t_rad) - math.cos(4*t_rad))
        points.append((cx + x * scale, cy + y * scale))
    
    h_draw.polygon(points, fill=255)

    # Create Gradient Texture
    gradient = Image.new('RGBA', (size, size), (0,0,0,0))
    g_draw = ImageDraw.Draw(gradient)
    
    # Simple linear gradient approximation (Green -> Blue -> Yellow)
    # Since PIL doesn't have built-in easy gradients for complex shapes, 
    # we'll create a diagonal gradient background and mask it
    for i in range(size):
        # Diagonal ratio (0 to 1)
        ratio = i / size
        # Interpolate color: 
        # 0.0 = #00FF94 (0, 255, 148)
        # 0.5 = #00C2FF (0, 194, 255)
        # 1.0 = #FFD600 (255, 214, 0)
        
        if ratio < 0.5:
            # Green to Blue
            r_mix = ratio * 2
            r = int(0 * (1-r_mix) + 0 * r_mix)
            g = int(255 * (1-r_mix) + 194 * r_mix)
            b = int(148 * (1-r_mix) + 255 * r_mix)
        else:
            # Blue to Yellow
            r_mix = (ratio - 0.5) * 2
            r = int(0 * (1-r_mix) + 255 * r_mix)
            g = int(194 * (1-r_mix) + 214 * r_mix)
            b = int(255 * (1-r_mix) + 0 * r_mix)
        
        g_draw.line([(0, i), (size, i)], fill=(r, g, b), width=1)
    
    # Apply heart mask to gradient 
    # (Actually we want diagonal gradient, the loop above is vertical. Let's rotate it)
    gradient = gradient.rotate(-45)
    
    # Composite
    heart_img = Image.new('RGBA', (size, size), (0,0,0,0))
    heart_img.paste(gradient, (0,0), heart_mask)
    
    # Add Glow (Simplified by just pasting slightly larger transparent version? 
    # PIL blur is available if we import ImageFilter, but let's keep it simple specific to this env)
    # We will just paste the sharp heart for now.
    
    img.alpha_composite(heart_img)
    return img

def create_icons(res_dir):
    source_size = 1024
    print("Generating Master Logo...")
    master_icon = create_gradient_heart(source_size)
    master_icon.save("logoapp.png")
    print("Saved logoapp.png")

    # Sizes for mipmap folders
    sizes = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192
    }

    for folder, size in sizes.items():
        folder_path = os.path.join(res_dir, folder)
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)
        
        # Resize for ic_launcher.png (square/adaptive)
        icon = master_icon.resize((size, size), Image.Resampling.LANCZOS)
        icon.save(os.path.join(folder_path, "ic_launcher.png"))
        
        # Create round version for ic_launcher_round.png
        mask = Image.new('L', (size, size), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, size, size), fill=255)
        
        icon_round = ImageOps.fit(master_icon, (size, size), centering=(0.5, 0.5))
        icon_round.putalpha(mask)
        
        icon_round.save(os.path.join(folder_path, "ic_launcher_round.png"))
        
        print(f"Generated icons for {folder} ({size}x{size})")

if __name__ == "__main__":
    res_directory = "android/app/src/main/res"
    create_icons(res_directory)
