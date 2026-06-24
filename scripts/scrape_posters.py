"""
以闪亮之名 — BWIKI 套装海报爬虫
===================================
从 wiki.biligame.com/yslzgame 批量下载套装海报图片。

用法:
    conda activate web0
    cd d:/cctest

    python scripts/scrape_posters.py                      # 下载全部84套
    python scripts/scrape_posters.py --scout              # 探测wiki结构+测试样本页
    python scripts/scrape_posters.py --test               # 仅测试前3套，验证流程
    python scripts/scrape_posters.py --names "海谕遥音,翩鸿赋雪"  # 下载指定套装
    python scripts/scrape_posters.py --output ./my_posters      # 指定输出目录

套装名称来源:
    读取项目中的 限时六星.json + 限时五星.json 的 "套装名称" 字段。
"""

import argparse
import json
import os
import re
import sys
import time
from io import BytesIO
from pathlib import Path

import requests
from bs4 import BeautifulSoup
from PIL import Image

# ─── 配置 ───────────────────────────────────────────────

BASE_URL = "https://wiki.biligame.com/yslzgame"
GALLERY_PAGE = "套装图鉴"
API_URL = f"{BASE_URL}/api.php"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/125.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
}
REQUEST_DELAY = 3.5         # 请求间隔（秒）
MAX_RETRIES = 3             # 最大重试次数
RETRY_BACKOFF = [5, 10, 20] # 重试退避时间（秒）
REQUEST_TIMEOUT = 30        # 请求超时（秒）
IMAGE_MAX_WIDTH = 800       # 海报压缩最大宽度
IMAGE_QUALITY = 85          # JPEG 压缩质量

# ─── 项目路径 ────────────────────────────────────────────

PROJECT_ROOT = Path(__file__).resolve().parent.parent
POSTERS_DIR = PROJECT_ROOT / "posters"
JSON_SIX_STAR = PROJECT_ROOT / "限时六星.json"
JSON_FIVE_STAR = PROJECT_ROOT / "限时五星.json"
JSON_TREND = PROJECT_ROOT / "潮流密码.json"


# ══════════════════════════════════════════════════════════
#  数据加载
# ══════════════════════════════════════════════════════════

def load_outfit_names(json_paths=None):
    """
    从JSON文件读取套装名称列表。
    返回: [(套装全名, 昵称, 来源文件名), ...]
    """
    if json_paths is None:
        json_paths = [JSON_SIX_STAR, JSON_FIVE_STAR, JSON_TREND]

    outfits = []
    for jp in json_paths:
        jp = Path(jp)
        if not jp.exists():
            print(f"[警告] 文件不存在，跳过: {jp}")
            continue
        with open(jp, "r", encoding="utf-8") as f:
            data = json.load(f)
        for entry in data:
            full_name = entry.get("套装名称", "").strip()
            nickname = entry.get("昵称", "").strip()
            if full_name:
                outfits.append((full_name, nickname, jp.name))
    return outfits


# ══════════════════════════════════════════════════════════
#  HTTP 工具
# ══════════════════════════════════════════════════════════

def fetch(url, params=None, as_json=False, session=None):
    """带重试的HTTP请求。"""
    s = session or requests.Session()
    for attempt in range(MAX_RETRIES):
        try:
            if as_json:
                resp = s.get(url, params=params, headers=HEADERS, timeout=REQUEST_TIMEOUT)
                resp.raise_for_status()
                return resp.json()
            else:
                resp = s.get(url, params=params, headers=HEADERS, timeout=REQUEST_TIMEOUT)
                resp.raise_for_status()
                return resp
        except requests.RequestException as e:
            wait = RETRY_BACKOFF[min(attempt, len(RETRY_BACKOFF) - 1)]
            if attempt < MAX_RETRIES - 1:
                print(f"    [重试 {attempt+1}/{MAX_RETRIES}] {e}，{wait}s后重试...")
            time.sleep(wait)
    print(f"    [失败] 已达最大重试次数: {url}")
    return None


def fetch_page_html(page_title, session=None):
    """通过MediaWiki API获取页面渲染HTML。"""
    resp = fetch(
        API_URL,
        params={
            "action": "parse",
            "page": page_title,
            "prop": "text|images",
            "format": "json",
        },
        as_json=True,
        session=session,
    )
    if resp and "parse" in resp:
        return resp["parse"]
    return None


def fetch_page_images(page_title, session=None):
    """获取wiki页面中的所有图片文件名。"""
    resp = fetch(
        API_URL,
        params={
            "action": "parse",
            "page": page_title,
            "prop": "images",
            "format": "json",
        },
        as_json=True,
        session=session,
    )
    if resp and "parse" in resp:
        return resp["parse"].get("images", [])
    return []


