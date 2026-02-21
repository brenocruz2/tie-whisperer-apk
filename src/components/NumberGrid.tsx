import { ResultColor } from '@/lib/bacbo-engine';

interface NumberGridProps {
  color: ResultColor;
  label: string;
  onSelect: (val: number, color: ResultColor) => void;
}

const colorStyles: Record<ResultColor, string> = {
  blue: 'bg-game-blue/80 hover:bg-game-blue active:scale-90 glow-blue',
  red: 'bg-game-red/80 hover:bg-game-red active:scale-90 glow-red',
  tie: 'bg-game-tie/80 hover:bg-game-tie active:scale-90 text-accent-foreground glow-tie',
};

const labelColors: Record<ResultColor, string> = {
  blue: 'text-game-blue',
  red: 'text-game-red',
  tie: 'text-game-tie',
};

export default function NumberGrid({ color, label, onSelect }: NumberGridProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-3">
      <div className={`text-[10px] font-bold tracking-[2px] text-center mb-2 ${labelColors[color]}`}>
        {label}
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {Array.from({ length: 11 }, (_, i) => i + 2).map(val => (
          <button
            key={val}
            onClick={() => onSelect(val, color)}
            className={`rounded-md py-2.5 text-sm font-bold text-primary-foreground transition-all duration-100 ${colorStyles[color]}`}
          >
            {val}
          </button>
        ))}
      </div>
    </div>
  );
}
