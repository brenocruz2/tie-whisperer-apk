export type ResultColor = 'blue' | 'red' | 'tie';

export interface HistoryEntry {
  val: number;
  color: ResultColor;
}

export interface Prediction {
  decision: ResultColor;
  probability: number;
  tieChance: number;
  tieReason: string;
  streakInfo: string;
}

export function analyze(hist: HistoryEntry[]): Prediction | null {
  if (hist.length < 6) return null;

  const recent = hist.slice(-15);

  // 1. Weighted momentum (recent results weigh more)
  let wBlue = 0, wRed = 0;
  recent.forEach((item, i) => {
    const mult = (i + 1) * 0.6;
    if (item.color === 'blue') wBlue += mult;
    if (item.color === 'red') wRed += mult;
  });

  // 2. Streak detection
  const last3 = hist.slice(-3).map(h => h.color);
  const last5 = hist.slice(-5).map(h => h.color);
  const isStreak3 = last3.length === 3 && last3.every(c => c === last3[0] && c !== 'tie');
  const isStreak5 = last5.length === 5 && last5.every(c => c === last5[0] && c !== 'tie');

  // 3. TIE analysis — improved
  const gapTie = [...hist].reverse().findIndex(h => h.color === 'tie');
  const effectiveGap = gapTie === -1 ? hist.length : gapTie;

  // Count ties in last 20
  const last20 = hist.slice(-20);
  const tieCount = last20.filter(h => h.color === 'tie').length;
  const tieFreq = tieCount / last20.length;

  // Numeric proximity analysis: close values = higher tie chance
  const lastValues = hist.slice(-5);
  let numericProximity = 0;
  for (let i = 0; i < lastValues.length - 1; i++) {
    const diff = Math.abs(lastValues[i].val - lastValues[i + 1].val);
    if (diff <= 1) numericProximity += 15;
    else if (diff <= 2) numericProximity += 8;
  }

  // Values in the 6-8 range tend to produce ties more often
  const lastVal = hist[hist.length - 1].val;
  const midRangeBonus = (lastVal >= 5 && lastVal <= 9) ? 15 : 0;

  // Gap-based tie chance
  let gapBonus = 0;
  if (effectiveGap >= 12) gapBonus = 40;
  else if (effectiveGap >= 8) gapBonus = 25;
  else if (effectiveGap >= 5) gapBonus = 12;

  // Frequency bonus
  const freqBonus = tieFreq > 0.15 ? 15 : tieFreq < 0.05 ? 10 : 0;

  // Alternation pattern detection (blue-red-blue-red = higher tie chance)
  const last4Colors = hist.slice(-4).map(h => h.color).filter(c => c !== 'tie');
  let alternating = true;
  for (let i = 1; i < last4Colors.length; i++) {
    if (last4Colors[i] === last4Colors[i - 1]) { alternating = false; break; }
  }
  const altBonus = alternating && last4Colors.length >= 3 ? 12 : 0;

  const tieChance = Math.min(95, gapBonus + midRangeBonus + numericProximity + freqBonus + altBonus);

  // Build tie reason
  const reasons: string[] = [];
  if (effectiveGap >= 8) reasons.push(`${effectiveGap} rodadas sem TIE`);
  if (numericProximity > 15) reasons.push('valores numéricos próximos');
  if (midRangeBonus > 0) reasons.push(`último valor ${lastVal} (faixa média)`);
  if (alternating && last4Colors.length >= 3) reasons.push('padrão alternado detectado');
  if (freqBonus > 0 && tieFreq > 0.15) reasons.push('frequência de TIE alta');
  if (freqBonus > 0 && tieFreq < 0.05) reasons.push('TIE raro — pode estar próximo');

  const tieReason = reasons.length > 0 ? reasons.join(' • ') : 'sem indicadores fortes';

  // 4. Final decision
  let decision: ResultColor;
  let probability: number;
  let streakInfo = '';

  if (tieChance >= 55) {
    decision = 'tie';
    probability = tieChance;
    streakInfo = 'TIE provável';
  } else if (isStreak5) {
    decision = last5[0] === 'blue' ? 'red' : 'blue';
    probability = 85;
    streakInfo = `Sequência de 5 ${last5[0] === 'blue' ? 'PLAYER' : 'BANKER'} — inversão provável`;
  } else if (isStreak3) {
    decision = last3[0] === 'blue' ? 'red' : 'blue';
    probability = 75;
    streakInfo = `Sequência de 3 ${last3[0] === 'blue' ? 'PLAYER' : 'BANKER'} — possível inversão`;
  } else {
    decision = wBlue > wRed ? 'red' : 'blue';
    probability = Math.min(90, 60 + Math.abs(wBlue - wRed) * 2);
    streakInfo = `Momentum: P${wBlue.toFixed(0)} vs B${wRed.toFixed(0)}`;
  }

  return { decision, probability, tieChance, tieReason, streakInfo };
}
