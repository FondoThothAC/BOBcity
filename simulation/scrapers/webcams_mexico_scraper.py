# simulation/scrapers/webcams_mexico_scraper.py
# Scraper real para Webcams de México a partir de las fichas públicas del sitio.

from __future__ import annotations

import json
import os
import re
import unicodedata
from urllib.parse import urljoin
from urllib.request import Request, urlopen

from bs4 import BeautifulSoup

BASE_URL = "https://webcamsdemexico.com/"
OUT_PATH = "/Volumes/SSD1TB/plataforma/src/data/mexico_webcams.json"


def normalize_text(value: str) -> str:
    text = unicodedata.normalize("NFD", value or "")
    text = text.encode("ascii", "ignore").decode("utf-8")
    return re.sub(r"\s+", " ", text).strip().lower()


def fetch_html(url: str) -> str:
    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=20) as response:
        return response.read().decode("utf-8", errors="replace")


def extract_home_links(html: str) -> list[str]:
    soup = BeautifulSoup(html, "html.parser")
    links = []
    seen = set()
    for a in soup.select('a[href*="/webcam/"]'):
        href = a.get("href")
        if not href:
            continue
        full = urljoin(BASE_URL, href)
        if full not in seen:
            seen.add(full)
            links.append(full)
    return links


def extract_coordinates_from_text(text: str) -> tuple[float | None, float | None]:
    patterns = [
        (19.4326, -99.1332, ["zocalo", "bellas artes", "reforma", "madero", "garibaldi", "chapultepec", "iztapalapa", "tlalpan"]),
        (21.1619, -86.8515, ["cancun", "cozumel", "playa del carmen", "isla mujeres", "bacalar"]),
        (20.6534, -105.2253, ["puerto vallarta", "nuevo vallarta"]),
        (20.6597, -103.3496, ["guadalajara", "jalisco"]),
        (19.0413, -98.2062, ["puebla", "teotihuacan", "popocatepetl", "amecameca", "altzomoni", "tlamacas"]),
        (16.8531, -99.8237, ["acapulco", "ixtapa", "zihuatanejo"]),
        (25.6866, -100.3161, ["monterrey"]),
        (22.8905, -109.9167, ["cabo san lucas", "los cabos"]),
        (23.2494, -106.4111, ["mazatlan"]),
        (19.1738, -96.1342, ["veracruz", "boca del rio"]),
        (20.9137, -100.7436, ["queretaro", "bernal", "tequisquiapan", "cadereyta", "amealco", "san joaquin"]),
        (20.4230, -86.9223, ["cozumel"]),
        (21.8833, -102.2916, ["aguascalientes"]),
        (25.4383, -100.9735, ["saltillo"]),
        (24.0165, -104.5220, ["durango"]),
    ]
    hay = normalize_text(text)
    for lat, lng, keywords in patterns:
        if any(k in hay for k in keywords):
            return lat, lng
    return None, None


def parse_page(url: str) -> dict | None:
    html = fetch_html(url)
    soup = BeautifulSoup(html, "html.parser")

    ld_video = None
    for script in soup.find_all("script", type="application/ld+json"):
        raw = script.string or script.get_text(strip=True)
        if not raw:
            continue
        if '"@type": "VideoObject"' in raw or '"@type":"VideoObject"' in raw:
            try:
                ld_video = json.loads(raw)
                break
            except json.JSONDecodeError:
                continue

    h1 = soup.find("h1")
    title = (ld_video.get("name") if ld_video else None) or (h1.get_text(" ", strip=True) if h1 else None)
    description = ld_video.get("description") if ld_video else ""
    thumbnail = ld_video.get("thumbnailUrl") if ld_video else None

    embed_url = ld_video.get("embedUrl") if ld_video else None
    if not embed_url:
        match = re.search(r'https://www\.youtube\.com/embed/[^"\']+', html)
        if match:
            embed_url = match.group(0)

    iframe = soup.find("iframe")
    if iframe and iframe.get("src") and "youtube.com/embed/" in iframe.get("src"):
        embed_url = iframe.get("src")

    lat = lng = None
    latlng = extract_coordinates_from_text(" ".join([title or "", description, url]))
    lat, lng = latlng

    if not title or not embed_url:
        return None

    if embed_url.startswith("//"):
        embed_url = "https:" + embed_url

    return {
        "id": re.sub(r"[^a-z0-9]+", "-", normalize_text(url)).strip("-"),
        "name": title,
        "lat": lat,
        "lng": lng,
        "stream_url": embed_url,
        "embed_url": embed_url,
        "thumbnail_url": thumbnail,
        "status": "live",
        "source": "Webcams de México",
        "viewers": 0,
        "page_url": url,
    }


def main():
    home_html = fetch_html(BASE_URL)
    links = extract_home_links(home_html)
    cams = []
    seen = set()

    for link in links:
        try:
            cam = parse_page(link)
            if not cam:
                continue
            key = cam["stream_url"]
            if key in seen:
                continue
            seen.add(key)
            cams.append(cam)
            print(f"[ok] {cam['name']}")
        except Exception as exc:
            print(f"[skip] {link}: {exc}")

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(cams, f, indent=2, ensure_ascii=False)

    print(f"[done] saved {len(cams)} cameras -> {OUT_PATH}")


if __name__ == "__main__":
    main()
