import { generateMockData, getIntervalSeconds } from '../utils/mockData.js';

export class DataProvider {
  constructor() {
    this.subscriptions = new Map();
    this.currentSymbol = null;
    this.currentTimeframe = null;
  }
  
  async fetchHistorical(symbol, timeframe, count = 500) {
    // Simulasi fetch dari API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockData(symbol, timeframe, count));
      }, 100);
    });
  }
  
  subscribe(symbol, timeframe, callback) {
    const key = `${symbol}_${timeframe}`;
    
    // Unsubscribe existing
    if (this.subscriptions.has(key)) {
      clearInterval(this.subscriptions.get(key));
    }
    
    // New subscription
    const interval = setInterval(() => {
      const lastBar = generateMockData(symbol, timeframe, 1)[0];
      callback(lastBar);
    }, 1000);
    
    this.subscriptions.set(key, interval);
    this.currentSymbol = symbol;
    this.currentTimeframe = timeframe;
  }
  
  unsubscribe(symbol, timeframe) {
    const key = `${symbol}_${timeframe}`;
    if (this.subscriptions.has(key)) {
      clearInterval(this.subscriptions.get(key));
      this.subscriptions.delete(key);
    }
  }
  
  unsubscribeAll() {
    this.subscriptions.forEach(interval => clearInterval(interval));
    this.subscriptions.clear();
  }
}

export const dataProvider = new DataProvider();
