import { useState, useCallback } from 'react';
import { HistoryEntry, ResultColor, analyze } from '@/lib/bacbo-engine';
import PredictionCard from '@/components/PredictionCard';
import NumberGrid from '@/components/NumberGrid';
import HistoryRow from '@/components/HistoryRow';

const Index = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [lastPrediction, setLastPrediction] = useState<ResultColor | null>(null);

  const prediction = analyze(history);

  const handleAdd = useCallback((val: number, color: ResultColor) => {
    // Check win/loss against previous prediction
    if (lastPrediction) {
      if (color === 'tie' || color === lastPrediction) {
        setWins(w => w + 1);
      } else {
        setLosses(l => l + 1);
      }
    }

    setHistory(prev => {
      const next = [...prev, { val, color }];
      return next.length > 50 ? next.slice(-50) : next;
    });

    // Set current prediction for next check
    const newHist = [...history, { val, color }];
    const newPred = analyze(newHist.length > 50 ? newHist.slice(-50) : newHist);
    setLastPrediction(newPred?.decision ?? null);
  }, [history, lastPrediction]);

  const handleUndo = () => {
    setHistory(prev => prev.slice(0, -1));
    setLastPrediction(null);
  };

  const winRate = wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(0) : '—';

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-3 pb-8">
      {/* Header */}
      <div className="w-full max-w-[450px] flex justify-between items-center px-2 mb-3">
        <h1 className="text-lg font-black text-primary font-display tracking-tight">BAC BO AI</h1>
        <div className="flex gap-3 text-xs font-semibold">
          <span>G: <b className="text-foreground">{history.length}</b></span>
          <span>W: <b className="text-game-green">{wins}</b></span>
          <span>L: <b className="text-game-red">{losses}</b></span>
          <span>%: <b className="text-game-tie">{winRate}</b></span>
        </div>
      </div>

      {/* Prediction */}
      <PredictionCard prediction={prediction} totalGames={history.length} />

      {/* Input buttons */}
      <div className="w-full max-w-[450px] flex flex-col gap-2 mt-4">
        <NumberGrid color="blue" label="PLAYER" onSelect={handleAdd} />
        <NumberGrid color="red" label="BANKER" onSelect={handleAdd} />
        <NumberGrid color="tie" label="TIE (EMPATE)" onSelect={handleAdd} />
      </div>

      {/* History */}
      <HistoryRow history={history} />

      {/* Undo */}
      <button
        onClick={handleUndo}
        className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
      >
        ↩ DESFAZER ÚLTIMA
      </button>
    </div>
  );
};

export default Index;
