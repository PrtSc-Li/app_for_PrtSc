"""
生成 PWA 占位图标和启动画面
使用 Pillow 从基础图形生成所有所需尺寸的 PNG 文件
"""
import sys
import os

# 修复 Windows GBK 编码问题
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from PIL import Image, ImageDraw

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

# ===== 配置颜色 =====
BG_LIGHT = "#FFF0F3"
BG_ICON = "#FF7BA6"   # 樱花粉
FG_COLOR = "#ffffff"  # 白色前景

def create_rounded_rect_mask(size, radius_ratio=0.2):
    """创建圆角矩形蒙版"""
    from PIL import ImageDraw as ID
    mask = Image.new("L", size, 0)
    draw = ID.Draw(mask)
    r = int(min(size) * radius_ratio)
    draw.rounded_rectangle([(0, 0), (size[0]-1, size[1]-1)], radius=r, fill=255)
    return mask

def draw_app_icon(size):
    """绘制一个简洁的应用图标 — 圆角矩形 + 白色星形"""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))

    # 圆角矩形背景
    mask = create_rounded_rect_mask((size, size), 0.225)
    bg = Image.new("RGBA", (size, size), BG_ICON)
    img.paste(bg, (0, 0), mask)

    draw = ImageDraw.Draw(img)

    # 绘制一个简化的白色星星 (5-point star)
    margin = int(size * 0.25)
    cx, cy = size // 2, size // 2
    outer_r = int(size * 0.32)
    inner_r = int(size * 0.14)

    import math
    points = []
    for i in range(10):
        angle = math.pi / 2 + i * math.pi / 5
        r = outer_r if i % 2 == 0 else inner_r
        x = cx + r * math.cos(angle)
        y = cy - r * math.sin(angle)
        points.append((x, y))

    draw.polygon(points, fill=FG_COLOR)

    return img

def draw_splash(size):
    """绘制启动画面 — 浅色背景 + 居中图标"""
    img = Image.new("RGB", size, BG_LIGHT)

    # 在中心绘制一个小图标
    icon_size = int(min(size) * 0.15)
    icon = draw_app_icon(icon_size)

    # 居中放置
    x = (size[0] - icon_size) // 2
    y = (size[1] - icon_size) // 2
    img.paste(icon, (x, y), icon)

    return img


# ===== 生成图标 =====
icons_dir = os.path.join(OUTPUT_DIR, "icons")
os.makedirs(icons_dir, exist_ok=True)

icon_sizes = [48, 72, 96, 120, 144, 152, 167, 180, 192, 256, 384, 512]

for s in icon_sizes:
    img = draw_app_icon(s)
    path = os.path.join(icons_dir, f"icon-{s}x{s}.png")
    img.save(path, "PNG")
    print(f"[OK] {path}")

print(f"\n共生成 {len(icon_sizes)} 个图标文件")

# ===== 生成启动画面 =====
splash_dir = os.path.join(OUTPUT_DIR, "splash")
os.makedirs(splash_dir, exist_ok=True)

# iPhone / iPad 启动画面规格: (逻辑宽, 逻辑高, 像素比, 文件名标识)
splash_specs = [
    # iPhone 15 Pro Max / 14 Pro Max
    (430, 932, 3, "iPhone_14_Pro_Max"),
    # iPhone 15 Pro / 14 Pro
    (393, 852, 3, "iPhone_14_Pro"),
    # iPhone 15 / 14
    (390, 844, 3, "iPhone_14"),
    # iPhone 15 Plus / 14 Plus
    (428, 926, 3, "iPhone_14_Plus"),
    # iPhone SE / 8 / 7 / 6
    (375, 667, 2, "iPhone_SE"),
    # iPhone 13 / 12 / 12 Pro
    (390, 844, 3, "iPhone_13"),
    # iPhone 12 mini / 13 mini
    (375, 812, 3, "iPhone_12_mini"),
    # iPad 10.9" / iPad Air
    (820, 1180, 2, "iPad_10_9"),
    # iPad Pro 12.9"
    (1024, 1366, 2, "iPad_Pro_12_9"),
]

for logic_w, logic_h, ratio, name in splash_specs:
    px_w = logic_w * ratio
    px_h = logic_h * ratio

    # 竖屏
    img_p = draw_splash((px_w, px_h))
    path_p = os.path.join(splash_dir, f"{name}_portrait.png")
    img_p.save(path_p, "PNG")
    print(f"✓ {path_p} ({px_w}x{px_h})")

    # 横屏
    img_l = draw_splash((px_h, px_w))
    path_l = os.path.join(splash_dir, f"{name}_landscape.png")
    img_l.save(path_l, "PNG")
    print(f"✓ {path_l} ({px_h}x{px_w})")

print(f"\n共生成 {len(splash_specs) * 2} 个启动画面文件")
print("\n完成！")