def fetch_image_url(file_title, session=None):
    """通过MediaWiki API获取图片直链URL。"""
    resp = fetch(
        API_URL,
        params={
            "action": "query",
            "titles": file_title,
            "prop": "imageinfo",
            "iiprop": "url",
            "format": "json",
        },
        as_json=True,
        session=session,
    )
    if resp and "query" in resp:
        pages = resp["query"].get("pages", {})
        for _page_id, page_data in pages.items():
            imageinfo = page_data.get("imageinfo", [])
            if imageinfo:
                return imageinfo[0].get("url")
    return None


def fetch_all_page_titles_in_category(category_name, session=None):
    """
    获取分类下所有页面标题（备用策略：如果直接按名称无法找到页面）。
    """
    all_titles = []
    params = {
        "action": "query",
        "list": "categorymembers",
        "cmtitle": f"Category:{category_name}",
        "cmlimit": "max",
        "format": "json",
    }
    while True:
        resp = fetch(API_URL, params=params, as_json=True, session=session)
        if not resp:
            break
        members = resp.get("query", {}).get("categorymembers", [])
        all_titles.extend([m["title"] for m in members])
        if "continue" in resp:
            params["cmcontinue"] = resp["continue"]["cmcontinue"]
        else:
            break
    return all_titles


# ══════════════════════════════════════════════════════════
#  图片提取
# ══════════════════════════════════════════════════════════

def extract_main_image_from_html(html_text, page_title, debug=False):
    """
    从wiki页面渲染HTML中提取套装海报图片。
    海报是页面上最大的非图标图片（通常 750×1333）。

    返回: 图片URL字符串（优先返回原图而非缩略图），或 None
    """
    soup = BeautifulSoup(html_text, "html.parser")

    # 收集所有图片，按尺寸评分
    scored = []
    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src") or ""
        if not src or _is_icon(src):
            continue

        # 转原图URL（如果是缩略图）
        full_url = thumbnail_to_full_url(src)

        # 估算尺寸
        width = _estimate_width(img, src)
        height = _estimate_height(img, src)

        # 海报至少 300x300
        if width < 300 or height < 300:
            continue

        scored.append((full_url, width, height))

    if debug and scored:
        print(f"    候选海报图片 ({len(scored)}):")
        for url, w, h in sorted(scored, key=lambda x: -(x[1]*x[2])):
            print(f"      {w}x{h} | {url[:100]}...")

    if not scored:
        return None

    # 选面积最大的图片作为海报
    scored.sort(key=lambda x: -(x[1] * x[2]))
    return scored[0][0]


def thumbnail_to_full_url(url):
    """
    将 MediaWiki 缩略图URL转为原图URL。

    缩略图格式:
      .../thumb/<hash>/<filename>/<N>px-<filename>
      .../thumb/<hash>/<filename>/<N>px-<hash2>.png
    原图格式:
      .../<hash>/<filename>
    """
    if not url:
        return url

    # 匹配 /thumb/.../Npx- 模式
    # 例: .../thumb/a/bc/abc.png/160px-abc.png → .../a/bc/abc.png
    thumb_match = re.match(
        r'(https?://[^/]+/images/[^/]+)/thumb/([a-z0-9]/[a-z0-9]{2}/[^/]+)/\d+px-[^/]+$',
        url
    )
    if thumb_match:
        return f"{thumb_match.group(1)}/{thumb_match.group(2)}"

    return url


def _estimate_width(img, src):
    """估算图片宽度（优先从img属性，其次从缩略图URL）"""
    w = img.get("width")
    if w:
        try:
            return int(w)
        except ValueError:
            pass

    # 从缩略图URL解析: /160px-xxx.png
    m = re.search(r'/(\d+)px-', src)
    if m:
        try:
            return int(m.group(1))
        except ValueError:
            pass

    return 100  # 默认小值，会被过滤


def _estimate_height(img, src):
    """估算图片高度"""
    h = img.get("height")
    if h:
        try:
            return int(h)
        except ValueError:
            pass
    return 100  # 默认小值


def _is_icon(src):
    """判断图片URL是否是小图标/装饰图。"""
    src_lower = src.lower()
    icon_keywords = [
        "icon-", "/ico/", "icon.", "_icon", "favicon",
        ".svg",
        "/star_", "/star-", "star.",
        "/attribute_",
        "/25px-", "/30px-", "/40px-", "/50px-",
        "/20px-", "/15px-",
    ]
    return any(kw in src_lower for kw in icon_keywords)


