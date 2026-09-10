// ==================== SYMBOL DATABASE (40+ PAIRS) ====================
const SYMBOLS = {
    'BTCUSD': { name: 'Bitcoin', basePrice: 45000, color: '#f7931a', category: 'Crypto' },
    'ETHUSD': { name: 'Ethereum', basePrice: 3000, color: '#627eea', category: 'Crypto' },
    'SOLUSD': { name: 'Solana', basePrice: 100, color: '#14f195', category: 'Crypto' },
    'BNBUSD': { name: 'Binance Coin', basePrice: 300, color: '#f0b90b', category: 'Crypto' },
    'XRPUSD': { name: 'Ripple', basePrice: 0.6, color: '#23292f', category: 'Crypto' },
    'ADAUSD': { name: 'Cardano', basePrice: 0.5, color: '#0033ad', category: 'Crypto' },
    'DOGEUSD': { name: 'Dogecoin', basePrice: 0.08, color: '#c2a633', category: 'Crypto' },
    'AVAXUSD': { name: 'Avalanche', basePrice: 35, color: '#e84142', category: 'Crypto' },
    'DOTUSD': { name: 'Polkadot', basePrice: 7, color: '#e6007a', category: 'Crypto' },
    'MATICUSD': { name: 'Polygon', basePrice: 0.8, color: '#8247e5', category: 'Crypto' },
    'LINKUSD': { name: 'Chainlink', basePrice: 15, color: '#2a5ada', category: 'Crypto' },
    'LTCUSD': { name: 'Litecoin', basePrice: 80, color: '#345d9d', category: 'Crypto' },
    'XAUUSD': { name: 'Gold', basePrice: 2000, color: '#ffd700', category: 'Commodity' },
    'XAGUSD': { name: 'Silver', basePrice: 25, color: '#c0c0c0', category: 'Commodity' },
    'WTIUSD': { name: 'Crude Oil', basePrice: 75, color: '#000000', category: 'Commodity' },
    'AAPL': { name: 'Apple Inc', basePrice: 189, color: '#0071e3', category: 'Stock' },
    'TSLA': { name: 'Tesla Inc', basePrice: 242, color: '#e82127', category: 'Stock' },
    'GOOGL': { name: 'Alphabet Inc', basePrice: 140, color: '#4285f4', category: 'Stock' },
    'MSFT': { name: 'Microsoft', basePrice: 370, color: '#00a4ef', category: 'Stock' },
    'AMZN': { name: 'Amazon', basePrice: 150, color: '#ff9900', category: 'Stock' },
    'META': { name: 'Meta Platforms', basePrice: 480, color: '#0668e1', category: 'Stock' },
    'NVDA': { name: 'NVIDIA', basePrice: 800, color: '#76b900', category: 'Stock' },
    'NFLX': { name: 'Netflix', basePrice: 600, color: '#e50914', category: 'Stock' },
    'EURUSD': { name: 'Euro / US Dollar', basePrice: 1.08, color: '#003399', category: 'Forex' },
    'GBPUSD': { name: 'Pound / US Dollar', basePrice: 1.27, color: '#cf142b', category: 'Forex' },
    'USDJPY': { name: 'US Dollar / Yen', basePrice: 150, color: '#bc002d', category: 'Forex' },
    'AUDUSD': { name: 'Aussie / US Dollar', basePrice: 0.65, color: '#00008b', category: 'Forex' },
    'USDCAD': { name: 'US Dollar / Loonie', basePrice: 1.36, color: '#ff0000', category: 'Forex' },
    'USDCHF': { name: 'US Dollar / Franc', basePrice: 0.88, color: '#ff0000', category: 'Forex' },
    'NZDUSD': { name: 'Kiwi / US Dollar', basePrice: 0.60, color: '#000000', category: 'Forex' },
    'EURGBP': { name: 'Euro / Pound', basePrice: 0.85, color: '#003399', category: 'Forex' },
    'EURJPY': { name: 'Euro / Yen', basePrice: 162, color: '#003399', category: 'Forex' },
    'GBPJPY': { name: 'Pound / Yen', basePrice: 190, color: '#cf142b', category: 'Forex' }
};

const WATCHLIST = ['BTCUSD', 'ETHUSD', 'SOLUSD', 'AAPL', 'TSLA', 'NVDA', 'EURUSD', 'XAUUSD'];

// ==================== STATE ====================
let chart, candlestickSeries, lineSeries, areaSeries, volumeSeries;
let currentSymbol = 'BTCUSD';
let currentTimeframe = '240';
let currentChartType = 'candlestick';
let allData = [];
let indicators = [];
let replayIndex = 0;
let replayInterval = null;

