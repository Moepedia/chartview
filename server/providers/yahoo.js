// Yahoo Finance - STOCKS, ETF, INDEX (historical only, no WS)
const axios = require('axios');

class YahooProvider {
    async fetchHistorical(symbol, interval = '1h', range = '3mo') {
        // Map interval
        const intervalMap = {
            '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m',
            '60m': '60m', '1h': '60m', '4h': '60m', // 4h digabung dari 60m
            '1d': '1d', '1w': '1wk', '1M': '1mo'
        };
        
        const yahooInterval = intervalMap[interval] || '1h';
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${yahooInterval}&range=${range}`;
        
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const result = res.data.chart.result[0];
        const timestamps = result.timestamp;
        const quotes = result.indicators.quote[0];
        
        let data = timestamps.map((t, i) => ({
            time: t,
            open: quotes.open[i],
            high: quotes.high[i],
            low: quotes.low[i],
            close: quotes.close[i],
            volume: quotes.volume[i] || 0
        })).filter(d => d.open != null && d.close != null);
        
        // Aggregate ke 4h kalo perlu
        if (interval === '4h') {
            data = this.aggregate(data, 4);
        }
        
        return data;
    }

    aggregate(data, factor) {
        const result = [];
        for (let i = 0; i < data.length; i += factor) {
            const chunk = data.slice(i, i + factor);
            if (chunk.length === 0) continue;
            
            result.push({
                time: chunk[0].time,
                open: chunk[0].open,
                high: Math.max(...chunk.map(d => d.high)),
                low: Math.min(...chunk.map(d => d.low)),
                close: chunk[chunk.length - 1].close,
                volume: chunk.reduce((sum, d) => sum + (d.volume || 0), 0)
            });
        }
        return result;
    }
}

module.exports = new YahooProvider();