def pick_best_image_from_list(image_files, session):
    """
    从页面图片列表中选出最可能是套装海报的图片。
    通过获取每张图的尺寸，选择最大的那张（海报通常最大）。
    """
    best_url = None
    best_size = 0

    for file_title in image_files:
        # 跳过明显不是海报的文件
        file_name = file_title.split(":")[-1] if ":" in file_title else file_title
        if _is_icon(file_name):
            continue

        # 获取图片信息（包含URL和尺寸）
        resp = fetch(
            API_URL,
            params={
                "action": "query",
                "titles": file_title,
                "prop": "imageinfo",
                "iiprop": "url|size",
                "format": "json",
            },
            as_json=True,
            session=session,
        )
        if not resp:
            continue

        pages = resp.get("query", {}).get("pages", {})
        for _pid, pdata in pages.items():
            for ii in pdata.get("imageinfo", []):
                w = ii.get("width", 0)
                h = ii.get("height", 0)
                size = w * h
                # 海报至少 200x200
                if size > best_size and w >= 200 and h >= 200:
                    best_size = size
                    best_url = ii.get("url")

    return best_url


# ══════════════════════════════════════════════════════════
#  下载与压缩
# ══════════════════════════════════════════════════════════

def sanitize_filename(name):
    """将套装名称转换为安全的文件名。"""
    name = re.sub(r'[<>:"/\\|?*]', "", name)
    name = name.strip().strip(".")
    return name if name else "unknown"


