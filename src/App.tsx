import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameState {
  snake: { x: number; y: number }[];
  food: { x: number; y: number };
  direction: { x: number; y: number };
  gameOver: boolean;
  score: number;
}

const GRID_SIZE = 20;
const CELL_SIZE = 15;

type GameMode = 'excel' | 'code' | 'doc' | 'calculator' | 'clock' | 'snake' | 'game2048' | 'tetris' | 'minesweeper' | 'gomoku' | 'relax';

const gameIcons: Record<GameMode, JSX.Element> = {
  excel: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h4v4H7V7zm0 6h4v4H7v-4zm6-6h4v4h-4V7zm0 6h4v4h-4v-4z"/>
    </svg>
  ),
  code: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
    </svg>
  ),
  doc: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
    </svg>
  ),
  calculator: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 2h2v2h-2V5zm0 4h2v2h-2V9zm0 4h2v2h-2v-2zM5 15h4v4H5v-4zm6 0h2v2h-2v-2zm0-4h2v2h-2v-2zm0-4h2v2h-2V7zm6 8h4v2h-4v-2zm0-4h4v2h-4v-2zm0-4h4v2h-4V7z"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
    </svg>
  ),
  snake: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-3.5h-3.5v-2h3.5V7.5l5 4.5-5 4.5z"/>
      <circle cx="8" cy="10" r="1.5"/>
      <circle cx="16" cy="10" r="1.5"/>
    </svg>
  ),
  game2048: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  tetris: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M3 3h6v6H3V3zm8 0h6v6h-6V3zM3 11h6v6H3v-6zm8 0h6v6h-6v-6z"/>
    </svg>
  ),
  minesweeper: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  gomoku: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <circle cx="6" cy="6" r="2"/>
      <circle cx="18" cy="6" r="2"/>
      <circle cx="6" cy="18" r="2"/>
      <circle cx="18" cy="18" r="2"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  relax: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
    </svg>
  ),
};

const gameNames: Record<GameMode, string> = {
  excel: '表格',
  code: '代码',
  doc: '文档',
  calculator: '计算器',
  clock: '时钟',
  snake: '贪吃蛇',
  game2048: '2048',
  tetris: '俄罗斯方块',
  minesweeper: '扫雷',
  gomoku: '五子棋',
  relax: '放松',
};

