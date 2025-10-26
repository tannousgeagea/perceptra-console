
import React, { useState, useEffect } from "react";
import { X, Trash2, Save } from "lucide-react";
import { useAnnotation } from "@/contexts/AnnotationContext";

interface AnnotationClass {
  id: string;
  label: string;
  color: string;
  name: string;
}

interface AnnotationEditorProps {
  classes: AnnotationClass[];
  onDeleteClass: (id: string) => void;
  onSaveClass: () => void;
}

const AnnotationEditor: React.FC<AnnotationEditorProps> = ({
  classes,
  onDeleteClass,
  onSaveClass,
}) => {
  const [originalBox, setOriginalBox] = useState<any | null>(null);
  const [className, setClassName] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<AnnotationClass | null>(null);
  const [visible, setVisible] = useState<boolean>(true);
  const { boxes, selectedBox, setSelectedBox, setBoxes } = useAnnotation();

  useEffect(() => {
    if (selectedBox) {
      const box = boxes.find((box) => box.id === selectedBox);
      if (!originalBox) {
        setOriginalBox({ ...box });
      }

      if (box) {
        setClassName(box.label);
        setSelectedClass({
          id: box.id,
          label: box.label,
          color: box.color,
          name: box.label,
        });
        setVisible(true);
      } else {
        setClassName('');
      }
    } else {
      setClassName('');
    }
  }, [selectedBox, boxes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedBox) {
        deleteBox(selectedBox);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBox, boxes]);

  const handleSaveClass = () => {
    if (selectedClass) {
      onSaveClass();
      setSelectedClass(null);
      setClassName("");
      setSelectedBox(null);
      setVisible(false);
      setOriginalBox(null)
    }
  };

  const updateLabel = (id: string, label: string) => {
    setBoxes(
      boxes.map((box) =>
        box.id === id ? { ...box, label } : box
      )
    );
  };

  const updateLabelAndColor = (id: string, label: string, color: string) => {
    setBoxes(
      boxes.map((box) =>
        box.id === id ? { ...box, label, color } : box
      )
    );
  };


  const handleClose = () => {
    if (originalBox) {
      const updatedBoxes = boxes.map((b) =>
        b.id === originalBox.id ? originalBox : b
      );
      setBoxes(updatedBoxes);
    }
    
    setOriginalBox(null)
    setVisible(false);
    setSelectedBox(null);
  };

  const deleteBox = (id: string) => {
    setBoxes(boxes.filter((box) => box.id !== id));
    onDeleteClass(id);
    setSelectedBox(null);
    setVisible(false);
  };

  if (!selectedBox || !visible) return null;

  return (
    <div className="absolute top-4 left-4 z-10 w-[300px] p-4 rounded-xl bg-[#06101d] text-white font-sans shadow-xl border border-[#1f2a3c]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Annotation Editor</h3>
        <button onClick={handleClose} className="text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <input
        type="text"
        value={className}
        onChange={(e) => updateLabel(selectedBox, e.target.value)}
        placeholder="Enter annotation name"
        required
        className="w-full px-3 py-2 mb-4 border border-[#333] rounded bg-[#0d1f34] text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
      />

      <div className="flex justify-between gap-2 mb-4">
        <button
          onClick={() => deleteBox(selectedBox)}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
        <button
          onClick={handleSaveClass}
          disabled={!className.trim()}
          className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded text-white text-sm transition 
            ${!className.trim() 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 cursor-pointer'}`}
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>

      <div className="max-h-[180px] overflow-y-auto space-y-2">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className={`flex items-center px-2 py-1 rounded cursor-pointer transition-colors duration-150 ${
              selectedClass?.label === cls.name ? "bg-[#1a324d]" : "hover:bg-[#0d1f34]"
            }`}
            onClick={() => updateLabelAndColor(selectedBox, cls.name, cls.color)}
          >
            <span
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: cls.color || "#ccc" }}
            />
            <span className="text-sm">{cls.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnotationEditor;