// ==================== INIT CHART (PASTI JALAN) ====================
function initChart() {
    const container = document.getElementById('chart-container');
    if (!container) return;
    
    // Lightweight Charts v4 API
    chart = LightweightCharts.createChart(container, {
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
            vertLine: { color: '#00d4ff', width: 1, style: 2, labelBackgroundColor: '#00d4ff' },
            horzLine: { color: '#00d4ff', width: 1, style: 2, labelBackgroundColor: '#00d4ff' }
        },
        rightPriceScale: {
            borderColor: '#30363d',
            scaleMargins: { top: 0.1, bottom: 0.2 }
        },
        timeScale: {
            borderColor: '#30363d',
            timeVisible: true,
            secondsVisible: false
        }
    });
    
    // v4: addCandlestickSeries (BUKAN addSeries)
    candlestickSeries = chart.addCandlestickSeries({
        upColor: '#3fb950',
        downColor: '#f85149',
        borderDownColor: '#f85149',
        borderUpColor: '#3fb950',
        wickDownColor: '#f85149',
        wickUpColor: '#3fb950'
    });
    
    volumeSeries = chart.addHistogramSeries({
        color: '#21262d',
        priceFormat: { type: 'volume' },
        priceScaleId: ''
    });
    
    volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 }
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
    
    window.addEventListener('resize', () => {
        chart.applyOptions({
            width: container.clientWidth,
            height: container.clientHeight
        });
    });
}

// ==================== DATA GENERATION ====================
function generateMockData(symbol, timeframe, count = 500) {
    const data = [];
    const info = SYMBOLS[symbol] || { basePrice: 100 };
    let basePrice = info.basePrice;
    const now = Math.floor(Date.now() / 1000);
    const interval = getIntervalSeconds(timeframe);
    
    const seed = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + timeframe.length;
    let rand = seed;
    const seededRandom = () => {
        rand = (rand * 9301 + 49297) % 233280;
        return rand / 233280;
    };
    
    for (let i = count; i >= 0; i--) {
        const time = now - (i * interval);
        const volatility = basePrice * 0.015;
        const open = basePrice + (seededRandom() - 0.5) * volatility;
        const close = open + (seededRandom() - 0.5) * volatility;
        const high = Math.max(open, close) + seededRandom() * volatility * 0.5;
        const low = Math.min(open, close) - seededRandom() * volatility * 0.5;
        const volume = Math.floor(seededRandom() * 1000000) + 100000;
        
        data.push({ time, open, high, low, close, volume });
        basePrice = close;
    }
    
    return data;
}

function getIntervalSeconds(timeframe) {
    const map = { '1': 60, '5': 300, '15': 900, '60': 3600, '240': 14400, 'D': 86400, 'W': 604800 };
    return map[timeframe] || 14400;
}

// ==================== LOAD SYMBOL ====================
function loadSymbol(symbol) {
    symbol = symbol.toUpperCase();
    if (!SYMBOLS[symbol]) {
        SYMBOLS[symbol] = { name: symbol, basePrice: 100, color: '#00d4ff', category: 'Other' };
    }
    
    currentSymbol = symbol;
    allData = generateMockData(symbol, currentTimeframe);
    
    if (candlestickSeries) {
        candlestickSeries.setData(allData);
        
        const volumeData = allData.map(d => ({
            time: d.time,
            value: d.volume,
            color: d.close >= d.open ? '#3fb95040' : '#f8514940'
        }));
        volumeSeries.setData(volumeData);
        
        chart.timeScale().fitContent();
        
        const lastBar = allData[allData.length - 1];
        const firstBar = allData[0];
        const change = ((lastBar.close - firstBar.open) / firstBar.open * 100);
        
        document.getElementById('legendSymbol').textContent = symbol;
        document.getElementById('statusSymbol').textContent = symbol;
        document.getElementById('symbolSearch').value = symbol;
        document.getElementById('legendOpen').textContent = lastBar.open.toFixed(2);
        document.getElementById('legendHigh').textContent = lastBar.high.toFixed(2);
        document.getElementById('legendLow').textContent = lastBar.low.toFixed(2);
        document.getElementById('legendClose').textContent = lastBar.close.toFixed(2);
        
        document.getElementById('currentPrice').textContent = lastBar.close.toFixed(2);
        const changeEl = document.getElementById('priceChange');
        changeEl.textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
        changeEl.className = 'text-xs font-mono ' + (change >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]');
        
        document.getElementById('infoVolume').textContent = (lastBar.volume / 1000000).toFixed(2) + 'M';
        document.getElementById('infoHigh').textContent = lastBar.high.toFixed(2);
        document.getElementById('infoLow').textContent = lastBar.low.toFixed(2);
        document.getElementById('infoChange').textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
        document.getElementById('infoChange').className = 'font-mono ' + (change >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]');
    }
}

