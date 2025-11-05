import React from "react";
import { useAnnotation } from "@/contexts/AnnotationContext";
import {
  ClipboardCopy,
  CalendarClock,
  Layers3,
  Image as ImageIcon,
  User,
  CheckCircle,
  Eye,
  Tag,
} from "lucide-react";
import ApproveButton from "./ButtonApprove";
import DeleteButton from "./ButtonDelete";
import MarkAsNullButton from "./ButtonMarkNull";
import { toast } from "sonner";
import { ProjectImageOut } from "@/types/image";

// 🧩 Small reusable row for consistent layout
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

interface ActionSidebarProps {
  currentImage: ProjectImageOut;
  projectId: string;
  goToNextImage: () => void;
}

const ActionSidebar: React.FC<ActionSidebarProps> = ({
  currentImage,
  projectId,
  goToNextImage,
}) => {
  const { boxes } = useAnnotation();

  console.log(currentImage)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentImage.image.image_id);
    toast.info("Copied image ID!");
  };

  return (
    <aside className="w-72 h-full flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-l border-slate-800 flex-shrink-0">
      <div className="p-5 border-b border-slate-800">
        <h2 className="text-lg font-bold text-center mb-4 tracking-wide bg-gradient-to-r from-indigo-400 to-blue-500 text-transparent bg-clip-text">
          ⚙️ Image Actions
        </h2>

        <div className="space-y-3 mb-6">
          <ApproveButton
            currentImage={currentImage}
            projectId={projectId}
            goToNextImage={goToNextImage}
            className="w-full"
          />
          <DeleteButton
            currentImage={currentImage}
            projectId={projectId}
            goToNextImage={goToNextImage}
            className="w-full"
          />
          <MarkAsNullButton
            currentImage={currentImage}
            projectId={projectId}
            goToNextImage={goToNextImage}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          />
        </div>
      </div>

      {/* Metadata Section */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3 text-sm scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
        {/* Image ID */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ImageIcon size={16} />
              <span className="font-medium">Image ID</span>
            </div>
            <button
              onClick={handleCopy}
              className="text-blue-400 text-xs hover:text-blue-300"
              title="Copy ID"
            >
              <ClipboardCopy size={14} />
            </button>
          </div>
          <p className="text-[11px] text-slate-300 truncate">
            {currentImage.image.image_id}
          </p>
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

        {currentImage.image.tags && currentImage.image.tags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Tag size={15} />
              <span className="font-medium">Tags</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentImage.image.tags.map((tag, idx) => (
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
            value={currentImage.image.uploaded_by || "—"}
          />
          <InfoRow
            icon={<CheckCircle size={15} />}
            label="Added by"
            value={currentImage.added_by || "—"}
          />
          <InfoRow
            icon={<Eye size={15} />}
            label="Reviewed by"
            value={currentImage.reviewed_by || "—"}
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
              currentImage.image.created_at
                ? new Date(currentImage.image.created_at).toLocaleString()
                : "—"
            }
          />
          <InfoRow
            icon={<CalendarClock size={15} />}
            label="Added At"
            value={new Date(currentImage.added_at).toLocaleString()}
          />
          {currentImage.reviewed_at && (
            <InfoRow
              icon={<CalendarClock size={15} />}
              label="Reviewed At"
              value={new Date(currentImage.reviewed_at).toLocaleString()}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="sticky bottom-0 bg-slate-900/90 backdrop-blur-md border-t border-indigo-500/50 shadow-[0_-1px_4px_rgba(0,0,0,0.4)]">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent animate-[pulse_4s_ease-in-out_infinite]" />
        <div className="px-4 py-3 text-center backdrop-blur-md">
          <p className="text-[11px] text-slate-300 tracking-wide">
            © {new Date().getFullYear()}{" "}
            <span className="text-indigo-400 font-semibold">Perceptra Vision UI</span>
          </p>
        </div>
      </footer>
    </aside>
  );
};

export default ActionSidebar;
