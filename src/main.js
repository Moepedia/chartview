import { createChart, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';

// ==================== INIT LUCIDE ICONS ====================
lucide.createIcons();

// ==================== OAKVIEW INIT (WAJIB) ====================
const oakChart = document.getElementById('chart');
let chart, candlestickSeries, volumeSeries;
let currentSymbol = 'BTCUSD';
let currentTimeframe = '240';
let allData = [];
let replayIndex = 0;
let replayInterval = null;

// Data Provider untuk OakView
class NebolusDataProvider {
    async initialize() {
        console.log('Data provider initialized');
    }
    
    async fetchHistorical(symbol, interval) {
        // Generate mock data
        return generateMockData(symbol, interval);
    }
    
    async subscribe(symbol, interval, callback) {
        // Real-time updates
        setInterval(() => {
            const lastBar = allData[allData.length - 1];
            if (lastBar) {
                const newBar = {
                    time: lastBar.time + 60,
                    open: lastBar.close,
                    high: lastBar.close + Math.random() * 100,
                    low: lastBar.close - Math.random() * 100,
                    close: lastBar.close + (Math.random() - 0.5) * 200,
                    volume: Math.floor(Math.random() * 1000000)
                };
                callback(newBar);
            }
        }, 1000);
    }
}

// ==================== DATA GENERATION ====================
function generateMockData(symbol, timeframe, count = 500) {
    const data = [];
    let basePrice = symbol.includes('BTC') ? 45000 : symbol.includes('ETH') ? 3000 : 150;
    const now = Math.floor(Date.now() / 1000);
    const interval = getIntervalSeconds(timeframe);
    
    for (let i = count; i >= 0; i--) {
        const time = now - (i * interval);
        const volatility = basePrice * 0.02;
        const open = basePrice + (Math.random() - 0.5) * volatility;
        const close = open + (Math.random() - 0.5) * volatility;
        const high = Math.max(open, close) + Math.random() * volatility * 0.5;
        const low = Math.min(open, close) - Math.random() * volatility * 0.5;
        
        data.push({ time, open, high, low, close });
        basePrice = close;
    }
    
    return data;
}

function getIntervalSeconds(timeframe) {
    const map = { '1': 60, '5': 300, '15': 900, '60': 3600, '240': 14400, 'D': 86400 };
    return map[timeframe] || 14400;
}

// ==================== FALLBACK CHART (jika OakView gagal load) ====================
function initFallbackChart() {
    const container = document.getElementById('chart');
    container.innerHTML = '';
    
    chart = createChart(container, {
        width: container.clientWidth,
        height: container.clientHeight,
        layout: {
            background: { color: '#0d1117' },
            textColor: '#8b949e',
            fontFamily: 'JetBrains Mono',
        },
        grid: {
            vertLines: { color: '#21262d' },
            horzLines: { color: '#21262d' },
        },
        crosshair: {
            mode: 1,
            vertLine: { color: '#00d4ff', width: 1, style: 2 },
            horzLine: { color: '#00d4ff', width: 1, style: 2 },
        },
        rightPriceScale: {
            borderColor: '#30363d',
        },
        timeScale: {
            borderColor: '#30363d',
            timeVisible: true,
            secondsVisible: false,
        },
    });
    
    candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#3fb950',
        downColor: '#f85149',
        borderDownColor: '#f85149',
        borderUpColor: '#3fb950',
        wickDownColor: '#f85149',
        wickUpColor: '#3fb950',
    });
    
    volumeSeries = chart.addSeries(HistogramSeries, {
        color: '#21262d',
        priceFormat: { type: 'volume' },
        priceScaleId: '',
    });
    
    volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
    });
    
    window.addEventListener('resize', () => {
        chart.applyOptions({
            width: container.clientWidth,
            height: container.clientHeight,
        });
    });
}

