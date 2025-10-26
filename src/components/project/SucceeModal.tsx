import { ProjectResponse } from "@/types/project";
import { CheckCircle } from "lucide-react";

export const SuccessModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  project?: ProjectResponse;
}> = ({ isOpen, onClose, project }) => {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Project Created Successfully!
        </h3>
        <p className="text-gray-600 mb-2">
          <strong>"{project.name}"</strong> has been created and is ready to use.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Project ID: #{project.id}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Create Another
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            View Project
          </button>
        </div>
      </div>
    </div>
  );
};