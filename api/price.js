// Vercel Serverless Function - Chainlink Price Feed Proxy
// Docs: https://docs.chain.link/data-feeds/price-feeds/addresses

const RPC_ENDPOINTS = [
    'https://ethereum-rpc.publicnode.com',
    'https://eth.llamarpc.com',
    'https://rpc.ankr.com/eth',
    'https://1rpc.io/eth'
];

// Chainlink Price Feed Addresses (Ethereum Mainnet)
// Full list: https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1
const FEEDS = {
    // Precious Metals (24/7 feeds available)
    'XAUUSD': '0x214eD9Da11D2fbe465a6fc601a91E62ebEc1a0D6',  // Gold/USD
    'XAGUSD': '0x379589227b15F1a12195D3f2d90bBc9F31f95235',  // Silver/USD
    
    // Forex
    'EURUSD': '0xb49f677943BC038e9857d61E7d053CaA2C1734C1',
    'GBPUSD': '0x5c0Ab2d9b5a7ed9f470386e82BB36A3613cDd4b5',
    'USDJPY': '0xBcE206caE7f0ec07b545EddE332A47C2F75bbeb3',
    'AUDUSD': '0x77FbA179C79De5B7653F68b5039Af940AdA60ce0',
    
    // Crypto
    'BTCUSD': '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
    'ETHUSD': '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    'SOLUSD': '0x4ffC43a60e009B551865A93d232E33Fce9f01507',
    'BNBUSD': '0x14e613AC84a31f709eadbdF89C6CC390fDc9540A',
    
    // Stocks
    'AAPL': '0xca94A72Cf8Fc88DEB3e78B3a37A1b8d5aF0e5C4E',
    'TSLA': '0xae2faC90dbB3B12E2cC0E7F9F0B9B0B5f4d0E4C9',
    'NVDA': '0xea5f1f8B5b5b0c5D8E8c8E8c8E8c8E8c8E8c8E8c'
};

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { symbol } = req.query;

    if (!symbol) {
        return res.status(400).json({ error: 'Missing symbol parameter' });
    }

    const feedAddress = FEEDS[symbol.toUpperCase()];

    if (!feedAddress) {
        return res.status(400).json({
            error: `Unknown symbol: ${symbol}`,
            available: Object.keys(FEEDS)
        });
    }

    // latestRoundData() function selector
    const data = '0xfeaf968c';

    for (const rpc of RPC_ENDPOINTS) {
        try {
            const response = await fetch(rpc, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_call',
                    params: [{
                        to: feedAddress,
                        data: data
                    }, 'latest'],
                    id: 1
                })
            });

            const json = await response.json();

            if (json.result && json.result !== '0x') {
                const hex = json.result.slice(2);

                // Parse latestRoundData response
                // Structure: roundId (32 bytes), answer (32 bytes), startedAt (32 bytes), updatedAt (32 bytes), answeredInRound (32 bytes)
                const answer = BigInt('0x' + hex.slice(64, 128));
                const updatedAt = parseInt(hex.slice(192, 256), 16);

                // Chainlink price feeds use 8 decimals
                const price = Number(answer) / 1e8;

                return res.status(200).json({
                    success: true,
                    symbol: symbol.toUpperCase(),
                    price: price,
                    updatedAt: updatedAt,
                    feed: feedAddress,
                    rpc: rpc
                });
            }
        } catch (e) {
            console.warn(`RPC ${rpc} failed:`, e.message);
        }
    }

    return res.status(500).json({
        error: 'All RPC endpoints failed',
        symbol: symbol.toUpperCase()
    });
}
