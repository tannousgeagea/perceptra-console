import type { Box } from '@/types/annotation';
import type { ProjectImageOut } from '@/types/image';

/** An image's saved annotations as canvas boxes ([xmin, ymin, xmax, ymax] → x/y/width/height). */
export const annotationsToBoxes = (image: ProjectImageOut): Box[] =>
  (image.annotations || []).map((ann) => ({
    id: ann.annotation_uid,
    x: ann.data[0],
    y: ann.data[1],
    width: ann.data[2] - ann.data[0],
    height: ann.data[3] - ann.data[1],
    label: ann.class_name,
    color: ann.color,
    class_id: parseInt(ann.class_id),
  }));
