// Indicator calculations

export function calculateSMA(data, period) {
  const result = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    result.push({ time: data[i].time, value: sum / period });
  }
  return result;
}

export function calculateEMA(data, period) {
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

export function calculateBollingerBands(data, period = 20, stdDevMultiplier = 2) {
  const upper = [], middle = [], lower = [];
  
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    const avg = sum / period;
    
    let variance = 0;
    for (let j = 0; j < period; j++) {
      variance += Math.pow(data[i - j].close - avg, 2);
    }
    const std = Math.sqrt(variance / period);
    
    middle.push({ time: data[i].time, value: avg });
    upper.push({ time: data[i].time, value: avg + stdDevMultiplier * std });
    lower.push({ time: data[i].time, value: avg - stdDevMultiplier * std });
  }
  
  return { upper, middle, lower };
}

export function calculateRSI(data, period = 14) {
  const result = [];
  if (data.length < period + 1) return result;
  
  let gains = 0, losses = 0;
  
  // Initial average
  for (let i = 1; i <= period; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  for (let i = period; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    result.push({ time: data[i].time, value: rsi });
  }
  
  return result;
}

export function calculateMACD(data, fast = 12, slow = 26, signalPeriod = 9) {
  if (data.length < slow) return { macd: [], signal: [], histogram: [] };
  
  const emaFast = calculateEMA(data, fast);
  const emaSlow = calculateEMA(data, slow);
  
  const macdLine = [];
  const offset = emaFast.length - emaSlow.length;
  
  for (let i = 0; i < emaSlow.length; i++) {
    macdLine.push({
      time: emaSlow[i].time,
      value: emaFast[i + offset].value - emaSlow[i].value
    });
  }
  
  // Signal line (EMA of MACD)
  const signalLine = [];
  const multiplier = 2 / (signalPeriod + 1);
  let ema = macdLine[0]?.value || 0;
  signalLine.push({ time: macdLine[0]?.time, value: ema });
  
  for (let i = 1; i < macdLine.length; i++) {
    ema = (macdLine[i].value - ema) * multiplier + ema;
    signalLine.push({ time: macdLine[i].time, value: ema });
  }
  
  // Histogram
  const histogram = [];
  for (let i = 0; i < macdLine.length; i++) {
    const histValue = macdLine[i].value - (signalLine[i]?.value || 0);
    histogram.push({
      time: macdLine[i].time,
      value: histValue,
      color: histValue >= 0 ? '#3fb950' : '#f85149'
    });
  }
  
  return { macd: macdLine, signal: signalLine, histogram };
}

export function calculateStochastic(data, kPeriod = 14, dPeriod = 3) {
  const kLine = [];
  
  for (let i = kPeriod - 1; i < data.length; i++) {
    let highest = -Infinity;
    let lowest = Infinity;
    
    for (let j = 0; j < kPeriod; j++) {
      highest = Math.max(highest, data[i - j].high);
      lowest = Math.min(lowest, data[i - j].low);
    }
    
    const k = ((data[i].close - lowest) / (highest - lowest)) * 100;
    kLine.push({ time: data[i].time, value: k });
  }
  
  // D line (SMA of K)
  const dLine = [];
  for (let i = dPeriod - 1; i < kLine.length; i++) {
    let sum = 0;
    for (let j = 0; j < dPeriod; j++) {
      sum += kLine[i - j].value;
    }
    dLine.push({ time: kLine[i].time, value: sum / dPeriod });
  }
  
  return { k: kLine, d: dLine };
}

export function calculateVolume(data) {
  return data.map(d => ({
    time: d.time,
    value: d.volume || Math.floor(Math.random() * 1000000) + 100000,
    color: d.close >= d.open ? '#3fb95033' : '#f8514933'
  }));
}
