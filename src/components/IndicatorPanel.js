import { AppState } from '../main.js';
import { icon } from '../utils/icons.js';
import { getChart } from './ChartArea.js';
import { 
  calculateSMA, 
  calculateBollingerBands, 
  calculateRSI, 
  calculateMACD 
} from '../utils/indicators.js';

export function renderIndicatorPanel() {
  return `
    <div class="border-b border-[#30363d]">
      <div class="flex items-center justify-between px-3 py-2">
        <span class="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Indicators</span>
        <span class="text-xs text-[#8b949e] font-mono" id="indicatorCount">0</span>
      </div>
      <div class="px-2 pb-2 space-y-1" id="indicatorList"></div>
      <div class="px-2 pb-2">
        <button id="addIndicatorBtn" class="w-full flex items-center justify-center gap-2 py-2 rounded-md border border-dashed border-[#30363d] text-[#8b949e] hover:border-[#00d4ff] hover:text-[#00d4ff] transition-all text-xs">
          ${icon('plus', 'w-3 h-3')}
          Add Indicator
        </button>
      </div>
    </div>
    
    <!-- Indicator Modal -->
    <div id="indicatorModal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div class="bg-[#161b22] border border-[#30363d] rounded-lg w-96 max-h-[80vh] overflow-y-auto">
        <div class="flex items-center justify-between p-4 border-b border-[#30363d]">
          <h3 class="text-sm font-semibold text-[#f0f6fc]">Add Indicator</h3>
          <button id="closeIndicatorModal" class="text-[#8b949e] hover:text-[#f0f6fc] transition-all">
            ${icon('x', 'w-4 h-4')}
          </button>
        </div>
        <div class="p-4 space-y-2">
          <div class="text-xs text-[#8b949e] uppercase tracking-wider mb-2">Trend</div>
          <div class="indicator-option flex items-center justify-between p-2 rounded-md hover:bg-[#21262d] cursor-pointer transition-all" data-indicator="SMA">
            <span class="text-sm text-[#f0f6fc]">Simple Moving Average</span>
            <span class="text-xs text-[#8b949e] font-mono">SMA(20)</span>
          </div>
          <div class="indicator-option flex items-center justify-between p-2 rounded-md hover:bg-[#21262d] cursor-pointer transition-all" data-indicator="EMA">
            <span class="text-sm text-[#f0f6fc]">Exponential Moving Average</span>
            <span class="text-xs text-[#8b949e] font-mono">EMA(20)</span>
          </div>
          <div class="indicator-option flex items-center justify-between p-2 rounded-md hover:bg-[#21262d] cursor-pointer transition-all" data-indicator="BB">
            <span class="text-sm text-[#f0f6fc]">Bollinger Bands</span>
            <span class="text-xs text-[#8b949e] font-mono">BB(20,2)</span>
          </div>
          
          <div class="text-xs text-[#8b949e] uppercase tracking-wider mb-2 mt-4">Momentum</div>
          <div class="indicator-option flex items-center justify-between p-2 rounded-md hover:bg-[#21262d] cursor-pointer transition-all" data-indicator="RSI">
            <span class="text-sm text-[#f0f6fc]">Relative Strength Index</span>
            <span class="text-xs text-[#8b949e] font-mono">RSI(14)</span>
          </div>
          <div class="indicator-option flex items-center justify-between p-2 rounded-md hover:bg-[#21262d] cursor-pointer transition-all" data-indicator="MACD">
            <span class="text-sm text-[#f0f6fc]">MACD</span>
            <span class="text-xs text-[#8b949e] font-mono">12,26,9</span>
          </div>
          
          <div class="text-xs text-[#8b949e] uppercase tracking-wider mb-2 mt-4">Volume</div>
          <div class="indicator-option flex items-center justify-between p-2 rounded-md hover:bg-[#21262d] cursor-pointer transition-all" data-indicator="VOLUME">
            <span class="text-sm text-[#f0f6fc]">Volume</span>
            <span class="text-xs text-[#8b949e] font-mono">—</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function addIndicator(type) {
  const chart = getChart();
  if (!chart) return;
  
  const indicator = {
    id: Date.now(),
    type,
    series: null,
    params: getDefaultParams(type)
  };
  
  const data = AppState.data;
  if (!data || data.length === 0) return;
  
  let colors = { primary: '#00d4ff', secondary: '#ff9800', tertiary: '#9c27b0' };
  
  if (type === 'SMA' || type === 'EMA') {
    const series = chart.addSeries(
      type === 'SMA' ? 
        (await import('lightweight-charts')).LineSeries : 
        (await import('lightweight-charts')).LineSeries,
      {
        color: colors.primary,
        lineWidth: 2,
        title: `${type}(${indicator.params.period})`,
        priceLineVisible: false,
        lastValueVisible: true
      }
    );
    const maData = calculateSMA(data, indicator.params.period);
    series.setData(maData);
    indicator.series = series;
  }
  
  if (type === 'BB') {
    // Implementation for Bollinger Bands
  }
  
  AppState.indicators.push(indicator);
  updateIndicatorList();
}

function getDefaultParams(type) {
  const defaults = {
    'SMA': { period: 20 },
    'EMA': { period: 20 },
    'BB': { period: 20, stdDev: 2 },
    'RSI': { period: 14 },
    'MACD': { fast: 12, slow: 26, signal: 9 },
    'VOLUME': {}
  };
  return defaults[type] || {};
}

export function removeIndicator(id) {
  const index = AppState.indicators.findIndex(i => i.id === id);
  if (index === -1) return;
  
  const indicator = AppState.indicators[index];
  const chart = getChart();
  
  if (indicator.series && chart) {
    if (indicator.series.remove) {
      chart.removeSeries(indicator.series);
    } else {
      Object.values(indicator.series).forEach(s => {
        if (s && chart) chart.removeSeries(s);
      });
    }
  }
  
  AppState.indicators.splice(index, 1);
  updateIndicatorList();
}

function updateIndicatorList() {
  const list = document.getElementById('indicatorList');
  const count = document.getElementById('indicatorCount');
  if (!list) return;
  
  list.innerHTML = AppState.indicators.map(ind => `
    <div class="flex items-center justify-between px-2 py-1.5 rounded-md bg-[#21262d] group">
      <div class="flex items-center gap-2">
        <div class="w-1.5 h-1.5 rounded-full bg-[#00d4ff]"></div>
        <span class="text-xs text-[#f0f6fc] font-mono">${ind.type}${ind.params.period ? `(${ind.params.period})` : ''}</span>
      </div>
      <button 
        class="text-[#8b949e] hover:text-[#f85149] opacity-0 group-hover:opacity-100 transition-all"
        onclick="window.removeIndicator(${ind.id})"
      >
        ${icon('x', 'w-3 h-3')}
      </button>
    </div>
  `).join('');
  
  if (count) count.textContent = AppState.indicators.length;
}

export function getIndicators() {
  return AppState.indicators;
}

// Expose globally
window.removeIndicator = removeIndicator;
