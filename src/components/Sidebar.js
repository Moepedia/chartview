import { icon } from '../utils/icons.js';

export function renderSidebar() {
  const tools = [
    { id: 'cursor', icon: 'mouse-pointer-2', title: 'Cursor', active: true },
    { id: 'trendline', icon: 'trending-up', title: 'Trend Line' },
    { id: 'horizontal', icon: 'minus', title: 'Horizontal Line' },
    { id: 'fibonacci', icon: 'git-branch', title: 'Fibonacci Retracement' },
    { id: 'rectangle', icon: 'square', title: 'Rectangle' },
    { id: 'text', icon: 'type', title: 'Text' },
    { divider: true },
    { id: 'measure', icon: 'ruler', title: 'Measure' },
    { id: 'zoom', icon: 'zoom-in', title: 'Zoom' },
    { id: 'delete', icon: 'eraser', title: 'Delete Drawing' }
  ];
  
  return `
    <aside class="bg-[#161b22] border-r border-[#30363d] flex flex-col items-center py-2 gap-1">
      ${tools.map(tool => {
        if (tool.divider) {
          return '<div class="w-6 h-px bg-[#30363d] my-2"></div>';
        }
        return `
          <button 
            class="tool-btn w-9 h-9 flex items-center justify-center rounded-md transition-all ${
              tool.active 
                ? 'bg-[#00d4ff]/20 text-[#00d4ff]' 
                : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#f0f6fc]'
            }" 
            data-tool="${tool.id}"
            title="${tool.title}"
          >
            ${icon(tool.icon, 'w-4 h-4')}
          </button>
        `;
      }).join('')}
    </aside>
  `;
}
