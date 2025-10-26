
import { useProjectOptions } from "@/hooks/useCreateProject";


// Color Picker Component
export const ColorPicker: React.FC<{
  value?: string;
  onChange: (color: string) => void;
  colors?: string[];
}> = ({ value, onChange, colors }) => {
  const { defaultColors } = useProjectOptions();
  const colorOptions = colors || defaultColors;

  return (
    <div className="flex flex-wrap gap-2">
      {colorOptions.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
            value === color ? 'border-gray-400 scale-110' : 'border-gray-200'
          }`}
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
    </div>
  );
};