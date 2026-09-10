require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');

const aggregator = require('./aggregator');

const app = express();
const PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ==================== REST ENDPOINTS ====================

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        providers: ['binance', 'alltick', 'yahoo'],
        timestamp: Date.now()
    });
});

// Get historical - AUTO ROUTING ke provider yang sesuai
app.get('/api/history/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const { interval = '240', count = 1000 } = req.query;
        
        const data = await aggregator.fetchHistorical(
            symbol.toUpperCase(), 
            interval, 
            parseInt(count)
        );
        
        res.json({
            symbol: symbol.toUpperCase(),
            interval,
            count: data.length,
            data
        });
    } catch (err) {
        console.error('History error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Multi-symbol batch
app.post('/api/history/batch', async (req, res) => {
    try {
        const { symbols, interval = '240', count = 500 } = req.body;
        
        const results = await Promise.allSettled(
            symbols.map(s => aggregator.fetchHistorical(s.toUpperCase(), interval, count))
        );
        
        const response = {};
        symbols.forEach((s, i) => {
            response[s] = results[i].status === 'fulfilled' 
                ? results[i].value 
                : { error: results[i].reason.message };
        });
        
        res.json(response);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== WEBSOCKET SERVER ====================

const wsServer = http.createServer();
const wss = new WebSocketServer({ server: wsServer });

const clients = new Map();

wss.on('connection', (ws) => {
    const clientId = Date.now().toString();
    clients.set(clientId, { ws, subscriptions: new Set() });
    
    console.log(`🔌 Client ${clientId} connected`);
    
    ws.on('message', async (data) => {
        try {
            const msg = JSON.parse(data.toString());
            
            if (msg.type === 'subscribe') {
                const symbols = msg.symbols || [];
                const client = clients.get(clientId);
                
                for (const symbol of symbols) {
                    try {
                        await aggregator.subscribe(symbol.toUpperCase(), msg.interval || '240', (tick) => {
                            if (ws.readyState === ws.OPEN) {
                                ws.send(JSON.stringify({
                                    type: 'tick',
                                    symbol: symbol.toUpperCase(),
                                    ...tick
                                }));
                            }
                        });
                        
                        client.subscriptions.add(symbol);
                    } catch (err) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            symbol,
                            message: err.message
                        }));
                    }
                }
                
                ws.send(JSON.stringify({
                    type: 'subscribed',
                    symbols: Array.from(client.subscriptions)
                }));
            }
            
            if (msg.type === 'unsubscribe') {
                const client = clients.get(clientId);
                (msg.symbols || []).forEach(sym => {
                    aggregator.unsubscribe(sym.toUpperCase());
                    client.subscriptions.delete(sym);
                });
            }
        } catch (e) {
            console.error('WS message error:', e.message);
        }
    });
    
    ws.on('close', () => {
        const client = clients.get(clientId);
        if (client) {
            client.subscriptions.forEach(sym => aggregator.unsubscribe(sym));
        }
        clients.delete(clientId);
        console.log(`🔌 Client ${clientId} disconnected`);
    });
});

// ==================== START ====================

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 REST API: http://localhost:${PORT}`);
});

wsServer.listen(WS_PORT, '0.0.0.0', () => {
    console.log(`📡 WebSocket: ws://localhost:${WS_PORT}`);
});

process.on('SIGTERM', () => {
    console.log('Shutting down...');
    process.exit(0);
});
