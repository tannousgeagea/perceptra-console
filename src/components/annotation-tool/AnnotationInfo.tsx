
import React from "react";
import {
    ImageIcon,
    Tag,
    Eye,
    CalendarClock,
    CheckCircle,
    User,
    Layers3
} from "lucide-react"
import { ProjectImageOut } from "@/types/image";
import { useAnnotationGeometry } from "@/contexts/AnnotationGeometryContext";
import { CopyableId } from "@/components/ui/ui/copyable-id";


export interface AnnotationInfpProps {
    image: ProjectImageOut; 

}

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value?: React.ReactNode }> = ({
  icon,
  label,
  value,
}) => (
  <div className="space-y-1">
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
    {value && <div className="text-xs text-white truncate">{value}</div>}
  </div>
);

export const AnnotationInfo: React.FC<AnnotationInfpProps>  = ({ image }) => {
    const { getBoxesArray } = useAnnotationGeometry();
    const boxes = getBoxesArray();

    return (
      <div className="flex-1 overflow-y-auto p-5 space-y-3 text-sm scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
        {/* Identifiers — each one click-to-copy */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ImageIcon size={16} />
            <span className="font-medium">Identifiers</span>
          </div>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1.5 text-[11px]">
            <dt className="text-slate-500">Image ID</dt>
            <dd className="min-w-0"><CopyableId value={image.image.image_id} label="Image ID" className="text-slate-300" /></dd>
            <dt className="text-slate-500">Project image</dt>
            <dd className="min-w-0"><CopyableId value={image.id} label="Project image ID" className="text-slate-300" /></dd>
            <dt className="text-slate-500">File name</dt>
            <dd className="min-w-0"><CopyableId value={image.image.name} label="File name" className="text-slate-300" /></dd>
          </dl>
        </div>

        {/* Annotation Count */}
        <InfoRow
          icon={<Layers3 size={16} />}
          label="Annotations"
          value={
            <span className="inline-block px-3 py-1 text-xs font-semibold bg-blue-600/20 text-blue-300 rounded-full w-fit">
              {boxes.length} bounding boxes
            </span>
          }
        />

        {image.image.tags && image.image.tags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Tag size={15} />
              <span className="font-medium">Tags</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {image.image.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contributors */}
        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-wide text-slate-400 border-b border-slate-800 pb-1">
            Contributors
          </h3>
          <InfoRow
            icon={<User size={15} />}
            label="Uploaded by"
            value={image.image.uploaded_by || "—"}
          />
          <InfoRow
            icon={<CheckCircle size={15} />}
            label="Added by"
            value={image.added_by || "—"}
          />
          <InfoRow
            icon={<Eye size={15} />}
            label="Reviewed by"
            value={image.reviewed_by || "—"}
          />
        </div>

        {/* Timestamps */}
        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-wide text-slate-400 border-b border-slate-800 pb-1 mt-2">
            Timeline
          </h3>
          <InfoRow
            icon={<CalendarClock size={15} />}
            label="Created At"
            value={
              image.image.created_at
                ? new Date(image.image.created_at).toLocaleString()
                : "—"
            }
          />
          <InfoRow
            icon={<CalendarClock size={15} />}
            label="Added At"
            value={new Date(image.added_at).toLocaleString()}
          />
          {image.reviewed_at && (
            <InfoRow
              icon={<CalendarClock size={15} />}
              label="Reviewed At"
              value={new Date(image.reviewed_at).toLocaleString()}
            />
          )}
        </div>
      </div>
    );
};