export default function App() {
  const [currentMode, setCurrentMode] = useState<GameMode>('excel');
  const [showWarning, setShowWarning] = useState(false);
  const [isStealthMode, setIsStealthMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [relaxFullscreen, setRelaxFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === '~') {
        e.preventDefault();
        setIsStealthMode(true);
        return;
      }
      if (e.ctrlKey && e.key === '`') {
        setCurrentMode('excel');
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 1500);
      }
      if (e.ctrlKey && e.key === '1') setCurrentMode('excel');
      if (e.ctrlKey && e.key === '2') setCurrentMode('code');
      if (e.ctrlKey && e.key === '3') setCurrentMode('doc');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleStealthMode = () => {
    setIsStealthMode(!isStealthMode);
  };

  const workModes: GameMode[] = ['excel', 'code', 'doc', 'calculator', 'clock'];
  const gameModes: GameMode[] = ['snake', 'game2048', 'tetris', 'minesweeper', 'gomoku', 'relax'];

  if (isStealthMode) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <div className="bg-emerald-700 text-white px-4 py-2 flex items-center justify-between text-sm border-b border-emerald-800">
          <div className="flex items-center gap-4">
            <span className="font-semibold">工作簿1 - Excel</span>
            <span className="text-emerald-200 text-xs">自动保存</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-200 text-xs hidden sm:inline">Ctrl+Shift+~ 退出</span>
            <button
              onClick={toggleStealthMode}
              className="px-2 py-1 text-emerald-200 hover:text-white transition text-xs"
            >
              退出
            </button>
          </div>
        </div>
        <div className="flex h-[calc(100vh-40px)]">
          <aside className="w-16 bg-white border-r border-slate-200 flex flex-col py-2">
            {workModes.map((mode) => (
              <button
                key={mode}
                onClick={() => setCurrentMode(mode)}
                className={`w-12 h-12 mx-2 mb-1 rounded-lg flex items-center justify-center transition ${
                  currentMode === mode
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
                title={gameNames[mode]}
              >
                {gameIcons[mode]}
              </button>
            ))}
          </aside>
          <main className="flex-1 p-4 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {currentMode === 'excel' && <ExcelMode isStealth={true} />}
                {currentMode === 'code' && <CodeMode />}
                {currentMode === 'doc' && <DocMode />}
                {currentMode === 'calculator' && <CalculatorMode />}
                {currentMode === 'clock' && <ClockMode />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            已切换至工作模式
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex h-screen">
        <motion.aside
          initial={{ width: 280 }}
          animate={{ width: sidebarCollapsed ? 80 : 280 }}
          className="bg-white border-r border-slate-200 shadow-xl flex flex-col"
        >
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              {!sidebarCollapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h1 className="font-bold text-slate-800 text-lg">摸鱼神器</h1>
                  <p className="text-xs text-slate-500">Ctrl + ` 紧急切换</p>
                </motion.div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-4 mb-2">
              {!sidebarCollapsed && <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">工作模式</span>}
            </div>
            {workModes.map((mode) => (
              <NavButton
                key={mode}
                mode={mode}
                active={currentMode === mode}
                onClick={() => setCurrentMode(mode)}
                collapsed={sidebarCollapsed}
              />
            ))}

            <div className="px-4 mb-2 mt-6">
              {!sidebarCollapsed && <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">摸鱼专区</span>}
            </div>
            {gameModes.map((mode) => (
              <NavButton
                key={mode}
                mode={mode}
                active={currentMode === mode}
                onClick={() => setCurrentMode(mode)}
                collapsed={sidebarCollapsed}
              />
            ))}
          </div>

          <div className="p-4 border-t border-slate-100">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={toggleStealthMode}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              {!sidebarCollapsed && <span className="font-medium">进入隐蔽模式</span>}
            </motion.button>
          </div>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
          >
            <svg
              className={`w-4 h-4 text-slate-400 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </motion.aside>

        <motion.main
          className="flex-1 overflow-auto p-8 relative"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentMode === 'excel' && <ExcelMode isStealth={false} />}
              {currentMode === 'code' && <CodeMode />}
              {currentMode === 'doc' && <DocMode />}
              {currentMode === 'calculator' && <CalculatorMode />}
              {currentMode === 'clock' && <ClockMode />}
              {currentMode === 'snake' && <SnakeGame />}
              {currentMode === 'game2048' && <Game2048 />}
              {currentMode === 'tetris' && <TetrisGame />}
              {currentMode === 'minesweeper' && <MinesweeperGame />}
              {currentMode === 'gomoku' && <GomokuGame />}
              {currentMode === 'relax' && (
                <RelaxMode
                  onEnterFullscreen={() => setRelaxFullscreen(true)}
                  onExitFullscreen={() => setRelaxFullscreen(false)}
                  isFullscreen={relaxFullscreen}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.main>
      </div>
    </div>
  );
}

function NavButton({ mode, active, onClick, collapsed }: { mode: GameMode; active: boolean; onClick: () => void; collapsed: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full flex items-center gap-3 px-4 py-3 mx-2 mb-1 rounded-xl transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
      }`}
    >
      <span className={active ? 'text-white' : 'text-slate-500'}>{gameIcons[mode]}</span>
      {!collapsed && <span className="font-medium text-sm">{gameNames[mode]}</span>}
    </motion.button>
  );
}

function ExcelMode({ isStealth }: { isStealth: boolean }) {
  const [data, setData] = useState<string[][]>(() => {
    const rows = [];
    for (let i = 0; i < 20; i++) {
      const row = [];
      for (let j = 0; j < 10; j++) {
        if (i === 0 && j === 0) row.push('');
        else if (i === 0) row.push(String.fromCharCode(64 + j));
        else if (j === 0) row.push(String(i));
        else {
          const val = Math.random();
          if (val < 0.3) row.push('');
          else if (val < 0.6) row.push(String(Math.floor(Math.random() * 10000)));
          else row.push(String((Math.random() * 1000).toFixed(2)));
        }
      }
      rows.push(row);
    }
    return rows;
  });

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ start: { row: number; col: number } | null; end: { row: number; col: number } | null }>({ start: null, end: null });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCellClick = (row: number, col: number) => {
    if (row === 0 || col === 0) return;
    setSelectedCell({ row, col });
    setEditValue(data[row][col]);
    setIsEditing(true);
    setSelectedRange({ start: { row, col }, end: { row, col } });
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleCellChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleCellBlur = () => {
    if (selectedCell) {
      const newData = [...data];
      newData[selectedCell.row][selectedCell.col] = editValue;
      setData(newData);
    }
    setIsEditing(false);
    setSelectedCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellBlur();
    }
  };

  const calculateSum = () => {
    if (!selectedRange.start || !selectedRange.end) return 0;
    let sum = 0;
    for (let i = selectedRange.start.row; i <= selectedRange.end.row; i++) {
      for (let j = selectedRange.start.col; j <= selectedRange.end.col; j++) {
        const val = parseFloat(data[i][j]);
        if (!isNaN(val)) sum += val;
      }
    }
    return sum.toFixed(2);
  };

  const calculateAvg = () => {
    if (!selectedRange.start || !selectedRange.end) return 0;
    let sum = 0;
    let count = 0;
    for (let i = selectedRange.start.row; i <= selectedRange.end.row; i++) {
      for (let j = selectedRange.start.col; j <= selectedRange.end.col; j++) {
        const val = parseFloat(data[i][j]);
        if (!isNaN(val)) {
          sum += val;
          count++;
        }
      }
    }
    return count > 0 ? (sum / count).toFixed(2) : 0;
  };

  const calculateMax = () => {
    if (!selectedRange.start || !selectedRange.end) return 0;
    let max = -Infinity;
    for (let i = selectedRange.start.row; i <= selectedRange.end.row; i++) {
      for (let j = selectedRange.start.col; j <= selectedRange.end.col; j++) {
        const val = parseFloat(data[i][j]);
        if (!isNaN(val) && val > max) max = val;
      }
    }
    return max === -Infinity ? 0 : max.toFixed(2);
  };

  const calculateMin = () => {
    if (!selectedRange.start || !selectedRange.end) return 0;
    let min = Infinity;
    for (let i = selectedRange.start.row; i <= selectedRange.end.row; i++) {
      for (let j = selectedRange.start.col; j <= selectedRange.end.col; j++) {
        const val = parseFloat(data[i][j]);
        if (!isNaN(val) && val < min) min = val;
      }
    }
    return min === Infinity ? 0 : min.toFixed(2);
  };

  const exportToCSV = () => {
    const csv = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '工作簿1.csv';
    a.click();
  };

  const importFromCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const rows = text.split('\n').map(row => row.split(','));
        setData(rows);
      };
      reader.readAsText(file);
    }
  };

  const addRow = () => {
    const newRow = [String(data.length), ...Array(data[0].length - 1).fill('')];
    setData([...data, newRow]);
  };

  const addCol = () => {
    const newData = data.map((row, i) => {
      if (i === 0) return [...row, String.fromCharCode(64 + row.length)];
      return [...row, ''];
    });
    setData(newData);
  };

  return (
    <div className={`bg-white ${isStealth ? '' : 'rounded-2xl shadow-xl border border-slate-200 overflow-hidden'}`}>
      {!isStealth && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {gameIcons.excel}
            <span className="font-bold text-lg">工作簿1</span>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addRow}
              className="px-3 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition text-sm font-medium"
            >
              + 行
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addCol}
              className="px-3 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition text-sm font-medium"
            >
              + 列
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportToCSV}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition text-sm font-medium"
            >
              导出 CSV
            </motion.button>
            <label className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition text-sm font-medium cursor-pointer">
              导入 CSV
              <input type="file" accept=".csv" onChange={importFromCSV} className="hidden" />
            </label>
          </div>
        </div>
      )}

      {selectedRange.start && selectedRange.end && (
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex items-center gap-4 text-sm">
          <span className="font-semibold text-slate-600">选中区域统计:</span>
          <span className="text-slate-700">求和: {calculateSum()}</span>
          <span className="text-slate-700">平均值: {calculateAvg()}</span>
          <span className="text-slate-700">最大值: {calculateMax()}</span>
          <span className="text-slate-700">最小值: {calculateMin()}</span>
        </div>
      )}

      <div className={`${isStealth ? 'p-2' : 'p-6'}`}>
        <div className="border border-slate-200 rounded-xl overflow-auto max-h-[70vh] shadow-inner bg-slate-50">
          <table className="w-full border-collapse">
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => {
                    const isHeader = i === 0 || j === 0;
                    const isSelected = selectedCell?.row === i && selectedCell?.col === j;
                    const isInRange = selectedRange.start && selectedRange.end &&
                      i >= selectedRange.start.row && i <= selectedRange.end.row &&
                      j >= selectedRange.start.col && j <= selectedRange.end.col;
                    return (
                      <td
                        key={j}
                        onClick={() => handleCellClick(i, j)}
                        className={`border border-slate-200 p-2 text-sm min-w-[80px] ${
                          isHeader ? 'bg-slate-100 text-center text-slate-600 font-semibold' : 'cursor-pointer hover:bg-emerald-50'
                        } ${isSelected ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-50' : ''} ${isInRange && !isSelected ? 'bg-emerald-100' : ''}`}
                        style={{ height: '32px' }}
                      >
                        {isSelected && isEditing ? (
                          <input
                            ref={inputRef}
                            value={editValue}
                            onChange={handleCellChange}
                            onBlur={handleCellBlur}
                            onKeyDown={handleKeyDown}
                            className="w-full h-full outline-none bg-white px-1"
                          />
                        ) : (
                          <span className={j > 0 && i > 0 && cell ? 'text-right block text-slate-700' : ''}>{cell}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CodeMode() {
  const [code, setCode] = useState(`// 欢迎使用简化版 JavaScript 运行器
// 支持：数学运算、变量、console.log、if/else、for/while、函数

// 示例1：基础数学运算
let a = 10;
let b = 20;
let sum = a + b;
console.log("两数之和:", sum);

// 示例2：条件判断
let score = 85;
if (score >= 90) {
  console.log("优秀");
} else if (score >= 80) {
  console.log("良好");
} else {
  console.log("继续努力");
}

// 示例3：循环
console.log("for循环:");
for (let i = 1; i <= 5; i++) {
  console.log("第" + i + "次");
}

// 示例4：函数定义
function greet(name) {
  return "你好, " + name + "!";
}
console.log(greet("程序员"));

// 示例5：while循环
let count = 3;
while (count > 0) {
  console.log("倒计时:", count);
  count--;
}
console.log("发射!");`);

  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const runCode = () => {
    setOutput([]);
    setError('');
    const logs: string[] = [];

    const mockConsole = {
      log: (...args: any[]) => {
        logs.push(args.map(arg => String(arg)).join(' '));
      }
    };

    try {
      const wrappedCode = `
        (function(console) {
          ${code}
        })(mockConsole)
      `;

      const func = new Function('mockConsole', wrappedCode);
      func(mockConsole);
      setOutput(logs);
    } catch (err: any) {
      setError(err.message || '执行出错');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.js';
    a.click();
  };

  const uploadCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCode(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const getLineNumbers = () => {
    return code.split('\n').map((_, i) => i + 1);
  };

  return (
    <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
      <div className="bg-slate-800 text-slate-300 px-6 py-4 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          </div>
          <span className="ml-4 text-sm font-medium">JavaScript 运行器</span>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runCode}
            className="px-4 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700 transition text-sm font-medium text-white flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
            </svg>
            运行
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadCode}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition text-sm font-medium text-white"
          >
            保存
          </motion.button>
          <label className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition text-sm font-medium cursor-pointer">
            打开
            <input type="file" accept=".js" onChange={uploadCode} className="hidden" />
          </label>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row">
        <div className="flex flex-1">
          <div className="bg-slate-800 text-slate-500 py-4 px-3 text-right font-mono text-sm select-none border-r border-slate-700">
            {getLineNumbers().map(num => (
              <div key={num} className="leading-6 text-slate-400">{num}</div>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleChange}
            className="flex-1 bg-slate-900 text-slate-300 p-4 font-mono text-sm resize-none outline-none leading-6"
            style={{ minHeight: '400px' }}
            spellCheck={false}
          />
        </div>
        <div className="lg:w-80 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-700 p-4">
          <h3 className="text-slate-400 text-sm font-medium mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
            控制台输出
          </h3>
          <div className="bg-slate-900 rounded-lg p-3 min-h-[200px] font-mono text-sm">
            {error && (
              <div className="text-rose-400 mb-2">❌ {error}</div>
            )}
            {output.length === 0 && !error && (
              <div className="text-slate-500 italic">点击"运行"查看输出...</div>
            )}
            {output.map((line, i) => (
              <div key={i} className="text-emerald-400 mb-1">
                <span className="text-slate-500 mr-2">{i + 1}.</span>
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DocMode() {
  const [content, setContent] = useState('<h1>2024年第三季度工作总结</h1><p>本季度工作进展顺利...</p>');
  const [fontSize, setFontSize] = useState('16px');
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textColor, setTextColor] = useState('#334155');
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleFontSize = (size: string) => {
    setFontSize(size);
    execCommand('fontSize', size);
  };

  const handleFontFamily = (family: string) => {
    setFontFamily(family);
    execCommand('fontName', family);
  };

  const handleColor = (color: string) => {
    setTextColor(color);
    execCommand('foreColor', color);
  };

  const downloadDoc = () => {
    if (editorRef.current) {
      const blob = new Blob([editorRef.current.innerHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '文档.html';
      a.click();
    }
  };

  const uploadDoc = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setContent(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const insertHeading = (level: number) => {
    execCommand('formatBlock', `h${level}`);
  };

  const insertList = (ordered: boolean) => {
    execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList');
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {gameIcons.doc}
          <span className="font-bold text-lg">文档编辑器</span>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadDoc}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition text-sm font-medium"
          >
            保存
          </motion.button>
          <label className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition text-sm font-medium cursor-pointer">
            打开
            <input type="file" accept=".html,.txt,.md" onChange={uploadDoc} className="hidden" />
          </label>
        </div>
      </div>

      <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-2 flex-wrap">
        <select
          onChange={(e) => handleFontFamily(e.target.value)}
          className="px-2 py-1 rounded border border-slate-300 text-sm bg-white"
        >
          <option value="sans-serif">无衬线</option>
          <option value="serif">衬线</option>
          <option value="monospace">等宽</option>
          <option value="cursive">手写</option>
        </select>

        <select
          onChange={(e) => handleFontSize(e.target.value)}
          className="px-2 py-1 rounded border border-slate-300 text-sm bg-white"
        >
          <option value="1">小</option>
          <option value="3" selected>正常</option>
          <option value="5">大</option>
          <option value="7">特大</option>
        </select>

        <div className="h-6 w-px bg-slate-300 mx-1"></div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setIsBold(!isBold); execCommand('bold'); }}
          className={`px-3 py-1 rounded text-sm font-bold transition ${isBold ? 'bg-blue-500 text-white' : 'bg-white border border-slate-300'}`}
        >
          B
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setIsItalic(!isItalic); execCommand('italic'); }}
          className={`px-3 py-1 rounded text-sm italic transition ${isItalic ? 'bg-blue-500 text-white' : 'bg-white border border-slate-300'}`}
        >
          I
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setIsUnderline(!isUnderline); execCommand('underline'); }}
          className={`px-3 py-1 rounded text-sm underline transition ${isUnderline ? 'bg-blue-500 text-white' : 'bg-white border border-slate-300'}`}
        >
          U
        </motion.button>

        <div className="h-6 w-px bg-slate-300 mx-1"></div>

        <input
          type="color"
          value={textColor}
          onChange={(e) => handleColor(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-slate-300"
        />

        <div className="h-6 w-px bg-slate-300 mx-1"></div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => insertHeading(1)}
          className="px-3 py-1 rounded text-sm bg-white border border-slate-300 hover:bg-slate-50"
        >
          H1
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => insertHeading(2)}
          className="px-3 py-1 rounded text-sm bg-white border border-slate-300 hover:bg-slate-50"
        >
          H2
        </motion.button>

        <div className="h-6 w-px bg-slate-300 mx-1"></div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => insertList(false)}
          className="px-3 py-1 rounded text-sm bg-white border border-slate-300 hover:bg-slate-50"
        >
          • 列表
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => insertList(true)}
          className="px-3 py-1 rounded text-sm bg-white border border-slate-300 hover:bg-slate-50"
        >
          1. 列表
        </motion.button>

        <div className="h-6 w-px bg-slate-300 mx-1"></div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => execCommand('justifyLeft')}
          className="px-3 py-1 rounded text-sm bg-white border border-slate-300 hover:bg-slate-50"
        >
          左对齐
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => execCommand('justifyCenter')}
          className="px-3 py-1 rounded text-sm bg-white border border-slate-300 hover:bg-slate-50"
        >
          居中
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => execCommand('justifyRight')}
          className="px-3 py-1 rounded text-sm bg-white border border-slate-300 hover:bg-slate-50"
        >
          右对齐
        </motion.button>
      </div>

      <div className="p-8 max-w-4xl mx-auto">
        <div
          ref={editorRef}
          contentEditable
          onInput={() => setContent(editorRef.current?.innerHTML || '')}
          className="w-full min-h-[600px] p-6 text-slate-700 leading-relaxed outline-none border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          style={{ fontFamily, fontSize }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}

function CalculatorMode() {
  const [display, setDisplay] = useState('0');
  const [previous, setPrevious] = useState('');
  const [operation, setOperation] = useState('');
  const [newNumber, setNewNumber] = useState(true);
  const [history, setHistory] = useState<string[]>([]);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperation = (op: string) => {
    setOperation(op);
    setPrevious(display);
    setNewNumber(true);
  };

  const calculate = () => {
    const prev = parseFloat(previous);
    const current = parseFloat(display);
    let result = 0;

    switch (operation) {
      case '+': result = prev + current; break;
      case '-': result = prev - current; break;
      case '*': result = prev * current; break;
      case '/': result = current !== 0 ? prev / current : 0; break;
      case '^': result = Math.pow(prev, current); break;
    }

    const resultStr = String(result);
    setDisplay(resultStr);
    setHistory([`${previous} ${operation} ${display} = ${resultStr}`, ...history.slice(0, 9)]);
    setOperation('');
    setNewNumber(true);
  };

  const scientificCalc = (func: string) => {
    const current = parseFloat(display);
    let result = 0;
    switch (func) {
      case 'sin': result = Math.sin(current * Math.PI / 180); break;
      case 'cos': result = Math.cos(current * Math.PI / 180); break;
      case 'tan': result = Math.tan(current * Math.PI / 180); break;
      case 'log': result = Math.log10(current); break;
      case 'ln': result = Math.log(current); break;
      case 'sqrt': result = Math.sqrt(current); break;
      case 'square': result = current * current; break;
      case '1/x': result = 1 / current; break;
      case 'π': result = Math.PI; break;
      case 'e': result = Math.E; break;
    }
    setDisplay(String(Number(result.toFixed(8))));
    setNewNumber(true);
  };

  const clear = () => {
    setDisplay('0');
    setPrevious('');
    setOperation('');
    setNewNumber(true);
  };

  const clearHistory = () => setHistory([]);

  const basicButtons = [
    ['C', '←', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '=']
  ];

  const scientificButtons = [
    ['sin', 'cos', 'tan', 'π'],
    ['log', 'ln', '√', 'x²'],
    ['1/x', 'e', '^', '()']
  ];

  const getButtonClass = (btn: string) => {
    if (btn === 'C') return 'bg-rose-500 hover:bg-rose-600 text-white';
    if (btn === '=') return 'bg-emerald-500 hover:bg-emerald-600 text-white';
    if (['+', '-', '×', '÷', '%', '←', '^'].includes(btn)) return 'bg-amber-500 hover:bg-amber-600 text-white';
    if (['sin', 'cos', 'tan', 'log', 'ln', '√', 'x²', '1/x', 'π', 'e'].includes(btn)) return 'bg-violet-500 hover:bg-violet-600 text-white text-sm';
    return 'bg-slate-100 hover:bg-slate-200 text-slate-700';
  };

  const handleClick = (btn: string) => {
    if (btn >= '0' && btn <= '9') handleNumber(btn);
    else if (btn === '.') handleNumber('.');
    else if (btn === 'C') clear();
    else if (btn === '=') calculate();
    else if (btn === '←') setDisplay(display.slice(0, -1) || '0');
    else if (btn === '÷') handleOperation('/');
    else if (btn === '×') handleOperation('*');
    else if (btn === '√') scientificCalc('sqrt');
    else if (btn === 'x²') scientificCalc('square');
    else if (['sin', 'cos', 'tan', 'log', 'ln', '1/x', 'π', 'e'].includes(btn)) scientificCalc(btn);
    else if (btn === '^') handleOperation('^');
    else handleOperation(btn);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-6 py-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          {gameIcons.calculator}
          科学计算器
        </h2>
      </div>
      <div className="p-6 flex gap-6">
        <div className="flex-1">
          <div className="bg-slate-100 rounded-xl p-4 mb-4 text-right">
            <div className="text-slate-400 text-sm mb-1">{previous} {operation}</div>
            <div className="text-3xl font-bold text-slate-800">{display}</div>
          </div>

          <div className="mb-3">
            <div className="grid grid-cols-4 gap-2">
              {scientificButtons.flat().map((btn, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleClick(btn)}
                  className={`${getButtonClass(btn)} py-3 rounded-xl font-semibold transition shadow-sm`}
                >
                  {btn}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {basicButtons.flat().map((btn, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleClick(btn)}
                className={`${getButtonClass(btn)} py-4 rounded-xl font-semibold text-lg transition shadow-sm ${btn === '0' ? 'col-span-2' : ''}`}
              >
                {btn}
              </motion.button>
            ))}
          </div>
        </div>

        {history.length > 0 && (
          <div className="w-48 bg-slate-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-700">历史记录</h3>
              <button onClick={clearHistory} className="text-xs text-rose-500 hover:text-rose-600">清空</button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {history.map((item, i) => (
                <div key={i} className="text-sm text-slate-600 border-b border-slate-200 pb-1">{item}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ClockMode() {
  const [time, setTime] = useState(new Date());
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 10);
      }, 10);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setElapsed(0);
    setLaps([]);
  };
  const addLap = () => setLaps([...laps, elapsed]);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-w-md mx-auto">
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          {gameIcons.clock}
          时钟 & 计时器
        </h2>
      </div>
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="text-5xl font-bold text-slate-800 mb-2">
            {time.toLocaleTimeString('zh-CN', { hour12: false })}
          </div>
          <div className="text-slate-500">
            {time.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <div className="text-center mb-4">
            <div className="text-4xl font-mono font-bold text-slate-800 mb-4">{formatTime(elapsed)}</div>
            <div className="flex justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTimer}
                className={`px-6 py-2 rounded-xl font-semibold text-white transition ${isRunning ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
              >
                {isRunning ? '暂停' : '开始'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addLap}
                disabled={!isRunning}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white rounded-xl font-semibold transition"
              >
                计次
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetTimer}
                className="px-6 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-xl font-semibold transition"
              >
                重置
              </motion.button>
            </div>
          </div>

          {laps.length > 0 && (
            <div className="mt-4 max-h-40 overflow-y-auto">
              <h3 className="text-sm font-semibold text-slate-600 mb-2">计次记录</h3>
              {laps.map((lap, i) => (
                <div key={i} className="flex justify-between py-1 text-sm">
                  <span className="text-slate-500">计次 {i + 1}</span>
                  <span className="font-mono text-slate-700">{formatTime(lap)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GameCard({ title, icon, children, score, onReset, scoreLabel = '得分' }: { title: string; icon: JSX.Element; children: React.ReactNode; score?: number; onReset?: () => void; scoreLabel?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-white">{icon}</span>
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        <div className="flex items-center gap-4">
          {score !== undefined && (
            <span className="text-lg font-bold bg-white/20 backdrop-blur-sm px-4 py-1 rounded-lg">
              {scoreLabel}: {score}
            </span>
          )}
          {onReset && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onReset}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition text-sm font-medium"
            >
              重新开始
            </motion.button>
          )}
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

function SnakeGame() {
  const [gameState, setGameState] = useState<GameState>({
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15 },
    direction: { x: 1, y: 0 },
    gameOver: false,
    score: 0,
  });
  const [isPlaying, setIsPlaying] = useState(false);

  const resetGame = () => {
    setGameState({
      snake: [{ x: 10, y: 10 }],
      food: { x: 15, y: 15 },
      direction: { x: 1, y: 0 },
      gameOver: false,
      score: 0,
    });
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!isPlaying || gameState.gameOver) return;

    const gameLoop = setInterval(() => {
      setGameState(prev => {
        const newSnake = [...prev.snake];
        const head = { ...newSnake[0] };
        head.x += prev.direction.x;
        head.y += prev.direction.y;

        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          return { ...prev, gameOver: true };
        }

        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          return { ...prev, gameOver: true };
        }

        newSnake.unshift(head);

        let newFood = prev.food;
        let newScore = prev.score;
        if (head.x === prev.food.x && head.y === prev.food.y) {
          newScore += 10;
          newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
          };
        } else {
          newSnake.pop();
        }

        return {
          ...prev,
          snake: newSnake,
          food: newFood,
          score: newScore,
        };
      });
    }, 150);

    return () => clearInterval(gameLoop);
  }, [isPlaying, gameState.gameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      switch (e.key) {
        case 'ArrowUp':
          setGameState(prev => ({ ...prev, direction: { x: 0, y: -1 } }));
          break;
        case 'ArrowDown':
          setGameState(prev => ({ ...prev, direction: { x: 0, y: 1 } }));
          break;
        case 'ArrowLeft':
          setGameState(prev => ({ ...prev, direction: { x: -1, y: 0 } }));
          break;
        case 'ArrowRight':
          setGameState(prev => ({ ...prev, direction: { x: 1, y: 0 } }));
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  return (
    <GameCard title="贪吃蛇" icon={gameIcons.snake} score={gameState.score} onReset={resetGame}>
      <div className="flex flex-col items-center">
        <div
          className="relative bg-slate-900 rounded-xl shadow-2xl mx-auto overflow-hidden"
          style={{ width: GRID_SIZE * CELL_SIZE + 8, height: GRID_SIZE * CELL_SIZE + 8, padding: '4px' }}
        >
          {gameState.snake.map((segment, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-sm shadow-lg"
              style={{
                left: segment.x * CELL_SIZE + 4,
                top: segment.y * CELL_SIZE + 4,
                width: CELL_SIZE - 1,
                height: CELL_SIZE - 1,
              }}
            />
          ))}
          <motion.div
            className="absolute bg-gradient-to-br from-rose-400 to-rose-600 rounded-full shadow-lg"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{
              left: gameState.food.x * CELL_SIZE + 6,
              top: gameState.food.y * CELL_SIZE + 6,
              width: CELL_SIZE - 5,
              height: CELL_SIZE - 5,
            }}
          />
        </div>

        {!isPlaying && !gameState.gameOver && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetGame}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition"
          >
            开始游戏
          </motion.button>
        )}

        {gameState.gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mt-6 p-6 bg-rose-50 rounded-xl border border-rose-200"
          >
            <p className="text-rose-600 font-bold text-2xl mb-2">游戏结束!</p>
            <p className="text-slate-600">最终得分: {gameState.score}</p>
          </motion.div>
        )}

        <p className="text-center text-slate-500 mt-6 text-sm">使用方向键控制蛇的移动</p>
      </div>
    </GameCard>
  );
}

function Game2048() {
  const [board, setBoard] = useState<number[][]>(() => createEmptyBoard());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'info'; message: string } | null>(null);
  const [bestScore, setBestScore] = useState(0);

  const showFeedback = (type: 'success' | 'info', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 1500);
  };

  function createEmptyBoard(): number[][] {
    const board = Array(4).fill(null).map(() => Array(4).fill(0));
    addRandomTile(board);
    addRandomTile(board);
    return board;
  }

  function addRandomTile(board: number[][]): void {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) emptyCells.push({ i, j });
      }
    }
    if (emptyCells.length > 0) {
      const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      board[i][j] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver && !won) return;

    const newBoard = board.map(row => [...row]);
    let moved = false;
    let newScore = score;
    let merged2048 = false;

    const slide = (arr: number[]): [number[], number] => {
      const filtered = arr.filter(val => val !== 0);
      let scoreGain = 0;
      for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i + 1]) {
          filtered[i] *= 2;
          if (filtered[i] === 2048) merged2048 = true;
          scoreGain += filtered[i];
          filtered.splice(i + 1, 1);
        }
      }
      while (filtered.length < 4) filtered.push(0);
      return [filtered, scoreGain];
    };

    if (direction === 'left' || direction === 'right') {
      for (let i = 0; i < 4; i++) {
        const row = direction === 'left' ? newBoard[i] : [...newBoard[i]].reverse();
        const [newRow, gain] = slide(row);
        if (direction === 'right') newRow.reverse();
        if (JSON.stringify(newRow) !== JSON.stringify(newBoard[i])) moved = true;
        newBoard[i] = newRow;
        newScore += gain;
      }
    } else {
      for (let j = 0; j < 4; j++) {
        const col = [];
        for (let i = 0; i < 4; i++) col.push(newBoard[i][j]);
        const arr = direction === 'up' ? col : col.reverse();
        const [newCol, gain] = slide(arr);
        if (direction === 'down') newCol.reverse();
        for (let i = 0; i < 4; i++) {
          if (newBoard[i][j] !== newCol[i]) moved = true;
          newBoard[i][j] = newCol[i];
        }
        newScore += gain;
      }
    }

    if (moved) {
      addRandomTile(newBoard);
      setBoard(newBoard);
      setScore(newScore);
      if (newScore > bestScore) setBestScore(newScore);

      if (merged2048 && !won) {
        setWon(true);
        showFeedback('success', '🎉 恭喜！你合成出了 2048！');
      }

      let canMove = false;
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (newBoard[i][j] === 0) canMove = true;
          if (j < 3 && newBoard[i][j] === newBoard[i][j + 1]) canMove = true;
          if (i < 3 && newBoard[i][j] === newBoard[i + 1][j]) canMove = true;
        }
      }
      if (!canMove) {
        setGameOver(true);
      }
    }
  }, [board, score, gameOver, won, bestScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': move('up'); break;
        case 'ArrowDown': move('down'); break;
        case 'ArrowLeft': move('left'); break;
        case 'ArrowRight': move('right'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setScore(0);
    setGameOver(false);
    setWon(false);
    setShowHelp(false);
    showFeedback('info', '新游戏开始！加油 💪');
  };

  const getTileColor = (value: number): string => {
    const colors: { [key: number]: string } = {
      0: 'bg-slate-200',
      2: 'bg-slate-100 text-slate-700',
      4: 'bg-slate-200 text-slate-700',
      8: 'bg-orange-200 text-slate-700',
      16: 'bg-orange-300 text-white',
      32: 'bg-orange-400 text-white',
      64: 'bg-orange-500 text-white',
      128: 'bg-amber-300 text-slate-700',
      256: 'bg-amber-400 text-slate-700',
      512: 'bg-amber-500 text-white',
      1024: 'bg-amber-600 text-white',
      2048: 'bg-emerald-500 text-white',
    };
    return colors[value] || 'bg-emerald-600 text-white';
  };

  return (
    <GameCard title="2048" icon={gameIcons.game2048} score={score} onReset={resetGame}>
      <div className="flex flex-col items-center">
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200 max-w-sm"
          >
            <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
              <span>💡</span> 游戏说明
            </h4>
            <ul className="text-sm text-orange-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-bold">⌨️ 操作：</span>
                <span>使用方向键 ↑↓←→ 移动所有方块</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">🎯 规则：</span>
                <span>相同数字的方块碰撞时会合并相加</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">🏆 目标：</span>
                <span>合成出 2048 方块即可获胜！</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">⚠️ 注意：</span>
                <span>当无法移动时游戏结束</span>
              </li>
            </ul>
          </motion.div>
        )}

        <div className="flex gap-4 mb-4">
          <div className="bg-slate-100 px-4 py-2 rounded-lg">
            <span className="text-slate-500 text-xs">得分</span>
            <span className="text-slate-800 font-bold ml-2">{score}</span>
          </div>
          <div className="bg-slate-100 px-4 py-2 rounded-lg">
            <span className="text-slate-500 text-xs">最高分</span>
            <span className="text-amber-600 font-bold ml-2">{bestScore}</span>
          </div>
        </div>

        <div className="bg-slate-300 p-3 rounded-2xl shadow-inner" style={{ width: 280 }}>
          {board.map((row, i) => (
            <div key={i} className="flex">
              {row.map((cell, j) => (
                <motion.div
                  key={j}
                  initial={cell !== 0 ? { scale: 0 } : {}}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`w-14 h-14 m-1 rounded-xl flex items-center justify-center text-2xl font-bold shadow-sm ${getTileColor(cell)}`}
                >
                  {cell !== 0 && cell}
                </motion.div>
              ))}
            </div>
          ))}
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-4 px-4 py-2 rounded-lg font-medium text-sm ${
                feedback.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'
              }`}
            >
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>

        {gameOver && !won && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mt-6 p-6 bg-rose-50 rounded-xl border border-rose-200"
          >
            <p className="text-rose-600 font-bold text-2xl mb-2">😢 游戏结束!</p>
            <p className="text-slate-600">没有可移动的方块了</p>
            <p className="text-slate-500 text-sm mt-1">最终得分: {score}</p>
          </motion.div>
        )}

        {won && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mt-6 p-6 bg-emerald-50 rounded-xl border border-emerald-200"
          >
            <p className="text-emerald-600 font-bold text-2xl mb-2">🎉 恭喜你获胜!</p>
            <p className="text-slate-600">你成功合成出了 2048！</p>
            <p className="text-slate-500 text-sm mt-1">可以继续挑战更高分数</p>
          </motion.div>
        )}

        <div className="flex gap-2 mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => move('up')}
            className="w-12 h-12 bg-slate-200 hover:bg-slate-300 rounded-lg flex items-center justify-center text-slate-600 font-bold"
          >
            ↑
          </motion.button>
        </div>
        <div className="flex gap-2 mt-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => move('left')}
            className="w-12 h-12 bg-slate-200 hover:bg-slate-300 rounded-lg flex items-center justify-center text-slate-600 font-bold"
          >
            ←
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => move('down')}
            className="w-12 h-12 bg-slate-200 hover:bg-slate-300 rounded-lg flex items-center justify-center text-slate-600 font-bold"
          >
            ↓
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => move('right')}
            className="w-12 h-12 bg-slate-200 hover:bg-slate-300 rounded-lg flex items-center justify-center text-slate-600 font-bold"
          >
            →
          </motion.button>
        </div>

        <p className="text-center text-slate-500 mt-4 text-sm">💡 点击按钮或使用键盘方向键移动</p>
      </div>
    </GameCard>
  );
}

const TETRIS_SHAPES = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[1, 1, 1], [0, 1, 0]],
  [[1, 1, 1], [1, 0, 0]],
  [[1, 1, 1], [0, 0, 1]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
];

function TetrisGame() {
  const BOARD_WIDTH = 10;
  const BOARD_HEIGHT = 20;

  const [board, setBoard] = useState<number[][]>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
  );
  const [currentPiece, setCurrentPiece] = useState<{ shape: number[][]; x: number; y: number; color: number } | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const spawnPiece = () => {
    const shapeIndex = Math.floor(Math.random() * TETRIS_SHAPES.length);
    const newPiece = {
      shape: TETRIS_SHAPES[shapeIndex],
      x: Math.floor(BOARD_WIDTH / 2) - 1,
      y: 0,
      color: shapeIndex + 1,
    };
    
    if (isCollision(newPiece.shape, newPiece.x, newPiece.y)) {
      setGameOver(true);
      setIsPlaying(false);
    } else {
      setCurrentPiece(newPiece);
    }
  };

  const isCollision = (shape: number[][], x: number, y: number) => {
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j]) {
          const newX = x + j;
          const newY = y + i;
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return true;
          if (newY >= 0 && board[newY][newX]) return true;
        }
      }
    }
    return false;
  };

  const mergePiece = () => {
    if (!currentPiece) return;
    const newBoard = board.map(row => [...row]);
    currentPiece.shape.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell && currentPiece.y + i >= 0) {
          newBoard[currentPiece.y + i][currentPiece.x + j] = currentPiece.color;
        }
      });
    });
    setBoard(newBoard);
    clearLines(newBoard);
    spawnPiece();
  };

  const clearLines = (currentBoard: number[][]) => {
    let linesCleared = 0;
    const newBoard = currentBoard.filter(row => {
      if (row.every(cell => cell !== 0)) {
        linesCleared++;
        return false;
      }
      return true;
    });
    
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }
    
    setBoard(newBoard);
    setScore(prev => prev + linesCleared * 100);
  };

  const rotatePiece = () => {
    if (!currentPiece) return;
    const rotated = currentPiece.shape[0].map((_, i) =>
      currentPiece.shape.map(row => row[i]).reverse()
    );
    if (!isCollision(rotated, currentPiece.x, currentPiece.y)) {
      setCurrentPiece({ ...currentPiece, shape: rotated });
    }
  };

  const movePiece = (dx: number, dy: number) => {
    if (!currentPiece) return;
    const newX = currentPiece.x + dx;
    const newY = currentPiece.y + dy;
    if (!isCollision(currentPiece.shape, newX, newY)) {
      setCurrentPiece({ ...currentPiece, x: newX, y: newY });
    } else if (dy > 0) {
      mergePiece();
    }
  };

  useEffect(() => {
    if (!isPlaying || gameOver) return;
    const gameLoop = setInterval(() => {
      movePiece(0, 1);
    }, 500);
    return () => clearInterval(gameLoop);
  }, [isPlaying, gameOver, currentPiece, board]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      switch (e.key) {
        case 'ArrowLeft': movePiece(-1, 0); break;
        case 'ArrowRight': movePiece(1, 0); break;
        case 'ArrowDown': movePiece(0, 1); break;
        case 'ArrowUp': rotatePiece(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentPiece, board]);

  const startGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    spawnPiece();
  };

  const getDisplayBoard = () => {
    const display = board.map(row => [...row]);
    if (currentPiece) {
      currentPiece.shape.forEach((row, i) => {
        row.forEach((cell, j) => {
          if (cell && currentPiece.y + i >= 0) {
            display[currentPiece.y + i][currentPiece.x + j] = currentPiece.color;
          }
        });
      });
    }
    return display;
  };

  const getColorClass = (value: number) => {
    const colors = ['bg-slate-800', 'bg-cyan-400', 'bg-yellow-400', 'bg-violet-400', 'bg-orange-400', 'bg-blue-400', 'bg-emerald-400', 'bg-rose-400'];
    return colors[value] || 'bg-slate-800';
  };

  return (
    <GameCard title="俄罗斯方块" icon={gameIcons.tetris} score={score} onReset={startGame}>
      <div className="flex flex-col items-center">
        <div className="bg-slate-900 p-3 rounded-2xl shadow-2xl" style={{ width: 228 }}>
          {getDisplayBoard().map((row, i) => (
            <div key={i} className="flex">
              {row.map((cell, j) => (
                <div
                  key={j}
                  className={`w-5 h-5 m-px rounded-sm ${getColorClass(cell)}`}
                />
              ))}
            </div>
          ))}
        </div>

        {!isPlaying && !gameOver && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="mt-6 px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition"
          >
            开始游戏
          </motion.button>
        )}

        {gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mt-6 p-6 bg-rose-50 rounded-xl border border-rose-200"
          >
            <p className="text-rose-600 font-bold text-2xl mb-2">游戏结束!</p>
            <p className="text-slate-600">最终得分: {score}</p>
          </motion.div>
        )}

        <p className="text-center text-slate-500 mt-6 text-sm">方向键移动，上键旋转</p>
      </div>
    </GameCard>
  );
}

