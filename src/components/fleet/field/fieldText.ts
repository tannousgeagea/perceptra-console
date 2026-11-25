// Words for the Field tab. Pure functions.
import type { FieldPlace, ModelField, Severity } from '@/types/fleet';
import { plural } from '../format';

/** The worst of a place's signals. */
export function worst(p: FieldPlace): Severity {
  const s = Object.values(p.signals);
  return s.includes('critical') ? 'critical' : s.includes('warning') ? 'warning' : null;
}

/** One sentence for the tab's header. */
export function fieldSentence(field: ModelField): string {
  if (field.places.length === 0) return 'No device has reported what this model sees yet.';
  const drifting = field.places.filter((p) => worst(p));
  const parts = [`${plural(field.places.length, 'place')} reporting`];
  if (drifting.length) {
    const top = [...drifting].sort((a, b) => (b.confidence_drop ?? 0) - (a.confidence_drop ?? 0))[0];
    const name = top.site?.name ?? top.device?.name;
    parts.push(top.confidence_drop != null && top.confidence_drop > 0
      ? `${name}: confidence −${(top.confidence_drop * 100).toFixed(0)} % against its baseline`
      : `${name} is drifting`);
  } else if (field.places.some((p) => p.baseline)) {
    parts.push('all steady against their baselines');
  }
  return parts.join('; ') + '.';
}
