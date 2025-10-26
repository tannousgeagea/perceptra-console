
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface TrainValidSliderProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTrain?: number;
  onChange: (trainPercentage: number) => void;
  onClick: () => void;
}

const TrainValidSlider: React.FC<TrainValidSliderProps> = ({
  isOpen,
  onClose,
  defaultTrain = 70,
  onChange,
  onClick,
}) => {
  const [trainPercentage, setTrainPercentage] = useState<number>(defaultTrain);

  console.log(isOpen)
  useEffect(() => {
    if (isOpen) setTrainPercentage(defaultTrain);
  }, [isOpen, defaultTrain]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const train = parseInt(e.target.value, 10);
    setTrainPercentage(train);
    onChange(train / 100);
  };

  const validPercentage = 100 - trainPercentage;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      <div className="ml-auto relative w-[350px] h-full bg-[#0f172a] text-white shadow-lg z-50 animate-slide-in-right overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Train / Validation Split</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="flex justify-between text-sm font-medium">
            <div className="text-purple-400">
              Train<br />
              <span className="text-lg font-bold">{trainPercentage}%</span>
            </div>
            <div className="text-blue-400 text-right">
              Valid<br />
              <span className="text-lg font-bold">{validPercentage}%</span>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={trainPercentage}
            onChange={handleSliderChange}
            className="w-full appearance-none h-2 bg-gray-700 rounded-lg cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
          />

          <div className="relative w-full h-3 rounded overflow-hidden bg-gray-800 mt-2">
            <div
              className="absolute top-0 left-0 h-full"
              style={{ width: `${trainPercentage}%`, backgroundColor: 'purple' }}
            />
            <div
              className="absolute top-0 right-0 h-full"
              style={{ width: `${validPercentage}%`, backgroundColor: 'blue' }}
            />
          </div>

          <button
            onClick={onClick}
            className="w-full py-2 mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg text-white font-semibold transition"
          >
            Split
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainValidSlider;
