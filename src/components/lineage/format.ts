// Formatting shared by the version page and the compare page.
import type { MetricChange, VersionComparison } from '@/types/lineage';

/** Scores between 0 and 1 that read better as percentages (mAP, precision, recall...). */
const RATIO = /map|precision|recall|f1|accuracy|iou/i;

export const isRatioMetric = (key: string, ...values: (number | null | undefined)[]) =>
  RATIO.test(key) && values.every((v) => v == null || (v >= 0 && v <= 1));

const LABELS: Record<string, string> = {
  mAP50: 'mAP@50',
  mAP75: 'mAP@75',
  'mAP50-95': 'mAP@50–95',
  map50: 'mAP@50',
  map: 'mAP@50–95',
  val_loss: 'Validation loss',
  train_loss: 'Training loss',
  learning_rate: 'Learning rate',
  batch_size: 'Batch size',
  epochs: 'Epochs',
  epoch: 'Epoch',
  model_size: 'Model size',
  imgsz: 'Image size',
  image_size: 'Image size',
  precision: 'Precision',
  recall: 'Recall',
};

/** "val_loss" -> "Validation loss"; unknown keys get their underscores replaced. */
export const keyLabel = (key: string) => {
  if (LABELS[key]) return LABELS[key];
  const spaced = key.replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

export const asNumber = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : null;

/** A metric value: 0.642 -> "64.2%" for scores, otherwise up to 4 significant digits. */
export function fmtMetric(key: string, value: number | null | undefined, ratio = isRatioMetric(key, value)): string {
  if (value == null) return '—';
  if (ratio) return `${(value * 100).toFixed(1)}%`;
  if (Number.isInteger(value)) return value.toLocaleString();
  return Math.abs(value) >= 100 ? value.toFixed(1) : Number(value.toPrecision(4)).toString();
}

/** A change: "+4.0 pts" for scores, "−0.2" otherwise. Uses a real minus sign. */
export function fmtDelta(key: string, delta: number | null | undefined, ratio: boolean): string {
  if (delta == null) return '—';
  const sign = delta > 0 ? '+' : delta < 0 ? '−' : '±';
  const abs = Math.abs(delta);
  if (ratio) return `${sign}${(abs * 100).toFixed(1)} pts`;
  return `${sign}${Number.isInteger(abs) ? abs.toLocaleString() : Number(abs.toPrecision(3)).toString()}`;
}

/** Any setting value, readable: objects as compact JSON, empty as "not set". */
export function fmtSetting(v: unknown): string {
  if (v === null || v === undefined || v === '') return 'not set';
  if (typeof v === 'boolean') return v ? 'yes' : 'no';
  if (typeof v === 'number') return fmtMetric('', v, false);
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

export function fmtDuration(seconds: number | null | undefined): string {
  if (seconds == null) return '—';
  const s = Math.round(seconds);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h} h ${m % 60} min`;
}

export const fmtDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

export const fmtDateTime = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

const plural = (n: number, word: string) => `${n.toLocaleString()} ${word}${n === 1 ? '' : 's'}`;

/** The metric the comparison leads with: mAP if present, else the first one with a verdict. */
export function headlineMetric(metrics: MetricChange[]): MetricChange | undefined {
  const scored = metrics.filter((m) => m.verdict != null);
  return (
    scored.find((m) => /^map50$/i.test(m.key)) ??
    scored.find((m) => /map/i.test(m.key)) ??
    scored[0]
  );
}

/** One or two sentences: how B differs from A, in plain words. */
export function comparisonSentence(c: VersionComparison): string {
  const a = c.a.label;
  const b = c.b.label;
  if (c.a.version_id === c.b.version_id) return `Pick two different versions to see what changed.`;

  const parts: string[] = [];
  const head = headlineMetric(c.metrics);
  if (head && head.delta != null) {
    const ratio = isRatioMetric(head.key, head.a, head.b);
    const name = keyLabel(head.key);
    if (head.verdict === 'same') parts.push(`${b} scores the same ${name} as ${a}.`);
    else if (head.verdict === 'improved') parts.push(`${b} is better than ${a} on ${name} (${fmtDelta(head.key, head.delta, ratio)}).`);
    else parts.push(`${b} is worse than ${a} on ${name} (${fmtDelta(head.key, head.delta, ratio)}).`);
  } else {
    parts.push(`${b} and ${a} have no metric in common to compare.`);
  }

  const why: string[] = [];
  const d = c.data;
  if (d.same_dataset) why.push('the same data');
  else if (d.a && d.b) {
    const net = d.only_b - d.only_a;
    const grew = net > 0 ? `${plural(net, 'more image')}` : net < 0 ? `${plural(-net, 'fewer image')}` : `as many images (${d.only_b} swapped)`;
    const top = [...d.classes].filter((x) => x.in_added_images > 0).sort((x, y) => y.in_added_images - x.in_added_images)[0];
    why.push(top && net > 0 ? `${grew}, mostly “${top.name}”` : grew);
  }
  const changed = c.settings_changed.slice(0, 2).map((s) => `${keyLabel(s.key).toLowerCase()} ${fmtSetting(s.a)} → ${fmtSetting(s.b)}`);
  if (changed.length) why.push(changed.join(', ') + (c.settings_changed.length > 2 ? ` and ${c.settings_changed.length - 2} more` : ''));
  else why.push('the same settings');
  parts.push(`It trained on ${why[0]}${why.length > 1 ? `, with ${why.slice(1).join(' and ')}` : ''}.`);
  return parts.join(' ');
}
