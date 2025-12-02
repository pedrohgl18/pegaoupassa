import os
from PIL import Image, ImageDraw, ImageOps

def create_icons(source_path, res_dir):
    if not os.path.exists(source_path):
        print(f"Source image not found: {source_path}")
        return

    img = Image.open(source_path).convert("RGBA")

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
        # Assuming the source logo is suitable for square
        icon = img.resize((size, size), Image.Resampling.LANCZOS)
        icon.save(os.path.join(folder_path, "ic_launcher.png"))
        
        # Create round version for ic_launcher_round.png
        # Create a circular mask
        mask = Image.new('L', (size, size), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, size, size), fill=255)
        
        # Apply mask
        icon_round = ImageOps.fit(img, (size, size), centering=(0.5, 0.5))
        icon_round.putalpha(mask)
        
        icon_round.save(os.path.join(folder_path, "ic_launcher_round.png"))
        
        print(f"Generated icons for {folder} ({size}x{size})")

if __name__ == "__main__":
    source = "logoapp.png"
    res_directory = "android/app/src/main/res"
    create_icons(source, res_directory)
