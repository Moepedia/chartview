// Icon utilities - menggunakan Lucide
export function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

export function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Icon component helper
export function icon(name, className = 'w-4 h-4') {
  return `<i data-lucide="${name}" class="${className}"></i>`;
}
