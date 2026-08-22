const FRAME_HUES = [210, 198, 32, 268, 152, 8, 48, 318, 186, 24, 222, 140];

export const PROJECT_GALLERY_COUNT = 12;

export interface GalleryFrame {
  index: number;
  label: string;
  src: string;
  isPlaceholder: boolean;
}

function svgPlaceholder(slug: string, index: number, title: string): string {
  const hue = FRAME_HUES[index % FRAME_HUES.length];
  const n = String(index + 1).padStart(2, "0");
  const safeTitle = title.replace(/[^\w\s/_-]/g, "").slice(0, 42);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue},18%,14%)"/>
      <stop offset="1" stop-color="#070707"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
    </pattern>
    <clipPath id="left">
      <polygon points="0,0 1020,0 640,1000 0,1000"/>
    </clipPath>
  </defs>
  <rect width="1600" height="1000" fill="#090909"/>
  <rect width="1600" height="1000" fill="url(#g)" clip-path="url(#left)"/>
  <rect width="1600" height="1000" fill="url(#grid)"/>
  <line x1="1020" y1="0" x2="640" y2="1000" stroke="hsl(${hue},72%,54%)" stroke-width="3"/>
  <text x="72" y="110" fill="#67F57A" font-family="ui-monospace,monospace" font-size="22" letter-spacing="6">FRAME_${n}</text>
  <text x="72" y="168" fill="#e2e2e2" font-family="ui-monospace,monospace" font-size="36" font-weight="700">${safeTitle}</text>
  <text x="72" y="214" fill="#919191" font-family="ui-monospace,monospace" font-size="16" letter-spacing="4">${slug.toUpperCase()} // PLACEHOLDER_CAPTURE</text>
  <text x="72" y="940" fill="#474747" font-family="ui-monospace,monospace" font-size="14" letter-spacing="3">ARCHIVE_STILL // ${n}/12</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function buildProjectGallery(
  slug: string,
  name: string,
  cover?: string,
): GalleryFrame[] {
  return Array.from({ length: PROJECT_GALLERY_COUNT }, (_, index) => {
    const useCover = index === 0 && Boolean(cover);
    return {
      index,
      label: `FRAME_${String(index + 1).padStart(2, "0")}`,
      src: useCover ? cover! : svgPlaceholder(slug, index, name),
      isPlaceholder: !useCover,
    };
  });
}
