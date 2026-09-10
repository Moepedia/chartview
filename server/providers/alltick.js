// AllTick - FOREX, PRECIOUS METALS, COMMODITY
// Docs: https://alltick.co/apis/en/rest-api/introduction
const WebSocket = require('ws');
const axios = require('axios');

const HTTP_BASE = 'https://quote.alltick.co/quote-b-api';
const WS_URL = 'wss://quote.alltick.co/quote-b-ws-api';

class AllTickProvider {
    constructor() {
        this.token = process.env.ALLTICK_TOKEN;
        this.ws = null;
        this.callbacks = new Map();
        this.wsReady = false;
    }

    async fetchHistorical(symbol, interval = '4h', count = 1000) {
        // AllTick format: XAUUSD, EURUSD, etc.
        const query = {
            trace: `nebolus_${Date.now()}`,
            data: {
                symbol: symbol,
                interval: interval,
                count: count
            }
        };
        
        const url = `${HTTP_BASE}/kline?token=${this.token}&query=${encodeURIComponent(JSON.stringify(query))}`;
        const res = await axios.get(url);
        
        if (res.data.code !== 0) {
            throw new Error(`AllTick error: ${res.data.message}`);
        }
        
        return res.data.data.klines.map(k => ({
            time: Math.floor(k.timestamp / 1000),
            open: parseFloat(k.open),
            high: parseFloat(k.high),
            low: parseFloat(k.low),
            close: parseFloat(k.close),
            volume: parseFloat(k.volume || 0)
        }));
    }

    async connectWS() {
        if (this.wsReady) return;
        
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(WS_URL);
            
            this.ws.on('open', () => {
                console.log('✅ AllTick WS connected');
                this.wsReady = true;
                
                // Auth
                this.ws.send(JSON.stringify({
                    cmd: 'auth',
                    token: this.token
                }));
                
                resolve();
            });
            
            this.ws.on('message', (data) => {
                const msg = JSON.parse(data.toString());
                
                if (msg.cmd === 'tick' || msg.data) {
                    const tick = msg.data;
                    const cb = this.callbacks.get(tick.symbol);
                    if (cb) {
                        cb({
                            symbol: tick.symbol,
                            time: Math.floor(tick.timestamp / 1000),
                            bid: parseFloat(tick.bid),
                            ask: parseFloat(tick.ask),
                            last: parseFloat(tick.price),
                            volume: parseFloat(tick.volume || 0)
                        });
                    }
                }
            });
            
            this.ws.on('error', reject);
            
            this.ws.on('close', () => {
                this.wsReady = false;
                setTimeout(() => this.connectWS(), 3000);
            });
        });
    }

    async subscribe(symbol, callback) {
        if (!this.wsReady) await this.connectWS();
        
        this.callbacks.set(symbol, callback);
        
        this.ws.send(JSON.stringify({
            cmd: 'subscribe',
            data: {
                symbol: symbol
            }
        }));
    }

    unsubscribe(symbol) {
        this.callbacks.delete(symbol);
        if (this.ws && this.wsReady) {
            this.ws.send(JSON.stringify({
                cmd: 'unsubscribe',
                data: { symbol }
            }));
        }
    }
}

module.exports = new AllTickProvider();
