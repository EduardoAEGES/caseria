// Íconos de línea en SVG (trazo de 2px, estilo Lucide) para toda la interfaz.
// Uso: Icon("chevron-left") o Icon("search", { size: 18, cls: "text-muted" }).
// Toman el color del texto (currentColor), así que se tiñen con CSS.

const ICON_PATHS = {
  "chevron-left":  `<path d="m15 18-6-6 6-6"/>`,
  "chevron-right": `<path d="m9 18 6-6-6-6"/>`,
  "chevron-down":  `<path d="m6 9 6 6 6-6"/>`,
  "arrow-right":   `<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>`,
  "x":             `<path d="M18 6 6 18"/><path d="m6 6 12 12"/>`,
  "check":         `<path d="M20 6 9 17l-5-5"/>`,
  "plus":          `<path d="M12 5v14"/><path d="M5 12h14"/>`,
  "minus":         `<path d="M5 12h14"/>`,
  "search":        `<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>`,
  "home":          `<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>`,
  "grid":          `<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>`,
  "list":          `<path d="M9 6h11"/><path d="M9 12h11"/><path d="M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>`,
  "chart":         `<path d="M3 3v18h18"/><path d="M8 17v-5"/><path d="M13 17V8"/><path d="M18 17v-9"/>`,
  "user":          `<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>`,
  "map-pin":       `<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/>`,
  "map":           `<path d="m9 4-6 2.5v14L9 18l6 2.5 6-2.5v-14L15 6.5 9 4Z"/><path d="M9 4v14"/><path d="M15 6.5v14"/>`,
  "navigation":    `<path d="m3 11 19-9-9 19-2-8-8-2Z"/>`,
  "walk":          `<circle cx="13" cy="4" r="2"/><path d="m9 21 3-7 3 3v4"/><path d="m7 12 3-4 4 1 2 4 3 1"/>`,
  "bus":           `<rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16"/><path d="M8 3v8"/><path d="M16 3v8"/><path d="M6 18v2"/><path d="M18 18v2"/><circle cx="8" cy="14.5" r=".8"/><circle cx="16" cy="14.5" r=".8"/>`,
  "car":           `<path d="M5 17h14"/><path d="M3 17v-4l2-5a2 2 0 0 1 1.9-1.4h10.2A2 2 0 0 1 19 8l2 5v4"/><path d="M3 13h18"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>`,
  "crosshair":     `<circle cx="12" cy="12" r="8"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/><circle cx="12" cy="12" r="2"/>`,
  "external":      `<path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>`,
  "cart":          `<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.4a1 1 0 0 0 1 .8h9.7a1 1 0 0 0 1-.8L21 7H6"/>`,
  "tag":           `<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.2"/>`,
  "store":         `<path d="M3 9 4.5 4h15L21 9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v8h14v-8"/><path d="M10 20v-5h4v5"/>`,
  "trophy":        `<path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M17 5h3v2a3 3 0 0 1-3 3"/><path d="M7 5H4v2a3 3 0 0 0 3 3"/>`,
  "wallet":        `<path d="M19 7V5a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V6"/><path d="M17 14h.01"/>`,
  "star":          `<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3Z"/>`,
  "crown":         `<path d="m3 7 4.5 4L12 4l4.5 7L21 7l-2 12H5L3 7Z"/>`,
  "sparkles":      `<path d="M10 3.5 11.6 8a2 2 0 0 0 1.3 1.3L17.5 11l-4.6 1.6a2 2 0 0 0-1.3 1.3L10 18.5l-1.6-4.6a2 2 0 0 0-1.3-1.3L2.5 11l4.6-1.6A2 2 0 0 0 8.4 8L10 3.5Z"/><path d="M19 3v4"/><path d="M21 5h-4"/><path d="M18 17v3"/><path d="M19.5 18.5h-3"/>`,
  "info":          `<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>`,
  "alert":         `<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>`,
  "camera":        `<path d="M14.5 4h-5L7.5 7H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-3.5l-2-3Z"/><circle cx="12" cy="13" r="3.5"/>`,
  "lock":          `<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>`,
  "bell":          `<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>`,
  "settings":      `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>`,
  "gift":          `<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>`,
  "bot":           `<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/>`,
  "heart":         `<path d="M19.5 12.6 12 20l-7.5-7.4a4.8 4.8 0 1 1 7.5-6 4.8 4.8 0 1 1 7.5 6Z"/>`,
  "bookmark":      `<path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"/>`,
  "clock":         `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`,
  "trash":         `<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6"/>`,
  "logout":        `<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>`,
  "save":          `<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>`,
  "phone":         `<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>`,
  "percent":       `<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>`,
};

function Icon(name, { size = 20, cls = "", stroke = 2 } = {}) {
  const paths = ICON_PATHS[name];
  if (!paths) return "";
  return `<svg class="icon${cls ? ` ${cls}` : ""}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}
