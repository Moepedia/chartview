// Unified Symbol Router - pilih provider berdasarkan symbol
const binance = require('./providers/binance');
const alltick = require('./providers/alltick');
const yahoo = require('./providers/yahoo');

class Aggregator {
    constructor() {
        // Klasifikasi symbol
        this.providers = {
            // Crypto → Binance
            'BTCUSD': 'binance', 'ETHUSD': 'binance', 'SOLUSD': 'binance',
            'BNBUSD': 'binance', 'XRPUSD': 'binance', 'ADAUSD': 'binance',
            'DOGEUSD': 'binance', 'AVAXUSD': 'binance', 'DOTUSD': 'binance',
            'MATICUSD': 'binance', 'LINKUSD': 'binance', 'LTCUSD': 'binance',
            
            // Forex + Commodity → AllTick
            'XAUUSD': 'alltick', 'XAGUSD': 'alltick', 'WTIUSD': 'alltick',
            'EURUSD': 'alltick', 'GBPUSD': 'alltick', 'USDJPY': 'alltick',
            'AUDUSD': 'alltick', 'USDCAD': 'alltick', 'USDCHF': 'alltick',
            'NZDUSD': 'alltick', 'EURGBP': 'alltick', 'EURJPY': 'alltick',
            'GBPJPY': 'alltick', 'USOUSD': 'alltick', 'UKOUSD': 'alltick',
            
            // Stocks → Yahoo
            'AAPL': 'yahoo', 'TSLA': 'yahoo', 'GOOGL': 'yahoo',
            'MSFT': 'yahoo', 'AMZN': 'yahoo', 'META': 'yahoo',
            'NVDA': 'yahoo', 'NFLX': 'yahoo', 'AMD': 'yahoo',
            'INTC': 'yahoo', 'DIS': 'yahoo', 'BA': 'yahoo',
            'JPM': 'yahoo', 'V': 'yahoo', 'WMT': 'yahoo',
            
            // Index → Yahoo
            'SPX': 'yahoo', 'NDX': 'yahoo', 'DJI': 'yahoo',
            'VIX': 'yahoo', 'DXY': 'yahoo'
        };
    }

    getProvider(symbol) {
        const providerName = this.providers[symbol.toUpperCase()] || 'binance';
        return providerName;
    }

    async fetchHistorical(symbol, interval, count) {
        const provider = this.getProvider(symbol);
        
        try {
            switch (provider) {
                case 'binance':
                    return await binance.fetchHistorical(symbol, this.mapBinanceInterval(interval), count);
                case 'alltick':
                    return await alltick.fetchHistorical(symbol, interval, count);
                case 'yahoo':
                    return await yahoo.fetchHistorical(symbol, interval, count);
                default:
                    throw new Error(`Unknown provider: ${provider}`);
            }
        } catch (err) {
            console.error(`[${provider}] ${symbol} error:`, err.message);
            throw err;
        }
    }

    async subscribe(symbol, interval, callback) {
        const provider = this.getProvider(symbol);
        
        switch (provider) {
            case 'binance':
                binance.subscribe(symbol, this.mapBinanceInterval(interval), callback);
                break;
            case 'alltick':
                await alltick.subscribe(symbol, callback);
                break;
            case 'yahoo':
                // Yahoo ga ada WS, skip
                console.warn(`Yahoo (${symbol}) doesn't support realtime`);
                break;
        }
    }

    unsubscribe(symbol) {
        const provider = this.getProvider(symbol);
        
        switch (provider) {
            case 'binance': binance.unsubscribe(symbol); break;
            case 'alltick': alltick.unsubscribe(symbol); break;
        }
    }

    mapBinanceInterval(interval) {
        // Binance format: 1m, 5m, 15m, 1h, 4h, 1d, 1w
        const map = {
            '1': '1m', '5': '5m', '15': '15m', '60': '1h',
            '240': '4h', 'D': '1d', 'W': '1w'
        };
        return map[interval] || '4h';
    }
}

module.exports = new Aggregator();
