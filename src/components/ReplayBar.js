import { AppState } from '../main.js';
import { icon } from '../utils/icons.js';
import { getCandlestickSeries, getChart } from './ChartArea.js';

let replayInterval = null;

export function renderReplayBar() {
  return `
    <div class="border-b border-[#30363d]">
      <div class="flex items-center justify-between px-3 py-2">
        <span class="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Bar Replay</span>
        <span class="text-[#8b949e]">${icon('history', 'w-3 h-3')}</span>
      </div>
      <div class="px-2 pb-2 space-y-2">
        <div class="grid grid-cols-4 gap-1">
          <button id="replayStart" class="flex items-center justify-center py-2 rounded-md bg-[#21262d] hover:bg-[#30363d] transition-all" title="Play">
            ${icon('play', 'w-4 h-4 text-[#3fb950]')}
          </button>
          <button id="replayPause" class="flex items-center justify-center py-2 rounded-md bg-[#21262d] hover:bg-[#30363d] transition-all" title="Pause">
            ${icon('pause', 'w-4 h-4 text-[#d29922]')}
          </button>
          <button id="replayStep" class="flex items-center justify-center py-2 rounded-md bg-[#21262d] hover:bg-[#30363d] transition-all" title="Step Forward">
            ${icon('skip-forward', 'w-4 h-4 text-[#8b949e]')}
          </button>
          <button id="replayReset" class="flex items-center justify-center py-2 rounded-md bg-[#21262d] hover:bg-[#30363d] transition-all" title="Reset">
            ${icon('rotate-ccw', 'w-4 h-4 text-[#8b949e]')}
          </button>
        </div>
        
        <select id="replaySpeed" class="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-2 py-1.5 text-xs text-[#c9d1d9] focus:outline-none focus:border-[#00d4ff]">
          <option value="1">1x Speed</option>
          <option value="2">2x Speed</option>
          <option value="5">5x Speed</option>
          <option value="10">10x Speed</option>
          <option value="20">20x Speed</option>
        </select>
        
        <div class="w-full h-1 bg-[#21262d] rounded-full overflow-hidden">
          <div class="h-full bg-[#00d4ff] w-0 transition-all" id="replayProgress"></div>
        </div>
      </div>
    </div>
  `;
}

export function initReplay() {
  const startBtn = document.getElementById('replayStart');
  const pauseBtn = document.getElementById('replayPause');
  const stepBtn = document.getElementById('replayStep');
  const resetBtn = document.getElementById('replayReset');
  const speedSelect = document.getElementById('replaySpeed');
  
  if (!startBtn) return;
  
  startBtn.addEventListener('click', () => {
    if (replayInterval) return;
    
    const speed = parseInt(speedSelect.value) || 1;
    AppState.isReplaying = true;
    
    startBtn.classList.add('bg-[#00d4ff]/20');
    
    replayInterval = setInterval(() => {
      if (AppState.replayIndex >= AppState.data.length) {
        stopReplay();
        return;
      }
      
      const bar = AppState.data[AppState.replayIndex];
      const series = getCandlestickSeries();
      
      if (series && bar) {
        series.update(bar);
      }
      
      // Update progress
      const progress = (AppState.replayIndex / AppState.data.length) * 100;
      const progressBar = document.getElementById('replayProgress');
      if (progressBar) progressBar.style.width = progress + '%';
      
      AppState.replayIndex++;
    }, 1000 / speed);
  });
  
  pauseBtn.addEventListener('click', stopReplay);
  
  stepBtn.addEventListener('click', () => {
    if (AppState.replayIndex >= AppState.data.length) return;
    
    const bar = AppState.data[AppState.replayIndex];
    const series = getCandlestickSeries();
    
    if (series && bar) {
      series.update(bar);
    }
    
    AppState.replayIndex++;
    
    const progress = (AppState.replayIndex / AppState.data.length) * 100;
    const progressBar = document.getElementById('replayProgress');
    if (progressBar) progressBar.style.width = progress + '%';
  });
  
  resetBtn.addEventListener('click', () => {
    stopReplay();
    AppState.replayIndex = 0;
    
    const progressBar = document.getElementById('replayProgress');
    if (progressBar) progressBar.style.width = '0%';
    
    // Reload full data
    window.loadSymbolData(AppState.symbol);
  });
}

function stopReplay() {
  if (replayInterval) {
    clearInterval(replayInterval);
    replayInterval = null;
  }
  AppState.isReplaying = false;
  
  const startBtn = document.getElementById('replayStart');
  if (startBtn) startBtn.classList.remove('bg-[#00d4ff]/20');
}
