// ==================== STATE ====================
const AppState = {
    symbol: 'BTCUSD',
    timeframe: '240',
    chartType: 'candlestick',
    indicators: [],
    replayIndex: 0,
    isReplaying: false,
    data: [],
    chart: null,
    candlestickSeries: null,
    lineSeries: null,
    areaSeries: null,
    volumeSeries: null,
    indicatorSeries: []
};

// ==================== SYMBOL DATABASE (LENGKAP!) ====================
const SYMBOLS = {
    // Crypto
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
    'UNIUSD': { name: 'Uniswap', basePrice: 10, color: '#ff007a', category: 'Crypto' },
    'ATOMUSD': { name: 'Cosmos', basePrice: 10, color: '#2e3148', category: 'Crypto' },
    'LTCUSD': { name: 'Litecoin', basePrice: 80, color: '#345d9d', category: 'Crypto' },
    'XAUUSD': { name: 'Gold', basePrice: 2000, color: '#ffd700', category: 'Commodity' },
    'XAGUSD': { name: 'Silver', basePrice: 25, color: '#c0c0c0', category: 'Commodity' },
    'WTIUSD': { name: 'Crude Oil', basePrice: 75, color: '#000000', category: 'Commodity' },
    // Stocks
    'AAPL': { name: 'Apple Inc', basePrice: 189, color: '#0071e3', category: 'Stock' },
    'TSLA': { name: 'Tesla Inc', basePrice: 242, color: '#e82127', category: 'Stock' },
    'GOOGL': { name: 'Alphabet Inc', basePrice: 140, color: '#4285f4', category: 'Stock' },
    'MSFT': { name: 'Microsoft', basePrice: 370, color: '#00a4ef', category: 'Stock' },
    'AMZN': { name: 'Amazon', basePrice: 150, color: '#ff9900', category: 'Stock' },
    'META': { name: 'Meta Platforms', basePrice: 480, color: '#0668e1', category: 'Stock' },
    'NVDA': { name: 'NVIDIA', basePrice: 800, color: '#76b900', category: 'Stock' },
    'NFLX': { name: 'Netflix', basePrice: 600, color: '#e50914', category: 'Stock' },
    // Forex
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

// ==================== WATCHLIST ====================
AppState.watchlist = [
    'BTCUSD', 'ETHUSD', 'SOLUSD', 'BNBUSD',
    'AAPL', 'TSLA', 'NVDA', 'META',
    'EURUSD', 'GBPUSD', 'XAUUSD'
];

// ==================== DATA GENERATION ====================
function generateMockData(symbol, timeframe, count = 500) {
    const data = [];
    const symbolInfo = SYMBOLS[symbol] || { basePrice: 100 };
    let basePrice = symbolInfo.basePrice;
    const now = Math.floor(Date.now() / 1000);
    const interval = getIntervalSeconds(timeframe);
    
    // Seeded random for consistency
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

// ==================== CHART INIT ====================
function initChart() {
    const container = document.getElementById('chart-container');
    if (!container) return;
    
    AppState.chart = LightweightCharts.createChart(container, {
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
    
    AppState.candlestickSeries = AppState.chart.addCandlestickSeries({
        upColor: '#3fb950',
        downColor: '#f85149',
        borderDownColor: '#f85149',
        borderUpColor: '#3fb950',
        wickDownColor: '#f85149',
        wickUpColor: '#3fb950'
    });
    
    AppState.volumeSeries = AppState.chart.addHistogramSeries({
        color: '#21262d',
        priceFormat: { type: 'volume' },
        priceScaleId: ''
    });
    
    AppState.volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 }
    });
    
    // Crosshair legend
    AppState.chart.subscribeCrosshairMove((param) => {
        if (!param.time || !param.seriesData) return;
        const data = param.seriesData.get(AppState.candlestickSeries);
        if (data) {
            document.getElementById('legendOpen').textContent = data.open?.toFixed(2) || '-';
            document.getElementById('legendHigh').textContent = data.high?.toFixed(2) || '-';
            document.getElementById('legendLow').textContent = data.low?.toFixed(2) || '-';
            document.getElementById('legendClose').textContent = data.close?.toFixed(2) || '-';
        }
    });
    
    window.addEventListener('resize', () => {
        AppState.chart.applyOptions({
            width: container.clientWidth,
            height: container.clientHeight
        });
    });
}

// ==================== LOAD SYMBOL ====================
function loadSymbol(symbol) {
    symbol = symbol.toUpperCase();
    if (!SYMBOLS[symbol]) {
        // Generate generic symbol
        SYMBOLS[symbol] = { name: symbol, basePrice: 100, color: '#00d4ff', category: 'Other' };
    }
    
    AppState.symbol = symbol;
    AppState.data = generateMockData(symbol, AppState.timeframe);
    
    // Set data
    AppState.candlestickSeries.setData(AppState.data);
    
    const volumeData = AppState.data.map(d => ({
        time: d.time,
        value: d.volume,
        color: d.close >= d.open ? '#3fb95040' : '#f8514940'
    }));
    AppState.volumeSeries.setData(volumeData);
    
    // Fit
    AppState.chart.timeScale().fitContent();
    
    // Update UI
    const lastBar = AppState.data[AppState.data.length - 1];
    const firstBar = AppState.data[0];
    const change = ((lastBar.close - firstBar.open) / firstBar.open * 100);
    
    document.getElementById('legendSymbol').textContent = symbol;
    document.getElementById('statusSymbol').textContent = symbol;
    document.getElementById('symbolSearch').value = symbol;
    document.getElementById('legendOpen').textContent = lastBar.open.toFixed(2);
    document.getElementById('legendHigh').textContent = lastBar.high.toFixed(2);
    document.getElementById('legendLow').textContent = lastBar.low.toFixed(2);
    document.getElementById('legendClose').textContent = lastBar.close.toFixed(2);
    
    // Price panel
    document.getElementById('currentPrice').textContent = lastBar.close.toFixed(2);
    const changeEl = document.getElementById('priceChange');
    changeEl.textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
    changeEl.className = 'text-xs font-mono ' + (change >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]');
    
    // Market info
    document.getElementById('infoVolume').textContent = (lastBar.volume / 1000000).toFixed(2) + 'M';
    document.getElementById('infoHigh').textContent = lastBar.high.toFixed(2);
    document.getElementById('infoLow').textContent = lastBar.low.toFixed(2);
    document.getElementById('infoChange').textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
    document.getElementById('infoChange').className = 'font-mono ' + (change >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]');
    
    // Refresh indicators if any
    refreshIndicators();
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

function calculateEMA(data, period) {
    const result = [];
    const multiplier = 2 / (period + 1);
    let ema = data[0].close;
    result.push({ time: data[0].time, value: ema });
    for (let i = 1; i < data.length; i++) {
        ema = (data[i].close - ema) * multiplier + ema;
        result.push({ time: data[i].time, value: ema });
    }
    return result;
}

function calculateBB(data, period = 20, mult = 2) {
    const upper = [], middle = [], lower = [];
    for (let i = period - 1; i < data.length; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) sum += data[i - j].close;
        const avg = sum / period;
        let variance = 0;
        for (let j = 0; j < period; j++) variance += Math.pow(data[i - j].close - avg, 2);
        const std = Math.sqrt(variance / period);
        middle.push({ time: data[i].time, value: avg });
        upper.push({ time: data[i].time, value: avg + mult * std });
        lower.push({ time: data[i].time, value: avg - mult * std });
    }
    return { upper, middle, lower };
}

function addIndicator(type) {
    const chart = AppState.chart;
    const data = AppState.data;
    if (!chart || !data) return;
    
    const id = Date.now();
    const series = [];
    
    if (type === 'SMA') {
        const s = chart.addLineSeries({ color: '#00d4ff', lineWidth: 2, title: 'SMA(20)', priceLineVisible: false });
        s.setData(calculateSMA(data, 20));
        series.push(s);
    } else if (type === 'EMA') {
        const s = chart.addLineSeries({ color: '#ff9800', lineWidth: 2, title: 'EMA(20)', priceLineVisible: false });
        s.setData(calculateEMA(data, 20));
        series.push(s);
    } else if (type === 'BB') {
        const bb = calculateBB(data, 20, 2);
        const su = chart.addLineSeries({ color: '#2196f3', lineWidth: 1, title: 'BB Upper' });
        const sm = chart.addLineSeries({ color: '#ff9800', lineWidth: 1, title: 'BB Middle' });
        const sl = chart.addLineSeries({ color: '#2196f3', lineWidth: 1, title: 'BB Lower' });
        su.setData(bb.upper);
        sm.setData(bb.middle);
        sl.setData(bb.lower);
        series.push(su, sm, sl);
    } else if (type === 'RSI') {
        const s = chart.addLineSeries({ color: '#9c27b0', lineWidth: 2, title: 'RSI(14)', priceScaleId: 'rsi' });
        s.setData(calculateSMA(data, 14)); // simplified
        series.push(s);
    }
    
    AppState.indicators.push({ id, type, series });
    updateIndicatorList();
}

function removeIndicator(id) {
    const idx = AppState.indicators.findIndex(i => i.id === id);
    if (idx === -1) return;
    const ind = AppState.indicators[idx];
    ind.series.forEach(s => AppState.chart.removeSeries(s));
    AppState.indicators.splice(idx, 1);
    updateIndicatorList();
}

function refreshIndicators() {
    // Re-apply all indicators with new data
    const inds = [...AppState.indicators];
    inds.forEach(ind => removeIndicator(ind.id));
    inds.forEach(ind => addIndicator(ind.type));
}

function updateIndicatorList() {
    const list = document.getElementById('indicatorList');
    const count = document.getElementById('indicatorCount');
    if (!list) return;
    
    list.innerHTML = AppState.indicators.map(ind => `
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
    
    if (count) count.textContent = AppState.indicators.length;
    if (window.lucide) window.lucide.createIcons();
}

// ==================== WATCHLIST ====================
function renderWatchlist() {
    const container = document.getElementById('watchlistContainer');
    const count = document.getElementById('watchlistCount');
    if (!container) return;
    
    container.innerHTML = AppState.watchlist.map(sym => {
        const info = SYMBOLS[sym] || { color: '#00d4ff', name: sym };
        // Generate fake change
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
    
    if (count) count.textContent = AppState.watchlist.length;
    
    // Attach events
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
        if (!query) {
            dropdown.classList.add('hidden');
            return;
        }
        
        const matches = Object.keys(SYMBOLS).filter(s => 
            s.includes(query) || SYMBOLS[s].name.toUpperCase().includes(query)
        ).slice(0, 10);
        
        if (matches.length === 0) {
            dropdown.classList.add('hidden');
            return;
        }
        
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
        if (AppState.isReplaying) return;
        AppState.isReplaying = true;
        
        const speed = parseInt(document.getElementById('replaySpeed').value) || 1;
        const fullData = generateMockData(AppState.symbol, AppState.timeframe);
        
        // Reset chart with only half data
        AppState.replayIndex = Math.floor(fullData.length * 0.3);
        AppState.candlestickSeries.setData(fullData.slice(0, AppState.replayIndex));
        
        const interval = setInterval(() => {
            if (AppState.replayIndex >= fullData.length || !AppState.isReplaying) {
                clearInterval(interval);
                AppState.isReplaying = false;
                return;
            }
            
            AppState.candlestickSeries.update(fullData[AppState.replayIndex]);
            AppState.replayIndex++;
            
            const progress = (AppState.replayIndex / fullData.length) * 100;
            document.getElementById('replayProgress').style.width = progress + '%';
        }, 1000 / speed);
    });
    
    document.getElementById('replayPause')?.addEventListener('click', () => {
        AppState.isReplaying = false;
    });
    
    document.getElementById('replayReset')?.addEventListener('click', () => {
        AppState.isReplaying = false;
        AppState.replayIndex = 0;
        document.getElementById('replayProgress').style.width = '0%';
        loadSymbol(AppState.symbol);
    });
    
    document.getElementById('replayStep')?.addEventListener('click', () => {
        if (AppState.replayIndex < AppState.data.length) {
            AppState.candlestickSeries.update(AppState.data[AppState.replayIndex]);
            AppState.replayIndex++;
            const progress = (AppState.replayIndex / AppState.data.length) * 100;
            document.getElementById('replayProgress').style.width = progress + '%';
        }
    });
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    // Init icons
    if (window.lucide) window.lucide.createIcons();
    
    // Init chart
    initChart();
    
    // Render watchlist
    renderWatchlist();
    
    // Load default
    loadSymbol('BTCUSD');
    
    // Init search
    initSearch();
    
    // Init replay
    initReplay();
    
    // Timeframe buttons
    document.querySelectorAll('.tf-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tf-btn').forEach(b => {
                b.className = 'tf-btn px-3 py-1 text-xs font-medium rounded text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]';
            });
            btn.className = 'tf-btn px-3 py-1 text-xs font-medium rounded text-[#f0f6fc] bg-[#00d4ff]/20 border border-[#00d4ff]/30';
            
            AppState.timeframe = btn.dataset.tf;
            document.getElementById('legendTimeframe').textContent = 
                btn.dataset.tf === 'D' ? '1D' : btn.dataset.tf === 'W' ? '1W' : btn.dataset.tf + 'm';
            document.getElementById('statusTimeframe').textContent = 
                btn.dataset.tf === 'D' ? '1D' : btn.dataset.tf === 'W' ? '1W' : btn.dataset.tf + 'm';
            loadSymbol(AppState.symbol);
        });
    });
    
    // Tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tool-btn').forEach(b => {
                b.className = 'tool-btn w-9 h-9 flex items-center justify-center rounded-md text-[#8b949e] hover:bg-[#21262d] hover:text-[#f0f6fc]';
            });
            btn.className = 'tool-btn w-9 h-9 flex items-center justify-center rounded-md bg-[#00d4ff]/20 text-[#00d4ff]';
        });
    });
    
    // Chart type
    document.querySelectorAll('.chart-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.chart-type-btn').forEach(b => {
                b.className = 'chart-type-btn p-1.5 rounded text-[#8b949e] hover:text-[#f0f6fc]';
            });
            btn.className = 'chart-type-btn p-1.5 rounded bg-[#21262d] text-[#00d4ff]';
        });
    });
    
    // Add Indicator button
    document.getElementById('addIndicatorBtn')?.addEventListener('click', () => {
        const modal = document.getElementById('indicatorModal');
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
    });
    
    document.getElementById('closeIndicatorModal')?.addEventListener('click', () => {
        const modal = document.getElementById('indicatorModal');
        modal.style.display = 'none';
        modal.classList.add('hidden');
    });
    
    document.querySelectorAll('.indicator-option').forEach(opt => {
        opt.addEventListener('click', () => {
            addIndicator(opt.dataset.indicator);
            const modal = document.getElementById('indicatorModal');
            modal.style.display = 'none';
            modal.classList.add('hidden');
        });
    });
    
    // Clock
    setInterval(() => {
        const now = new Date();
        document.getElementById('statusTime').textContent = 
            now.toLocaleTimeString('en-GB', { hour12: false, timeZone: 'UTC' });
    }, 1000);
    
    // Re-init icons
    if (window.lucide) window.lucide.createIcons();
});

// Global
window.loadSymbol = loadSymbol;
window.removeIndicator = removeIndicator;
