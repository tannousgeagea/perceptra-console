
import { AnnotationClass } from "@/types/project";
import { X } from "lucide-react";
import { ColorPicker } from "./ColorPicker";


export const AnnotationClassForm: React.FC<{
  classData: AnnotationClass;
  onChange: (data: AnnotationClass) => void;
  onRemove: () => void;
  canRemove: boolean;
}> = ({ classData, onChange, onRemove, canRemove }) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">Class {classData.class_id + 1}</h4>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Class Name *
          </label>
          <input
            type="text"
            value={classData.name}
            onChange={(e) => onChange({ ...classData, name: e.target.value })}
            placeholder="e.g., Person, Car, Building"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color
          </label>
          <ColorPicker
            value={classData.color}
            onChange={(color) => onChange({ ...classData, color })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={classData.description || ''}
            onChange={(e) => onChange({ ...classData, description: e.target.value })}
            placeholder="Optional description..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>
    </div>
  );
};