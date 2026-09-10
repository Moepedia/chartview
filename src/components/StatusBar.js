import { AppState } from '../main.js';

export function renderStatusBar() {
  return `
    <footer class="bg-[#161b22] border-t border-[#30363d] flex items-center px-4 gap-3 text-xs">
      <div class="flex items-center gap-2">
        <div class="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse-dot"></div>
        <span class="text-[#8b949e]">Connected</span>
      </div>
      <div class="w-px h-3 bg-[#30363d]"></div>
      <span class="text-[#8b949e]">Latency: <span class="text-[#c9d1d9] font-mono">12ms</span></span>
      <div class="w-px h-3 bg-[#30363d]"></div>
      <span class="text-[#8b949e]">Symbol: <span class="text-[#c9d1d9] font-mono" id="statusSymbol">${AppState.symbol}</span></span>
      <div class="w-px h-3 bg-[#30363d]"></div>
      <span class="text-[#8b949e]">Timeframe: <span class="text-[#c9d1d9] font-mono" id="statusTimeframe">4H</span></span>
      <div class="w-px h-3 bg-[#30363d]"></div>
      <span class="text-[#8b949e]">Type: <span class="text-[#c9d1d9] font-mono" id="statusType">Candles</span></span>
      <div class="flex-1"></div>
      <span class="text-[#8b949e]">UTC: <span class="text-[#c9d1d9] font-mono" id="statusTime">--:--:--</span></span>
    </footer>
  `;
}

export function updateStatusBar() {
  const symbol = document.getElementById('statusSymbol');
  const timeframe = document.getElementById('statusTimeframe');
  const type = document.getElementById('statusType');
  
  if (symbol) symbol.textContent = AppState.symbol;
  if (timeframe) {
    timeframe.textContent = AppState.timeframe === 'D' ? '1D' : 
                            AppState.timeframe === 'W' ? '1W' : 
                            AppState.timeframe + 'm';
  }
  if (type) {
    type.textContent = AppState.chartType === 'candlestick' ? 'Candles' :
                       AppState.chartType === 'line' ? 'Line' : 'Area';
  }
}

export function startClock() {
  setInterval(() => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-GB', { 
      hour12: false,
      timeZone: 'UTC'
    });
    const el = document.getElementById('statusTime');
    if (el) el.textContent = timeStr;
  }, 1000);
}