// ==================== INDICATORS ====================
function calculateSMA(data, period) {
    const result = [];
    for (let i = period - 1; i < data.length; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) sum += data[i - j].close;
        result.push({ time: data[i].time, value: sum / period });
    }
    return result;
}

function addIndicator(type) {
    if (!chart) return;
    
    const id = Date.now();
    const series = [];
    
    if (type === 'SMA') {
        const s = chart.addLineSeries({ color: '#00d4ff', lineWidth: 2, title: 'SMA(20)' });
        s.setData(calculateSMA(allData, 20));
        series.push(s);
    } else if (type === 'EMA') {
        const multiplier = 2 / 21;
        let ema = allData[0].close;
        const emaData = allData.map((d, i) => {
            if (i > 0) ema = (d.close - ema) * multiplier + ema;
            return { time: d.time, value: ema };
        });
        const s = chart.addLineSeries({ color: '#ff9800', lineWidth: 2, title: 'EMA(20)' });
        s.setData(emaData);
        series.push(s);
    } else if (type === 'BB') {
        const period = 20, mult = 2;
        const upper = [], middle = [], lower = [];
        for (let i = period - 1; i < allData.length; i++) {
            let sum = 0;
            for (let j = 0; j < period; j++) sum += allData[i - j].close;
            const avg = sum / period;
            let variance = 0;
            for (let j = 0; j < period; j++) variance += Math.pow(allData[i - j].close - avg, 2);
            const std = Math.sqrt(variance / period);
            middle.push({ time: allData[i].time, value: avg });
            upper.push({ time: allData[i].time, value: avg + mult * std });
            lower.push({ time: allData[i].time, value: avg - mult * std });
        }
        const su = chart.addLineSeries({ color: '#2196f3', lineWidth: 1, title: 'BB Upper' });
        const sm = chart.addLineSeries({ color: '#ff9800', lineWidth: 1, title: 'BB Middle' });
        const sl = chart.addLineSeries({ color: '#2196f3', lineWidth: 1, title: 'BB Lower' });
        su.setData(upper); sm.setData(middle); sl.setData(lower);
        series.push(su, sm, sl);
    }
    
    indicators.push({ id, type, series });
    updateIndicatorList();
}

function removeIndicator(id) {
    const idx = indicators.findIndex(i => i.id === id);
    if (idx === -1) return;
    indicators[idx].series.forEach(s => chart.removeSeries(s));
    indicators.splice(idx, 1);
    updateIndicatorList();
}

function updateIndicatorList() {
    const list = document.getElementById('indicatorList');
    const count = document.getElementById('indicatorCount');
    if (!list) return;
    
    list.innerHTML = indicators.map(ind => `
        <div class="flex items-center justify-between px-2 py-1.5 rounded-md bg-[#21262d] group">
            <div class="flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-[#00d4ff]"></div>
                <span class="text-xs text-[#f0f6fc] font-mono">${ind.type}</span>
            </div>
            <button onclick="window.removeIndicator(${ind.id})" class="text-[#8b949e] hover:text-[#f85149] opacity-0 group-hover:opacity-100">
                <i data-lucide="x" class="w-3 h-3"></i>
            </button>
        </div>
    `).join('');
    
    if (count) count.textContent = indicators.length;
    if (window.lucide) window.lucide.createIcons();
}

// ==================== WATCHLIST ====================
function renderWatchlist() {
    const container = document.getElementById('watchlistContainer');
    const count = document.getElementById('watchlistCount');
    if (!container) return;
    
    container.innerHTML = WATCHLIST.map(sym => {
        const info = SYMBOLS[sym] || { color: '#00d4ff', name: sym, basePrice: 100 };
        const seed = sym.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        const change = ((seed % 1000) / 100) - 5;
        const price = info.basePrice * (1 + change / 100);
        const color = change >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]';
        const sign = change >= 0 ? '+' : '';
        
        return `
            <div class="watchlist-item flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-[#21262d] cursor-pointer" data-symbol="${sym}">
                <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white" style="background:${info.color}">
                        ${sym.charAt(0)}
                    </div>
                    <div>
                        <div class="text-sm text-[#f0f6fc]">${sym}</div>
                        <div class="text-[10px] text-[#8b949e]">${info.name}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-sm font-mono text-[#f0f6fc]">${price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div class="text-xs font-mono ${color}">${sign}${change.toFixed(2)}%</div>
                </div>
            </div>
        `;
    }).join('');
    
    if (count) count.textContent = WATCHLIST.length;
    
    container.querySelectorAll('.watchlist-item').forEach(item => {
        item.addEventListener('click', () => loadSymbol(item.dataset.symbol));
    });
}

