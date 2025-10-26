import React from 'react';
import { useAnnotation } from '@/contexts/AnnotationContext';
import { ClipboardCopy, CalendarClock, MapPin, Layers3, LocateFixed, Image as ImageIcon } from 'lucide-react';
import ApproveButton from './ApproveButton';
import DeleteButton from './DeleteButton';
import MarkAsNullButton from './MarkAsNullButton';
// import { toast } from 'sonner';
import { useToast } from '@/hooks/use-toast';

interface Image {
  image_id: string;
  project_id: string;
  url: string;
  created_at: string;
  location: string;
  sub_location: string;
}

interface ActionSidebarProps {
  currentImage: Image;
  goToNextImage: () => void;
}

const ActionSidebar: React.FC<ActionSidebarProps> = ({ currentImage, goToNextImage }) => {
  const { boxes } = useAnnotation();
  const { toast } = useToast()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentImage.image_id);
    toast({description: 'Copied image ID!'});
  };

  return (
    <div className="w-72 h-full flex flex-col border-l bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      <div className="p-5">
        <h2 className="text-xl font-bold text-center mb-6 tracking-wide bg-gradient-to-r from-indigo-500 to-blue-500 text-transparent bg-clip-text">
          ⚙️ Actions
        </h2>

        <div className="space-y-3 mb-8">
          <ApproveButton currentImage={currentImage} goToNextImage={goToNextImage} className="w-full" />
          <DeleteButton currentImage={currentImage} goToNextImage={goToNextImage} className="w-full" />
          <MarkAsNullButton currentImage={currentImage} goToNextImage={goToNextImage} className="w-full bg-red-500 hover:bg-red-600 text-white" />
        </div>

        <div className="space-y-5 text-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ImageIcon size={16} />
              <span className="font-medium">Image ID</span>
            </div>
            <button
              onClick={handleCopy}
              className="text-blue-400 text-xs hover:underline hover:text-blue-300"
            >
              <ClipboardCopy size={14} />
            </button>
          </div>
          <p className="text-xs truncate text-white">{currentImage.image_id}</p>

          <div className="flex items-center gap-2 text-muted-foreground mt-4">
            <Layers3 size={16} />
            <span className="font-medium">Annotations</span>
          </div>
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-blue-600/20 text-blue-300 rounded-full w-fit">
            {boxes.length} bounding boxes
          </span>

          <div className="flex items-center gap-2 text-muted-foreground mt-4">
            <CalendarClock size={16} />
            <span className="font-medium">Created At</span>
          </div>
          <p className="text-xs text-white">{new Date(currentImage.created_at).toLocaleString()}</p>

          <div className="flex items-center gap-2 text-muted-foreground mt-4">
            <LocateFixed size={16} />
            <span className="font-medium">Location</span>
          </div>
          <span className="inline-block px-3 py-1 text-xs bg-green-700/30 text-green-300 rounded-full w-fit">
            {currentImage.location}
          </span>

          <div className="flex items-center gap-2 text-muted-foreground mt-4">
            <MapPin size={16} />
            <span className="font-medium">Viewpoint</span>
          </div>
          <span className="inline-block px-3 py-1 text-xs bg-indigo-700/30 text-indigo-300 rounded-full w-fit">
            {currentImage.sub_location}
          </span>
        </div>
      </div>

      <div className="p-4 text-center text-xs text-muted-foreground border-t border-border mt-[15rem]">
        <p>&copy; {new Date().getFullYear()} WasteAnt Vision UI</p>
      </div>
    </div>
  );
};

export default ActionSidebar;