// ==================== LOAD SYMBOL ====================
function loadSymbol(symbol) {
    currentSymbol = symbol.toUpperCase();
    document.getElementById('statusSymbol').textContent = currentSymbol;
    document.getElementById('legendSymbol').textContent = currentSymbol;
    document.getElementById('symbolSearch').value = currentSymbol;
    
    allData = generateMockData(currentSymbol, currentTimeframe);
    
    if (candlestickSeries) {
        candlestickSeries.setData(allData);
        const volumeData = allData.map(d => ({
            time: d.time,
            value: Math.floor(Math.random() * 1000000) + 100000,
            color: d.close >= d.open ? '#3fb95033' : '#f8514933'
        }));
        volumeSeries.setData(volumeData);
        
        // Update legend
        const lastBar = allData[allData.length - 1];
        document.getElementById('legendOpen').textContent = lastBar.open.toFixed(2);
        document.getElementById('legendHigh').textContent = lastBar.high.toFixed(2);
        document.getElementById('legendLow').textContent = lastBar.low.toFixed(2);
        document.getElementById('legendClose').textContent = lastBar.close.toFixed(2);
    }
}

// ==================== REPLAY CONTROLLER ====================
function initReplay() {
    document.getElementById('replayStart').addEventListener('click', () => {
        if (replayInterval) return;
        
        const speed = parseInt(document.getElementById('replaySpeed').value);
        document.getElementById('replayStart').classList.add('bg-[#00d4ff]/20', 'text-[#00d4ff]');
        
        replayInterval = setInterval(() => {
            if (replayIndex >= allData.length) {
                clearInterval(replayInterval);
                replayInterval = null;
                return;
            }
            
            const bar = allData[replayIndex];
            if (candlestickSeries) {
                candlestickSeries.update(bar);
            }
            
            // Update progress
            const progress = (replayIndex / allData.length) * 100;
            document.getElementById('replayProgress').style.width = progress + '%';
            
            replayIndex++;
        }, 1000 / speed);
    });
    
    document.getElementById('replayPause').addEventListener('click', () => {
        if (replayInterval) {
            clearInterval(replayInterval);
            replayInterval = null;
        }
    });
    
    document.getElementById('replayReset').addEventListener('click', () => {
        if (replayInterval) {
            clearInterval(replayInterval);
            replayInterval = null;
        }
        replayIndex = 0;
        document.getElementById('replayProgress').style.width = '0%';
        loadSymbol(currentSymbol);
    });
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
    // Init fallback chart
    initFallbackChart();
    loadSymbol('BTCUSD');
    initReplay();
    
    // Symbol search
    document.getElementById('symbolSearch').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadSymbol(e.target.value);
        }
    });
    
    // Timeframe buttons
    document.querySelectorAll('.tf-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tf-btn').forEach(b => {
                b.classList.remove('bg-[#00d4ff]/20', 'text-[#f0f6fc]', 'border', 'border-[#00d4ff]/30');
                b.classList.add('text-[#8b949e]');
            });
            btn.classList.add('bg-[#00d4ff]/20', 'text-[#f0f6fc]', 'border', 'border-[#00d4ff]/30');
            btn.classList.remove('text-[#8b949e]');
            
            currentTimeframe = btn.dataset.tf;
            document.getElementById('statusTimeframe').textContent = 
                currentTimeframe === 'D' ? '1D' : currentTimeframe + 'm';
            loadSymbol(currentSymbol);
        });
    });
    
    // Tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tool-btn').forEach(b => {
                b.classList.remove('bg-[#00d4ff]/20', 'text-[#00d4ff]');
                b.classList.add('text-[#8b949e]');
            });
            btn.classList.add('bg-[#00d4ff]/20', 'text-[#00d4ff]');
            btn.classList.remove('text-[#8b949e]');
        });
    });
    
    // Watchlist
    document.querySelectorAll('.watchlist-item').forEach(item => {
        item.addEventListener('click', () => {
            loadSymbol(item.dataset.symbol);
        });
    });
    
    // Clock
    setInterval(() => {
        const now = new Date();
        document.getElementById('statusTime').textContent = now.toLocaleTimeString('id-ID');
    }, 1000);
});

// Export
window.loadSymbol = loadSymbol;
