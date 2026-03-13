import { useEffect, useRef } from 'react';
import { Prediction } from '@/lib/bacbo-engine';

const decisionLabels: Record<string, string> = {
  blue: 'PLAYER AZUL',
  red: 'BANKER VERMELHO',
  tie: 'EMPATE (TIE)',
};

const decisionColors: Record<string, string> = {
  blue: 'text-game-blue',
  red: 'text-game-red',
  tie: 'text-game-tie',
};

const barColors: Record<string, string> = {
  blue: 'bg-game-blue',
  red: 'bg-game-red',
  tie: 'bg-game-tie',
};

function playTieAlert() {
  try {
    const ctx = new AudioContext();
    // Two-tone alert beep
    [660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.value = 0.15;
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.12);
    });
  } catch {}
}

function vibrate() {
  try {
    navigator.vibrate?.([200, 100, 200]);
  } catch {}
}

interface PredictionCardProps {
  prediction: Prediction | null;
  totalGames: number;
}

export default function PredictionCard({ prediction, totalGames }: PredictionCardProps) {
  const prevTieOver50 = useRef(false);

  useEffect(() => {
    const isOver50 = (prediction?.tieChance ?? 0) >= 50;
    if (isOver50 && !prevTieOver50.current) {
      playTieAlert();
      vibrate();
    }
    prevTieOver50.current = isOver50;
  }, [prediction?.tieChance]);
  return (
    <div className="bg-card border-2 border-border rounded-2xl w-full max-w-[450px] p-5 text-center shadow-2xl">
      <div className="text-[9px] tracking-[3px] text-muted-foreground mb-1 font-display">
        ANÁLISE PREDITIVA
      </div>

      {!prediction ? (
        <>
          <div className="text-2xl font-black my-3 text-foreground font-display">AGUARDANDO...</div>
          <div className="text-xs text-muted-foreground">
            Insira {Math.max(0, 6 - totalGames)} resultado(s) para ativar
          </div>
        </>
      ) : (
        <>
          <div className={`text-3xl font-black my-2 font-display animate-pulse-glow ${decisionColors[prediction.decision]}`}>
            {decisionLabels[prediction.decision]}
          </div>

          {/* Main probability bar */}
          <div className="bg-muted h-3 rounded-full my-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${barColors[prediction.decision]}`}
              style={{ width: `${prediction.probability}%` }}
            />
          </div>
          <div className="text-sm font-bold text-foreground">
            {prediction.probability}% CONFIANÇA
          </div>

          {/* Streak info */}
          <div className="text-[10px] text-muted-foreground mt-2">{prediction.streakInfo}</div>

          {/* TIE indicator — always visible */}
          <div className="mt-4 p-3 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] tracking-[2px] text-game-tie font-display font-bold">
                ⚡ PROBABILIDADE TIE
              </span>
              <span className={`text-sm font-black ${prediction.tieChance >= 40 ? 'text-game-tie animate-pulse-glow' : 'text-muted-foreground'}`}>
                {prediction.tieChance}%
              </span>
            </div>
            <div className="bg-muted h-2 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-game-tie rounded-full transition-all duration-700"
                style={{ width: `${prediction.tieChance}%` }}
              />
            </div>
            <div className="text-[9px] text-muted-foreground">
              {prediction.tieReason}
            </div>
            {prediction.tieChance >= 35 && (
              <div className="text-[10px] font-bold text-game-tie mt-1">
                ⚠ COBRIR EMPATE RECOMENDADO
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
