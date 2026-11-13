import { DatasetVersion } from "@/types/version";

/**
 * Wording for "what's in the version" versus "what's in its export file".
 * A version's total_images / total_annotations / split counts describe the
 * last export (only labelled images, plus augmented copies); the
 * images_in_version and not_exported_* fields describe the version itself.
 */

const plural = (n: number, word: string) => `${n.toLocaleString()} ${word}${n === 1 ? "" : "s"}`;

export const isExported = (v: DatasetVersion) => v.export_status === "completed";

/** "15 images in version" (falls back to the export total for older API responses). */
export function versionImagesLabel(v: DatasetVersion): string {
  return `${plural(v.images_in_version ?? v.total_images, "image")} in version`;
}

/** "Export: 36 images (22 augmented), 51 annotations", or null before the first export. */
export function exportContentsLabel(v: DatasetVersion): string | null {
  if (!isExported(v)) return null;
  const augmented = v.augmented_images ?? 0;
  return `Export: ${plural(v.total_images, "image")}${augmented > 0 ? ` (${augmented.toLocaleString()} augmented)` : ""}, ${plural(v.total_annotations, "annotation")}`;
}

/** Images the export leaves out, with the reasons; null when it leaves none out. */
export function notExportedSummary(v: DatasetVersion): { total: number; reasons: string[] } | null {
  const predictionsOnly = v.not_exported_predictions_only ?? 0;
  const noLabels = v.not_exported_no_labels ?? 0;
  const total = predictionsOnly + noLabels;
  if (total === 0) return null;
  const reasons: string[] = [];
  if (predictionsOnly > 0) {
    reasons.push(`${plural(predictionsOnly, "image")} only ${predictionsOnly === 1 ? "has" : "have"} model predictions. Turn on Include predictions when exporting to include them.`);
  }
  if (noLabels > 0) {
    reasons.push(`${plural(noLabels, "image")} ${noLabels === 1 ? "has" : "have"} no labels.`);
  }
  return { total, reasons };
}
