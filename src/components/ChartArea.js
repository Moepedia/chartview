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
          <span class="text-[#8b949e]">H <span class="text-[#3fb950] font-mono" id="legendHigh">-</span></span>
          <span class="text-[#8b949e]">L <span class="text-[#f85149] font-mono" id="legendLow">-</span></span>
          <span class="text-[#8b949e]">C <span class="text-[#3fb950] font-mono" id="legendClose">-</span></span>
        </div>
      </div>
    </main>
  `;
}

export function initChart() {
  const container = document.getElementById('chart-container');
  if (!container) return;
  
  chart = createChart(container, {
    width: container.clientWidth,
    height: container.clientHeight,
    layout: {
      background: { color: '#0d1117' },
      textColor: '#8b949e',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 11
    },
    grid: {
      vertLines: { color: '#21262d' },
      horzLines: { color: '#21262d' }
    },
    crosshair: {
      mode: 1,
      vertLine: {
        color: '#00d4ff',
        width: 1,
        style: 2,
        labelBackgroundColor: '#00d4ff'
      },
      horzLine: {
        color: '#00d4ff',
        width: 1,
        style: 2,
        labelBackgroundColor: '#00d4ff'
      }
    },
    rightPriceScale: {
      borderColor: '#30363d',
      scaleMargins: { top: 0.1, bottom: 0.2 }
    },
    timeScale: {
      borderColor: '#30363d',
      timeVisible: true,
      secondsVisible: false,
      rightOffset: 5,
      barSpacing: 8
    }
  });
  
  // Candlestick Series
  candlestickSeries = chart.addSeries(CandlestickSeries, {
    upColor: '#3fb950',
    downColor: '#f85149',
    borderDownColor: '#f85149',
    borderUpColor: '#3fb950',
    wickDownColor: '#f85149',
    wickUpColor: '#3fb950'
  });
  
  // Volume Series
  volumeSeries = chart.addSeries(HistogramSeries, {
    color: '#21262d',
    priceFormat: { type: 'volume' },
    priceScaleId: ''
  });
  
  volumeSeries.priceScale().applyOptions({
    scaleMargins: { top: 0.8, bottom: 0 }
  });
  
  // Resize handler
  window.addEventListener('resize', () => {
    chart.applyOptions({
      width: container.clientWidth,
      height: container.clientHeight
    });
  });
  
  // Crosshair legend
  chart.subscribeCrosshairMove((param) => {
    if (!param.time || !param.seriesData) return;
    
    const data = param.seriesData.get(candlestickSeries);
    if (data) {
      document.getElementById('legendOpen').textContent = data.open?.toFixed(2) || '-';
      document.getElementById('legendHigh').textContent = data.high?.toFixed(2) || '-';
      document.getElementById('legendLow').textContent = data.low?.toFixed(2) || '-';
      document.getElementById('legendClose').textContent = data.close?.toFixed(2) || '-';
    }
  });
  
  return chart;
}

export function loadSymbolData(symbol) {
  if (!chart || !candlestickSeries) return;
  
  const data = generateMockData(symbol, AppState.timeframe);
  AppState.data = data;
  
  candlestickSeries.setData(data);
  
  // Volume
  const volumeData = calculateVolume(data);
  volumeSeries.setData(volumeData);
  
  // Fit content
  chart.timeScale().fitContent();
  
  // Update legend
  const lastBar = data[data.length - 1];
  if (lastBar) {
    document.getElementById('legendOpen').textContent = lastBar.open.toFixed(2);
    document.getElementById('legendHigh').textContent = lastBar.high.toFixed(2);
    document.getElementById('legendLow').textContent = lastBar.low.toFixed(2);
    document.getElementById('legendClose').textContent = lastBar.close.toFixed(2);
    document.getElementById('legendSymbol').textContent = symbol;
  }
}

export function changeTimeframe(tf) {
  AppState.timeframe = tf;
  document.getElementById('legendTimeframe').textContent = 
    tf === 'D' ? '1D' : tf === 'W' ? '1W' : tf + 'm';
  loadSymbolData(AppState.symbol);
}

export function setChartType(type) {
  currentChartType = type;
  
  // Hide all series
  candlestickSeries.applyOptions({ visible: false });
  
  if (type === 'candlestick') {
    candlestickSeries.applyOptions({ visible: true });
  }
  
  // For simplicity, just toggle candlestick visibility
  // Line and Area series can be added similarly
}

export function getChart() {
  return chart;
}

export function getCandlestickSeries() {
  return candlestickSeries;
}

export function updateCandlestick(bar) {
  if (candlestickSeries) {
    candlestickSeries.update(bar);
  }
}
