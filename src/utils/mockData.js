// Mock data generator untuk testing
export function generateMockData(symbol, timeframe, count = 500) {
  const data = [];
  let basePrice = getBasePrice(symbol);
  const now = Math.floor(Date.now() / 1000);
  const interval = getIntervalSeconds(timeframe);
  
  // Seed random berdasarkan symbol biar konsisten
  const seed = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  let random = seed;
  const seededRandom = () => {
    random = (random * 9301 + 49297) % 233280;
    return random / 233280;
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

export function getBasePrice(symbol) {
  const prices = {
    'BTCUSD': 45000,
    'ETHUSD': 3000,
    'SOLUSD': 100,
    'AAPL': 180,
    'TSLA': 240,
    'GOOGL': 140,
    'MSFT': 370,
    'AMZN': 150
  };
  return prices[symbol] || 100;
}

export function getIntervalSeconds(timeframe) {
  const map = {
    '1': 60,
    '5': 300,
    '15': 900,
    '60': 3600,
    '240': 14400,
    'D': 86400,
    'W': 604800
  };
  return map[timeframe] || 14400;
}

export function formatPrice(price) {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function formatVolume(volume) {
  if (volume >= 1000000) return (volume / 1000000).toFixed(2) + 'M';
  if (volume >= 1000) return (volume / 1000).toFixed(2) + 'K';
  return volume.toString();
}