function MinesweeperGame() {
  const ROWS = 10;
  const COLS = 10;
  const MINES = 10;

  const [board, setBoard] = useState<any[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [flags, setFlags] = useState(0);
  const [showHelp, setShowHelp] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error' | 'info', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 2000);
  };

  const initBoard = () => {
    const newBoard = [];
    for (let i = 0; i < ROWS; i++) {
      const row = [];
      for (let j = 0; j < COLS; j++) {
        row.push({ isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 });
      }
      newBoard.push(row);
    }

    let minesPlaced = 0;
    while (minesPlaced < MINES) {
      const row = Math.floor(Math.random() * ROWS);
      const col = Math.floor(Math.random() * COLS);
      if (!newBoard[row][col].isMine) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }

    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (!newBoard[i][j].isMine) {
          let count = 0;
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              const ni = i + di;
              const nj = j + dj;
              if (ni >= 0 && ni < ROWS && nj >= 0 && nj < COLS && newBoard[ni][nj].isMine) {
                count++;
              }
            }
          }
          newBoard[i][j].neighborMines = count;
        }
      }
    }

    setBoard(newBoard);
    setGameOver(false);
    setWon(false);
    setFlags(0);
    setShowHelp(false);
    showFeedback('info', '游戏开始！小心地雷 💣');
  };

  const revealCell = (row: number, col: number) => {
    if (gameOver || won || board[row][col].isRevealed || board[row][col].isFlagged) return;

    const newBoard = board.map(r => r.map(c => ({ ...c })));

    if (newBoard[row][col].isMine) {
      newBoard[row][col].isRevealed = true;
      setBoard(newBoard);
      setGameOver(true);
      showFeedback('error', '💥 砰！你踩到地雷了！');
      return;
    }

    const reveal = (r: number, c: number) => {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || newBoard[r][c].isRevealed || newBoard[r][c].isFlagged) return;
      newBoard[r][c].isRevealed = true;
      if (newBoard[r][c].neighborMines === 0) {
        for (let di = -1; di <= 1; di++) {
          for (let dj = -1; dj <= 1; dj++) {
            reveal(r + di, c + dj);
          }
        }
      }
    };

    reveal(row, col);
    setBoard(newBoard);

    const revealed = newBoard.flat().filter(c => c.isRevealed).length;
    if (revealed === ROWS * COLS - MINES) {
      setWon(true);
      showFeedback('success', '🎉 太棒了！你成功排除了所有地雷！');
    }
  };

  const toggleFlag = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (gameOver || won || board[row][col].isRevealed) return;

    const newBoard = board.map(r => r.map(c => ({ ...c })));
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
    setBoard(newBoard);
    setFlags(prev => {
      const newFlags = newBoard[row][col].isFlagged ? prev + 1 : prev - 1;
      return newFlags;
    });

    if (newBoard[row][col].isFlagged) {
      showFeedback('info', '🚩 标记成功！');
    }
  };

  const getCellContent = (cell: any) => {
    if (cell.isFlagged) return '🚩';
    if (!cell.isRevealed) return '';
    if (cell.isMine) return '💣';
    if (cell.neighborMines === 0) return '';
    return cell.neighborMines;
  };

  const getCellClass = (cell: any) => {
    if (cell.isRevealed) {
      if (cell.isMine) return 'bg-rose-500';
      return 'bg-slate-200';
    }
    return 'bg-slate-400 hover:bg-slate-350';
  };

  const getNumberColor = (num: number) => {
    const colors: { [key: number]: string } = {
      1: 'text-blue-600',
      2: 'text-emerald-600',
      3: 'text-rose-600',
      4: 'text-violet-600',
      5: 'text-amber-600',
      6: 'text-cyan-600',
      7: 'text-slate-800',
      8: 'text-slate-500',
    };
    return colors[num] || 'text-slate-700';
  };

  return (
    <GameCard title="扫雷" icon={gameIcons.minesweeper} score={MINES - flags} scoreLabel="剩余雷数" onReset={initBoard}>
      <div className="flex flex-col items-center">
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-5 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200 max-w-sm"
          >
            <h4 className="font-bold text-violet-800 mb-3 flex items-center gap-2">
              <span>💡</span> 游戏说明
            </h4>
            <ul className="text-sm text-violet-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-bold">🖱️ 左键点击：</span>
                <span>揭开格子，小心不要点到地雷！</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">🚩 右键点击：</span>
                <span>标记/取消标记疑似地雷的位置</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">🎯 目标：</span>
                <span>揭开所有安全格子，避开 {MINES} 颗地雷</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">🔢 数字提示：</span>
                <span>周围8格中地雷的数量</span>
              </li>
            </ul>
          </motion.div>
        )}

        {board.length === 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={initBoard}
            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition"
          >
            开始游戏
          </motion.button>
        )}

        {board.length > 0 && (
          <div className="inline-block bg-slate-200 p-3 rounded-2xl shadow-inner">
            {board.map((row, i) => (
              <div key={i} className="flex">
                {row.map((cell, j) => (
                  <motion.div
                    key={j}
                    onClick={() => revealCell(i, j)}
                    onContextMenu={(e) => toggleFlag(e, i, j)}
                    whileHover={!cell.isRevealed ? { scale: 1.1 } : {}}
                    whileTap={!cell.isRevealed ? { scale: 0.95 } : {}}
                    className={`w-8 h-8 m-px flex items-center justify-center text-sm font-bold cursor-pointer rounded-sm transition-colors ${getCellClass(cell)} ${cell.isRevealed && !cell.isMine && cell.neighborMines > 0 ? getNumberColor(cell.neighborMines) : ''}`}
                  >
                    {getCellContent(cell)}
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-4 px-4 py-2 rounded-lg font-medium text-sm ${
                feedback.type === 'success' ? 'bg-emerald-100 text-emerald-700' :
                feedback.type === 'error' ? 'bg-rose-100 text-rose-700' :
                'bg-sky-100 text-sky-700'
              }`}
            >
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>

        {gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mt-6 p-6 bg-rose-50 rounded-xl border border-rose-200"
          >
            <p className="text-rose-600 font-bold text-2xl mb-2">💥 游戏结束！</p>
            <p className="text-slate-600">你踩到地雷了，下次小心点！</p>
          </motion.div>
        )}
        {won && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mt-6 p-6 bg-emerald-50 rounded-xl border border-emerald-200"
          >
            <p className="text-emerald-600 font-bold text-2xl mb-2">🎉 恭喜你赢了！</p>
            <p className="text-slate-600">你成功排除了所有地雷，太厉害了！</p>
          </motion.div>
        )}

        <p className="text-center text-slate-500 mt-6 text-sm">💡 左键揭开 | 右键标记 | 目标：找出所有 {MINES} 颗地雷</p>
      </div>
    </GameCard>
  );
}

function GomokuGame() {
  const BOARD_SIZE = 15;

  const [board, setBoard] = useState<number[][]>(() =>
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0))
  );
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [winner, setWinner] = useState<number | null>(null);
  const [showHelp, setShowHelp] = useState(true);
  const [winningLine, setWinningLine] = useState<[number, number][]>([]);
  const [lastMove, setLastMove] = useState<[number, number] | null>(null);

  const checkWin = (row: number, col: number, player: number): [number, number][] | null => {
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];

    for (const [dr, dc] of directions) {
      let count = 1;
      const line: [number, number][] = [[row, col]];

      for (let i = 1; i < 5; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
          count++;
          line.push([r, c]);
        } else break;
      }

      for (let i = 1; i < 5; i++) {
        const r = row - dr * i;
        const c = col - dc * i;
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
          count++;
          line.push([r, c]);
        } else break;
      }

      if (count >= 5) return line;
    }
    return null;
  };

  const handleClick = (row: number, col: number) => {
    if (board[row][col] !== 0 || winner) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);
    setLastMove([row, col]);

    const winLine = checkWin(row, col, currentPlayer);
    if (winLine) {
      setWinner(currentPlayer);
      setWinningLine(winLine);
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  };

  const resetGame = () => {
    setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0)));
    setCurrentPlayer(1);
    setWinner(null);
    setWinningLine([]);
    setLastMove(null);
    setShowHelp(false);
  };

  const isWinningCell = (row: number, col: number) => {
    return winningLine.some(([r, c]) => r === row && c === col);
  };

  const isLastMove = (row: number, col: number) => {
    return lastMove && lastMove[0] === row && lastMove[1] === col;
  };

  return (
    <GameCard title="五子棋" icon={gameIcons.gomoku} onReset={resetGame}>
      <div className="flex flex-col items-center">
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 max-w-sm"
          >
            <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
              <span>💡</span> 游戏说明
            </h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li className="flex items-start gap-2">
                <span className="font-bold">🎯 目标：</span>
                <span>在棋盘上连成五子（横、竖、斜）即可获胜</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">⚫⚪ 规则：</span>
                <span>黑棋先行，双方轮流落子</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">🖱️ 操作：</span>
                <span>点击棋盘交叉点落子</span>
              </li>
            </ul>
          </motion.div>
        )}

        <div className="mb-3">
          {winner ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <span className="text-2xl font-bold text-emerald-600">
                {winner === 1 ? '🎉 黑棋获胜！' : '🎉 白棋获胜！'}
              </span>
              <p className="text-slate-500 text-sm mt-1">五子连珠，精彩对局！</p>
            </motion.div>
          ) : (
            <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
              <span className="text-slate-500 text-sm">当前回合</span>
              <span className="text-lg font-medium text-slate-700 flex items-center gap-2">
                {currentPlayer === 1 ? (
                  <><span className="w-4 h-4 rounded-full bg-slate-900"></span> 黑棋</>
                ) : (
                  <><span className="w-4 h-4 rounded-full bg-slate-100 border-2 border-slate-300"></span> 白棋</>
                )}
              </span>
            </div>
          )}
        </div>

        <div className="inline-block bg-amber-100 p-2 rounded-xl shadow-inner">
          <div className="relative">
            {board.map((row, i) => (
              <div key={i} className="flex">
                {row.map((cell, j) => (
                  <motion.div
                    key={j}
                    onClick={() => handleClick(i, j)}
                    whileHover={cell === 0 && !winner ? { scale: 1.05 } : {}}
                    className={`w-5 h-5 flex items-center justify-center cursor-pointer transition relative ${
                      isWinningCell(i, j) ? 'bg-emerald-300' : 'hover:bg-amber-200'
                    }`}
                    style={{
                      backgroundImage: 'linear-gradient(#d4a574 1px, transparent 1px), linear-gradient(90deg, #d4a574 1px, transparent 1px)',
                      backgroundSize: '100% 100%, 100% 100%',
                      backgroundPosition: 'center, center',
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-full h-full"
                        style={{
                          borderRight: j < BOARD_SIZE - 1 ? '1px solid #d4a574' : 'none',
                          borderBottom: i < BOARD_SIZE - 1 ? '1px solid #d4a574' : 'none',
                        }}
                      />
                    </div>
                    {cell === 1 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={`w-4 h-4 rounded-full bg-slate-900 shadow-md z-10 ${isLastMove(i, j) ? 'ring-2 ring-emerald-400' : ''}`}
                      />
                    )}
                    {cell === 2 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={`w-4 h-4 rounded-full bg-slate-100 border border-slate-300 shadow-md z-10 ${isLastMove(i, j) ? 'ring-2 ring-emerald-400' : ''}`}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-slate-900"></span> 黑棋
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-slate-100 border border-slate-300"></span> 白棋
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-emerald-300"></span> 获胜连线
          </span>
        </div>

        <p className="text-center text-slate-500 mt-3 text-sm">💡 点击交叉点落子，五子连珠获胜</p>
      </div>
    </GameCard>
  );
}

function RelaxMode({ onEnterFullscreen, onExitFullscreen, isFullscreen }: { onEnterFullscreen?: () => void; onExitFullscreen?: () => void; isFullscreen?: boolean }) {
  const [url, setUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [error, setError] = useState('');
  const [joke, setJoke] = useState('');

  const jokes = [
    '程序员最讨厌的四件事：1. 写注释 2. 写文档 3. 别人不写注释 4. 别人不写文档',
    '为什么程序员总是分不清圣诞节和万圣节？因为 Oct 31 == Dec 25',
    '一个程序员走进酒吧，举起双手说："我要一杯啤酒！" 酒保说："你确定吗？" 程序员说："我确定！" 然后酒保给了他两杯。',
    '程序员面试。面试官问："你有什么缺点？" 程序员说："我比较固执。" 面试官说："能举个例子吗？" 程序员说："不能。"',
    '为什么程序员喜欢黑暗？因为光明会暴露Bug。',
    '产品经理："这个需求很简单，怎么实现我不管。" 程序员："那你来当程序员吧。"',
    '程序员的三观：世界观、人生观、价值观。还有最重要的：版本观。',
  ];

  const getRandomJoke = () => {
    setJoke(jokes[Math.floor(Math.random() * jokes.length)]);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let processedUrl = url.trim();
    if (!processedUrl) {
      setError('请输入网址');
      return;
    }

    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }

    try {
      new URL(processedUrl);
      setCurrentUrl(processedUrl);
    } catch {
      setError('请输入有效的网址');
    }
  };

  const quickLinks = [
    { name: 'Bilibili', url: 'https://www.bilibili.com' },
    { name: '微博', url: 'https://weibo.com' },
    { name: 'Wikipedia', url: 'https://en.wikipedia.org' },
    { name: 'PCjs Machines', url: 'https://www.pcjs.org' },
  ];

  if (isFullscreen && currentUrl) {
    return (
      <div
        className="fixed top-0 right-0 bottom-0 z-40 bg-white"
        style={{ left: '280px' }}
      >
        <div className="h-full flex flex-col">
          <div className="bg-slate-100 px-4 py-2 flex items-center justify-between border-b border-slate-200">
            <span className="text-sm text-slate-600 truncate flex-1">{currentUrl}</span>
            <div className="flex items-center gap-2">
              {onExitFullscreen && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onExitFullscreen}
                  className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-medium transition flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  退出全屏
                </motion.button>
              )}
            </div>
          </div>
          <div className="flex-1 relative">
            <iframe
              id="web-iframe"
              src={currentUrl}
              className="w-full h-full"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              title="网页浏览"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-6 py-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          {gameIcons.relax}
          放松时刻
        </h2>
      </div>
      <div className="p-6">
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
            <span>🌐</span>
            网页浏览
          </h3>

          <form onSubmit={handleUrlSubmit} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="输入网址，如 bilibili.com"
                className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition whitespace-nowrap"
              >
                访问
              </motion.button>
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-rose-500 text-sm mt-2"
              >
                {error}
              </motion.p>
            )}
          </form>

          <div className="flex flex-wrap gap-2 mb-4">
            {quickLinks.map((link) => (
              <motion.button
                key={link.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setUrl(link.url);
                  setCurrentUrl(link.url);
                  setError('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition"
              >
                {link.name}
              </motion.button>
            ))}
          </div>

          {currentUrl && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50"
            >
              <div className="bg-slate-100 px-4 py-2 flex items-center justify-between border-b border-slate-200">
                <span className="text-sm text-slate-600 truncate flex-1">{currentUrl}</span>
                <div className="flex items-center gap-2">
                  {onEnterFullscreen && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onEnterFullscreen}
                      className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-medium transition flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      全屏
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentUrl('')}
                    className="text-slate-400 hover:text-rose-500 transition"
                  >
                    ✕
                  </motion.button>
                </div>
              </div>
              <div className="relative" style={{ height: '400px' }}>
                <iframe
                  id="web-iframe"
                  src={currentUrl}
                  className="w-full h-full"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  title="网页浏览"
                />
              </div>
            </motion.div>
          )}

          {!currentUrl && (
            <div className="border border-slate-200 rounded-xl p-8 text-center bg-slate-50">
              <div className="text-4xl mb-3">🌐</div>
              <p className="text-slate-500">输入网址或点击快捷链接开始浏览</p>
              <p className="text-slate-400 text-sm mt-2">注意：部分网站可能因安全策略无法嵌入显示</p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold mb-4 text-center text-slate-700 flex items-center justify-center gap-2">
            <span>😄</span>
            程序员笑话
          </h3>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={getRandomJoke}
            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition mb-4"
          >
            讲个笑话
          </motion.button>
          <AnimatePresence>
            {joke && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-50 p-6 rounded-xl text-slate-700 border border-slate-200"
              >
                {joke}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
