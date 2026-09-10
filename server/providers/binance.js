// Binance WebSocket + REST - CRYPTO (GRATIS, NO API KEY)
const WebSocket = require('ws');
const axios = require('axios');

class BinanceProvider {
    constructor() {
        this.ws = null;
        this.subscriptions = new Map();
        this.callbacks = new Map();
    }

    async fetchHistorical(symbol, interval = '4h', limit = 1000) {
        // Binance pake format BTCUSDT (bukan BTCUSD)
        const binanceSymbol = symbol.replace('USD', 'USDT');
        const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`;
        
        const res = await axios.get(url);
        return res.data.map(k => ({
            time: Math.floor(k[0] / 1000),
            open: parseFloat(k[1]),
            high: parseFloat(k[2]),
            low: parseFloat(k[3]),
            close: parseFloat(k[4]),
            volume: parseFloat(k[5])
        }));
    }

    subscribe(symbol, interval, callback) {
        // Binance combined stream
        const binanceSymbol = symbol.replace('USD', 'USDT').toLowerCase();
        const stream = `${binanceSymbol}@kline_${interval}`;
        
        if (!this.ws) {
            this.ws = new WebSocket('wss://stream.binance.com:9443/ws');
            
            this.ws.on('message', (data) => {
                const msg = JSON.parse(data);
                if (msg.k) {
                    const k = msg.k;
                    const bar = {
                        symbol: symbol,
                        time: Math.floor(k.t / 1000),
                        open: parseFloat(k.o),
                        high: parseFloat(k.h),
                        low: parseFloat(k.l),
                        close: parseFloat(k.c),
                        volume: parseFloat(k.v),
                        closed: k.x
                    };
                    
                    const cb = this.callbacks.get(msg.s);
                    if (cb) cb(bar);
                }
            });
            
            this.ws.on('close', () => {
                console.log('Binance WS closed, reconnecting...');
                this.ws = null;
                setTimeout(() => this.reconnectAll(), 3000);
            });
        }
        
        // Subscribe via message
        this.ws.send(JSON.stringify({
            method: 'SUBSCRIBE',
            params: [stream],
            id: Date.now()
        }));
        
        this.callbacks.set(binanceSymbol + '@kline_' + interval, callback);
    }

    reconnectAll() {
        for (const [stream, cb] of this.callbacks.entries()) {
            const symbol = stream.split('@')[0].toUpperCase();
            this.subscribe(symbol, '4h', cb);
        }
    }

    unsubscribe(symbol) {
        const binanceSymbol = symbol.replace('USD', 'USDT').toLowerCase();
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                method: 'UNSUBSCRIBE',
                params: [`${binanceSymbol}@kline_4h`],
                id: Date.now()
            }));
        }
    }
}

module.exports = new BinanceProvider();
