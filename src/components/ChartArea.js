import { createChart, CandlestickSeries, LineSeries, AreaSeries, HistogramSeries } from 'lightweight-charts';
import { AppState } from '../main.js';
import { generateMockData } from '../utils/mockData.js';
import { calculateSMA, calculateBollingerBands, calculateRSI, calculateMACD, calculateVolume } from '../utils/indicators.js';

let chart, candlestickSeries, lineSeries, areaSeries, volumeSeries;
let currentChartType = 'candlestick';

export function renderChartArea() {
  return `
    <main class="relative bg-[#0d1117]">
      <div id="chart-container" class="w-full h-full"></div>
      
      <!-- Floating Legend -->
      <div class="absolute top-4 left-4 bg-[#161b22]/90 backdrop-blur-sm border border-[#30363d] rounded-lg px-3 py-2 flex items-center gap-4 z-10">
        <div class="flex items-center gap-2">
          <span class="text-[#f0f6fc] font-semibold text-sm" id="legendSymbol">BTCUSD</span>
          <span class="text-[#8b949e] text-xs">·</span>
          <span class="text-[#8b949e] text-xs" id="legendTimeframe">4H</span>
        </div>
        <div class="flex items-center gap-3 text-xs">
          <span class="text-[#8b949e]">O <span class="text-[#3fb950] font-mono" id="legendOpen">-</span></span>
          <span class="text-[#8b949e]">H <span class="text-[#3fb950] font-mono" id="legendHigh
