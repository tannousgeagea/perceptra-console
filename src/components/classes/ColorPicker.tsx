
import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/ui/popover';

const PRESET_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#FACC15', // Yellow
  '#10B981', // Green
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#000000', // Black
];

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, className }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button 
          className={`w-6 h-6 rounded-full cursor-pointer border border-gray-300 ${className}`}
          style={{ backgroundColor: color }}
          aria-label="Select color"
        />
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="space-y-2">
          <div className="font-medium text-sm">Select Color</div>
          <div className="grid grid-cols-5 gap-2">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                className="w-8 h-8 rounded-full cursor-pointer border border-gray-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: presetColor }}
                onClick={() => {
                  onChange(presetColor);
                  setOpen(false);
                }}
                aria-label={`Color ${presetColor}`}
              />
            ))}
          </div>
          <div className="flex items-center mt-2">
            <input
              type="color"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="w-8 h-8 cursor-pointer"
            />
            <div className="ml-2 text-xs text-gray-500">
              Or pick a custom color
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorPicker;