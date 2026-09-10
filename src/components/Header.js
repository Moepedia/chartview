import { icon } from '../utils/icons.js';

export function renderHeader() {
  return `
    <header class="bg-[#161b22] border-b border-[#30363d] flex items-center px-4 gap-3">
      
      <!-- Logo -->
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 bg-[#00d4ff] rounded flex items-center justify-center">
          ${icon('trending-up', 'w-4 h-4 text-[#0d1117]')}
        </div>
        <span class="font-semibold text-[#f0f6fc] text-sm tracking-tight">Nebolus</span>
      </div>
      
      <div class="w-px h-6 bg-[#30363d]"></div>
      
      <!-- Symbol Search -->
      <div class="relative">
        <div class="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]">
          ${icon('search', 'w-4 h-4')}
        </div>
        <input 
          type="text" 
          id="symbolSearch"
          placeholder="Search symbol..."
          class="w-60 bg-[#0d1117] border border-[#30363d] rounded-md pl-9 pr-3 py-1.5 text-sm text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#00d4ff] transition-all"
        >
      </div>
      
      <!-- Timeframe Pills -->
      <div class="flex items-center gap-0.5 bg-[#0d1117] rounded-md p-1 border border-[#30363d]">
        ${['1', '5', '15', '60', '240', 'D'].map(tf => {
          const label = tf === '60' ? '1H' : tf === '240' ? '4H' : tf === 'D' ? '1D' : tf + 'm';
          const isActive = tf === '240';
          return `
            <button 
              class="tf-btn px-3 py-1 text-xs font-medium rounded transition-all ${
                isActive 
                  ? 'bg-[#00d4ff]/20 text-[#f0f6fc] border border-[#00d4ff]/30' 
                  : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]'
              }" 
              data-tf="${tf}"
            >${label}</button>
          `;
        }).join('')}
      </div>
      
      <!-- Chart Type -->
      <div class="flex items-center gap-0.5 bg-[#0d1117] rounded-md p-1 border border-[#30363d]">
        <button class="chart-type-btn p-1.5 rounded bg-[#21262d] text-[#00d4ff] transition-all" data-type="candlestick" title="Candlestick">
          ${icon('candlestick-chart', 'w-4 h-4')}
        </button>
        <button class="chart-type-btn p-1.5 rounded text-[#8b949e] hover:text-[#f0f6fc] transition-all" data-type="line" title="Line">
          ${icon('line-chart', 'w-4 h-4')}
        </button>
        <button class="chart-type-btn p-1.5 rounded text-[#8b949e] hover:text-[#f0f6fc] transition-all" data-type="area" title="Area">
          ${icon('area-chart', 'w-4 h-4')}
        </button>
      </div>
      
      <div class="flex-1"></div>
      
      <!-- Actions -->
      <button id="compareBtn" class="p-2 rounded-md hover:bg-[#21262d] transition-all" title="Compare">
        ${icon('git-compare', 'w-4 h-4 text-[#8b949e]')}
      </button>
      <button id="alertBtn" class="p-2 rounded-md hover:bg-[#21262d] transition-all" title="Alerts">
        ${icon('bell', 'w-4 h-4 text-[#8b949e]')}
      </button>
      <button id="settingsBtn" class="p-2 rounded-md hover:bg-[#21262d] transition-all" title="Settings">
        ${icon('settings', 'w-4 h-4 text-[#8b949e]')}
      </button>
    </header>
  `;
}
