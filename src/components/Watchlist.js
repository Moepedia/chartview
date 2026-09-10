import { AppState } from '../main.js';
import { icon } from '../utils/icons.js';

export function renderWatchlist() {
  return `
    <div class="border-b border-[#30363d]">
      <div class="flex items-center justify-between px-3 py-2">
        <span class="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Watchlist</span>
        <button id="addWatchlistBtn" class="text-[#8b949e] hover:text-[#00d4ff] transition-all">
          ${icon('plus', 'w-3 h-3')}
        </button>
      </div>
      <div class="px-2 pb-2 space-y-0.5" id="watchlistContainer">
        ${AppState.watchlist.map(item => renderWatchlistItem(item)).join('')}
      </div>
    </div>
  `;
}

function renderWatchlistItem(item) {
  const isPositive = item.change >= 0;
  const changeColor = isPositive ? 'text-[#3fb950]' : 'text-[#f85149]';
  const changeSign = isPositive ? '+' : '';
  
  return `
    <div 
      class="watchlist-item flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-[#21262d] cursor-pointer transition-all" 
      data-symbol="${item.symbol}"
    >
      <div class="flex items-center gap-2">
        <div 
          class="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white" 
          style="background: ${item.color}"
        >
          ${item.symbol.charAt(0)}
        </div>
        <span class="text-sm text-[#f0f6fc] font-medium">${item.symbol}</span>
      </div>
      <div class="text-right">
        <div class="text-sm font-mono text-[#f0f6fc]">${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        <div class="text-xs font-mono ${changeColor}">${changeSign}${item.change.toFixed(2)}%</div>
      </div>
    </div>
  `;
}

export function initWatchlist() {
  document.querySelectorAll('.watchlist-item').forEach(item => {
    item.addEventListener('click', () => {
      const symbol = item.dataset.symbol;
      AppState.symbol = symbol;
      window.loadSymbolData(symbol);
      
      // Update status bar
      const statusSymbol = document.getElementById('statusSymbol');
      if (statusSymbol) statusSymbol.textContent = symbol;
    });
  });
  
  document.getElementById('addWatchlistBtn')?.addEventListener('click', () => {
    const symbol = prompt('Enter symbol to add:');
    if (symbol) {
      // Add to watchlist
      AppState.watchlist.push({
        symbol: symbol.toUpperCase(),
        price: 100,
        change: 0,
        color: '#00d4ff'
      });
      // Re-render
      const container = document.getElementById('watchlistContainer');
      if (container) {
        container.innerHTML = AppState.watchlist.map(item => renderWatchlistItem(item)).join('');
        initWatchlist();
        if (window.lucide) window.lucide.createIcons();
      }
    }
  });
}