def download_and_save(image_url, outfit_name, output_dir, session=None):
    """下载图片、压缩为JPEG、保存。"""
    sanitized = sanitize_filename(outfit_name)
    filepath = output_dir / f"{sanitized}.jpg"

    s = session or requests.Session()
    for attempt in range(MAX_RETRIES):
        try:
            resp = s.get(image_url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
            resp.raise_for_status()
            img_data = resp.content
            break
        except requests.RequestException as e:
            wait = RETRY_BACKOFF[min(attempt, len(RETRY_BACKOFF) - 1)]
            if attempt < MAX_RETRIES - 1:
                print(f"    [重试 {attempt+1}/{MAX_RETRIES}] 下载失败: {e}，{wait}s后重试...")
            time.sleep(wait)
    else:
        print(f"    [失败] 下载图片失败: {image_url}")
        return None

    try:
        img = Image.open(BytesIO(img_data))
        w, h = img.size
        if w > IMAGE_MAX_WIDTH:
            ratio = IMAGE_MAX_WIDTH / w
            img = img.resize((IMAGE_MAX_WIDTH, int(h * ratio)), Image.LANCZOS)

        if img.mode in ("RGBA", "P", "LA"):
            img = img.convert("RGB")

        img.save(str(filepath), "JPEG", quality=IMAGE_QUALITY)
        actual_w, actual_h = img.size
        print(f"    [OK] {filepath.name} ({actual_w}x{actual_h})")
        return str(filepath)
    except Exception as e:
        print(f"    [失败] 图片处理出错: {e}")
        return None


# ══════════════════════════════════════════════════════════
#  页面查找策略
# ══════════════════════════════════════════════════════════

def find_outfit_page(full_name, nickname, session):
    """
    定位套装在wiki上的海报页面。

    返回: (page_title, page_data) 或 (None, None)

    仅尝试 '套装·{套装全名}' 页面（海报专用页面，包含750x1333大图）。
    如果此页面不存在，则不使用旧页面（旧页面只有472x720主裙，非海报）。
    """
    # 套装·xxx — 海报页面
    suite_page = f"套装·{full_name}"
    parsed = fetch_page_html(suite_page, session=session)
    if parsed:
        return suite_page, parsed

    return None, None


def find_poster_for_outfit(full_name, nickname, session):
    """
    为指定套装查找海报图片URL。
    优先访问 '套装·xxx' 页面，海报通常是页面上最大的图片（~750×1333）。

    返回: (image_url, page_title, method) 或 (None, None, reason)
    """
    # ── 步骤1: 定位套装页面 ──
    page_title, parsed = find_outfit_page(full_name, nickname, session)
    if not parsed:
        return None, None, "页面不存在（已尝试'套装·xxx'和直接名称）"

    html_text = parsed.get("text", {}).get("*", "")

    # ── 步骤2: 从HTML提取最大的图片（海报） ──
    if html_text:
        poster_url = extract_main_image_from_html(html_text, page_title)
        if poster_url:
            return poster_url, page_title, "选中页面最大图（海报）"

    # ── 步骤3: 回退：从API图片列表中选最大的图 ──
    images = parsed.get("images", [])
    if images:
        image_url = pick_best_image_from_list(images, session)
        if image_url:
            return image_url, page_title, "从API图片列表选最大图"

    return None, None, "未找到合适的海报图片"


def _resolve_image_url(src):
    """将图片src转为绝对URL。"""
    if not src:
        return None
    if src.startswith("//"):
        return "https:" + src
    if src.startswith("/"):
        return "https://wiki.biligame.com" + src
    if src.startswith("http"):
        return src
    if src.startswith("images/"):
        return f"{BASE_URL}/{src}"
    return None


# ══════════════════════════════════════════════════════════
#  核心流程
# ══════════════════════════════════════════════════════════

def scout_wiki():
    """
    探测wiki结构：分析图鉴页面 + 测试几个样本套装页面。
    """
    print("=" * 60)
    print("  Wiki 结构探测")
    print("=" * 60)

    session = requests.Session()

    # ── Part A: 图鉴页面分析 ──
    print(f"\n[A] 获取图鉴页面: '{GALLERY_PAGE}'")
    parsed = fetch_page_html(GALLERY_PAGE, session=session)
    if parsed:
        html_text = parsed.get("text", {}).get("*", "")
        soup = BeautifulSoup(html_text, "html.parser")

        # 基本统计
        all_imgs = soup.find_all("img")
        all_links = soup.find_all("a")
        tables = soup.select("table.wikitable, table.infobox, table.sortable")
        galleries = soup.select(".gallery, ul.gallery")

        print(f"    HTML长度: {len(html_text)} 字符")
        print(f"    <img>标签: {len(all_imgs)}")
        print(f"    <a>标签: {len(all_links)}")
        print(f"    表格: {len(tables)}")
        print(f"    画廊: {len(galleries)}")

        # 检查是否有特定模板/class
        content_area = soup.select_one(".mw-parser-output")
        if content_area:
            direct_children = [c.name for c in content_area.children if hasattr(c, 'name')]
            print(f"    内容区直接子元素类型: {direct_children[:30]}")

        # 提取所有有意义的<a>链接
        print(f"\n    页面链接样本（前20个非空链接）:")
        count = 0
        for a in all_links:
            href = a.get("href", "")
            title = a.get("title", "")
            text = a.get_text(strip=True)
            if title and not any(title.startswith(p) for p in [
                "Template:", "Category:", "File:", "Special:",
                "Help:", "Module:", "Widget:", "MediaWiki:",
            ]):
                print(f"      title='{title}' | text='{text[:40]}' | href='{href[:80]}'")
                count += 1
                if count >= 20:
                    break
    else:
        print("    [失败] 无法获取图鉴页面")

    # ── Part B: 测试样本套装页面 ──
    print(f"\n[B] 测试直接访问套装页面（用套装全名）...")
    sample_names = ["海谕遥音", "翩鸿赋雪", "圣谛恋歌", "卧月灼莲", "绒兔心语"]
    for name in sample_names:
        parsed = fetch_page_html(name, session=session)
        if parsed:
            html_text = parsed.get("text", {}).get("*", "")
            images = parsed.get("images", [])
            poster = extract_main_image_from_html(html_text, name) if html_text else None
            print(f"    [OK] '{name}' → 页面存在, {len(images)}张图片, 主图: {'找到' if poster else '未提取到'}")
        else:
            print(f"    [FAIL] '{name}' → 页面不存在")
        time.sleep(0.5)

    # ── Part C: 扫描分类中的页面 ──
    print(f"\n[C] 尝试从分类获取套装页面列表...")
    for cat in ["套装", "套装图鉴", "服饰", "时装"]:
        titles = fetch_all_page_titles_in_category(cat, session=session)
        if titles:
            print(f"    分类 '{cat}': {len(titles)} 个页面")
            print(f"      样本: {titles[:10]}")
        else:
            print(f"    分类 '{cat}': 空或不存在")
        time.sleep(0.5)

    print(f"\n探测完成。")


def download_posters(outfit_names=None, output_dir=None, skip_existing=True):
    """
    批量下载套装海报。

    参数:
        outfit_names: [(全名, 昵称, 来源文件), ...] 或 None=加载全部
        output_dir: 输出目录
        skip_existing: 跳过已存在的文件
    """
    if output_dir is None:
        output_dir = POSTERS_DIR
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    if outfit_names is None:
        outfit_names = load_outfit_names()

    print("=" * 60)
    print(f"  套装海报批量下载")
    print(f"  共计 {len(outfit_names)} 套")
    print(f"  输出目录: {output_dir}")
    print(f"  请求间隔: {REQUEST_DELAY}s")
    print("=" * 60)

    session = requests.Session()
    results = {"success": [], "failed": [], "skipped": [], "total": len(outfit_names)}

    for i, (full_name, nickname, src_file) in enumerate(outfit_names):
        label = f"[{i+1}/{len(outfit_names)}] {full_name}"
        # 跳过已存在的文件
        sanitized = sanitize_filename(full_name)
        existing = output_dir / f"{sanitized}.jpg"
        if skip_existing and existing.exists():
            print(f"\n{label} → 跳过（已存在）")
            results["skipped"].append(full_name)
            continue

        print(f"\n{label}")

        # 查找海报
        image_url, page_title, method = find_poster_for_outfit(full_name, nickname, session)

        if not image_url:
            print(f"    [FAIL] {method}")
            results["failed"].append({
                "name": full_name,
                "nickname": nickname,
                "reason": method,
            })
            time.sleep(REQUEST_DELAY)
            continue

        print(f"    来源: {page_title} ({method})")
        print(f"    URL: {image_url[:100]}...")

        # 下载并保存
        saved_path = download_and_save(image_url, full_name, output_dir, session=session)

        if saved_path:
            results["success"].append({
                "name": full_name,
                "nickname": nickname,
                "file": os.path.basename(saved_path),
                "page": page_title,
                "method": method,
            })
        else:
            results["failed"].append({
                "name": full_name,
                "nickname": nickname,
                "reason": "图片下载或处理失败",
            })

        time.sleep(REQUEST_DELAY)

    # ── 报告 ──
    print_summary(results, output_dir)
    return results


def print_summary(results, output_dir):
    """打印下载汇总并保存JSON报告。"""
    n_success = len(results["success"])
    n_failed = len(results["failed"])
    n_skipped = len(results.get("skipped", []))
    n_total = results["total"]

    report_path = output_dir / "download_report.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 60)
    print(f"  下载完成!")
    print(f"  成功: {n_success} | 失败: {n_failed} | 跳过: {n_skipped} | 总计: {n_total}")
    print(f"  报告: {report_path}")
    print("=" * 60)

    if results["success"]:
        print(f"\n  成功列表:")
        for item in results["success"]:
            print(f"    [OK] {item['name']} ← {item.get('method', '?')}")

    if results["failed"]:
        print(f"\n  失败列表:")
        for item in results["failed"]:
            print(f"    [FAIL] {item['name']} — {item['reason']}")


# ══════════════════════════════════════════════════════════
#  命令行入口
# ══════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="以闪亮之名 BWIKI 套装海报爬虫",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python scrape_posters.py                          # 下载全部84套
  python scrape_posters.py --scout                  # 探测wiki结构+测试样本
  python scrape_posters.py --test                   # 仅下载前3套用于验证
  python scrape_posters.py --names "海谕遥音,翩鸿赋雪" # 下载指定套装
  python scrape_posters.py --no-skip                # 强制重新下载（覆盖已有）
        """,
    )
    parser.add_argument("--scout", action="store_true",
                        help="探测wiki页面结构+测试样本页，不下载")
    parser.add_argument("--test", action="store_true",
                        help="仅下载前3套用于验证流程")
    parser.add_argument("--names", type=str, default=None,
                        help="要下载的套装全名，逗号分隔（默认：从JSON加载全部）")
    parser.add_argument("--output", type=str, default=None,
                        help=f"输出目录（默认: {POSTERS_DIR}）")
    parser.add_argument("--no-skip", action="store_true",
                        help="强制重新下载，不跳过已存在的文件")
    args = parser.parse_args()

    # ── 探测模式 ──
    if args.scout:
        scout_wiki()
        return

    # ── 准备套装列表 ──
    if args.names:
        name_list = [n.strip() for n in args.names.split(",") if n.strip()]
        outfits = [(name, "", "手动指定") for name in name_list]
    else:
        outfits = load_outfit_names()
        if not outfits:
            print("[错误] 未加载到任何套装数据，请检查JSON文件")
            sys.exit(1)
        print(f"从JSON加载了 {len(outfits)} 套套装")

    # ── 测试模式：只取前3套 ──
    if args.test:
        outfits = outfits[:3]
        print(f"测试模式: 仅处理前 {len(outfits)} 套")

    output_dir = Path(args.output) if args.output else POSTERS_DIR
    download_posters(outfits, output_dir, skip_existing=not args.no_skip)


if __name__ == "__main__":
    main()
