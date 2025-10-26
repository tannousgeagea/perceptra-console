
import { AnnotationClass } from "@/types/project";
import { X, Plus, Tag } from "lucide-react";
import { AnnotationClassForm } from "./AnnotationClassForm";

export const AnnotationGroupForm: React.FC<{
  groupData: AnnotationGroup;
  onChange: (data: AnnotationGroup) => void;
  onRemove: () => void;
  canRemove: boolean;
}> = ({ groupData, onChange, onRemove, canRemove }) => {
  const addAnnotationClass = () => {
    const newClass: AnnotationClass = {
      class_id: groupData.classes.length,
      name: '',
      color: '#3B82F6'
    };
    onChange({
      ...groupData,
      classes: [...groupData.classes, newClass]
    });
  };

  const updateAnnotationClass = (index: number, classData: AnnotationClass) => {
    const updatedClasses = groupData.classes.map((cls, i) => 
      i === index ? classData : cls
    );
    onChange({ ...groupData, classes: updatedClasses });
  };

  const removeAnnotationClass = (index: number) => {
    const updatedClasses = groupData.classes.filter((_, i) => i !== index)
      .map((cls, i) => ({ ...cls, class_id: i }));
    onChange({ ...groupData, classes: updatedClasses });
  };

  return (
    <div className="border border-gray-300 rounded-xl p-6 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Annotation Group</h3>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              value={groupData.name}
              onChange={(e) => onChange({ ...groupData, name: e.target.value })}
              placeholder="e.g., Objects, Vehicles, People"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={groupData.description || ''}
              onChange={(e) => onChange({ ...groupData, description: e.target.value })}
              placeholder="Optional description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-900">Annotation Classes</h4>
            <button
              type="button"
              onClick={addAnnotationClass}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Class
            </button>
          </div>

          <div className="space-y-4">
            {groupData.classes.map((classData, index) => (
              <AnnotationClassForm
                key={`${groupData.name}-${index}`}
                classData={classData}
                onChange={(data) => updateAnnotationClass(index, data)}
                onRemove={() => removeAnnotationClass(index)}
                canRemove={groupData.classes.length > 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