// ==================== SEARCH ====================
function initSearch() {
    const input = document.getElementById('symbolSearch');
    const dropdown = document.getElementById('searchDropdown');
    if (!input || !dropdown) return;
    
    input.addEventListener('input', (e) => {
        const query = e.target.value.toUpperCase().trim();
        if (!query) { dropdown.classList.add('hidden'); return; }
        
        const matches = Object.keys(SYMBOLS).filter(s => 
            s.includes(query) || SYMBOLS[s].name.toUpperCase().includes(query)
        ).slice(0, 10);
        
        if (matches.length === 0) { dropdown.classList.add('hidden'); return; }
        
        dropdown.innerHTML = matches.map(sym => {
            const info = SYMBOLS[sym];
            return `
                <div class="search-result flex items-center justify-between px-3 py-2 hover:bg-[#21262d] cursor-pointer border-b border-[#30363d] last:border-0" data-symbol="${sym}">
                    <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white" style="background:${info.color}">
                            ${sym.charAt(0)}
                        </div>
                        <div>
                            <div class="text-sm text-[#f0f6fc]">${sym}</div>
                            <div class="text-[10px] text-[#8b949e]">${info.name} · ${info.category}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        dropdown.classList.remove('hidden');
        
        dropdown.querySelectorAll('.search-result').forEach(el => {
            el.addEventListener('click', () => {
                loadSymbol(el.dataset.symbol);
                dropdown.classList.add('hidden');
                input.value = el.dataset.symbol;
            });
        });
    });
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadSymbol(e.target.value);
            dropdown.classList.add('hidden');
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });
}

// ==================== REPLAY ====================
function initReplay() {
    document.getElementById('replayStart')?.addEventListener('click', () => {
        if (replayInterval) return;
        const speed = parseInt(document.getElementById('replaySpeed').value) || 1;
        replayInterval = setInterval(() => {
            if (replayIndex >= allData.length) {
                clearInterval(replayInterval);
                replayInterval = null;
                return;
            }
            const bar = allData[replayIndex];
            if (candlestickSeries) candlestickSeries.update(bar);
            replayIndex++;
            const progress = (replayIndex / allData.length) * 100;
            document.getElementById('replayProgress').style.width = progress + '%';
        }, 1000 / speed);
    });
    
    document.getElementById('replayPause')?.addEventListener('click', () => {
        if (replayInterval) { clearInterval(replayInterval); replayInterval = null; }
    });
    
    document.getElementById('replayReset')?.addEventListener('click', () => {
        if (replayInterval) { clearInterval(replayInterval); replayInterval = null; }
        replayIndex = 0;
        document.getElementById('replayProgress').style.width = '0%';
        loadSymbol(currentSymbol);
    });
    
    document.getElementById('replayStep')?.addEventListener('click', () => {
        if (replayIndex < allData.length) {
            candlestickSeries.update(allData[replayIndex]);
            replayIndex++;
            const progress = (replayIndex / allData.length) * 100;
            document.getElementById('replayProgress').style.width = progress + '%';
        }
    });
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) window.lucide.createIcons();
    
    initChart();
    renderWatchlist();
    loadSymbol('BTCUSD');
    initSearch();
    initReplay();
    
    document.querySelectorAll('.tf-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tf-btn').forEach(b => {
                b.className = 'tf-btn px-3 py-1 text-xs font-medium rounded text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]';
            });
            btn.className = 'tf-btn px-3 py-1 text-xs font-medium rounded text-[#f0f6fc] bg-[#00d4ff]/20 border border-[#00d4ff]/30';
            currentTimeframe = btn.dataset.tf;
            document.getElementById('legendTimeframe').textContent = btn.dataset.tf === 'D' ? '1D' : btn.dataset.tf === 'W' ? '1W' : btn.dataset.tf + 'm';
            document.getElementById('statusTimeframe').textContent = btn.dataset.tf === 'D' ? '1D' : btn.dataset.tf === 'W' ? '1W' : btn.dataset.tf + 'm';
            loadSymbol(currentSymbol);
        });
    });
    
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tool-btn').forEach(b => {
                b.className = 'tool-btn w-9 h-9 flex items-center justify-center rounded-md text-[#8b949e] hover:bg-[#21262d]';
            });
            btn.className = 'tool-btn w-9 h-9 flex items-center justify-center rounded-md bg-[#00d4ff]/20 text-[#00d4ff]';
        });
    });
    
    document.getElementById('addIndicatorBtn')?.addEventListener('click', () => {
        const type = prompt('Indicator (SMA/EMA/BB):');
        if (type) addIndicator(type.toUpperCase());
    });
    
    setInterval(() => {
        const now = new Date();
        document.getElementById('statusTime').textContent = now.toLocaleTimeString('en-GB', { hour12: false, timeZone: 'UTC' });
    }, 1000);
    
    if (window.lucide) window.lucide.createIcons();
});

window.loadSymbol = loadSymbol;
window.removeIndicator = removeIndicator;
