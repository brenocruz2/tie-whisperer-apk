import { HistoryEntry } from '@/lib/bacbo-engine';

const dotColors: Record<string, string> = {
  blue: 'bg-game-blue',
  red: 'bg-game-red',
  tie: 'bg-game-tie text-accent-foreground',
};

export default function HistoryRow({ history }: { history: HistoryEntry[] }) {
  return (
    <div className="flex flex-row-reverse overflow-x-auto gap-1.5 p-3 bg-background/50 rounded-xl w-full max-w-[450px] h-14 scrollbar-none">
      {[...history].reverse().map((entry, i) => (
        <div
          key={i}
          className={`min-w-[30px] h-[30px] rounded-md flex items-center justify-center text-xs font-bold shrink-0 animate-slide-in ${dotColors[entry.color]}`}
        >
          {entry.val}
        </div>
      ))}
    </div>
  );
}
