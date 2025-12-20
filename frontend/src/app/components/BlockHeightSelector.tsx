import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface BlockHeightSelectorProps {
  startHeight: number;
  latestHeight: number;
  onHeightChange: (height: number) => void;
  disabled?: boolean;
}

export function BlockHeightSelector({
  startHeight,
  latestHeight,
  onHeightChange,
  disabled = false,
}: BlockHeightSelectorProps) {
  const [inputValue, setInputValue] = useState(startHeight.toString());

  const handlePrevious = () => {
    const newHeight = Math.max(0, startHeight - 1000);
    onHeightChange(newHeight);
    setInputValue(newHeight.toString());
  };

  const handleNext = () => {
    const newHeight = Math.min(latestHeight - 1000, startHeight + 1000);
    onHeightChange(newHeight);
    setInputValue(newHeight.toString());
  };

  const handleLatest = () => {
    const newHeight = latestHeight - 1000;
    onHeightChange(newHeight);
    setInputValue(newHeight.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseInt(inputValue, 10);

    if (!isNaN(numValue) && numValue >= 0 && numValue <= latestHeight - 1000) {
      onHeightChange(numValue);
    } else {
      // Reset to current value if invalid
      setInputValue(startHeight.toString());
    }
  };

  return (
    <div className="bg-[#0f1115] backdrop-blur-sm rounded-2xl shadow-sm border border-gray-800 text-gray-200 p-6">
      <h2 className="mb-4 text-[#cc7400] font-semibold">Block Range</h2>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="flex-1">
          <label htmlFor="blockHeight" className="block mb-2">
            Start Block Height
          </label>
          <form onSubmit={handleInputSubmit} className="flex gap-2">
            <input
              id="blockHeight"
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              disabled={disabled}
              className="flex-1 px-4 py-2 border border-gray-700 bg-[#0b0c10] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cc7400] disabled:bg-slate-800 disabled:text-slate-500"
              min={0}
              max={latestHeight - 1000}
            />
            <button
              type="submit"
              disabled={disabled}
              className="px-4 py-2 bg-[#cc7400] text-black rounded-lg hover:brightness-110 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              Apply
            </button>
          </form>
          <p className="text-gray-300 mt-1">
            Range: {startHeight.toLocaleString()} –{" "}
            {(startHeight + 1000).toLocaleString()}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrevious}
            disabled={disabled || startHeight === 0}
            className="px-4 py-2 border border-gray-700 text-gray-200 rounded-lg hover:bg-[#11131a] disabled:bg-slate-800 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            title="Previous 1000 blocks"
          >
            <ChevronLeft className="w-4 h-4 text-gray-200" />
            <span className="text-gray-200 hidden sm:inline">Previous</span>
          </button>

          <button
            onClick={handleNext}
            disabled={disabled || startHeight >= latestHeight - 1000}
            className="px-4 py-2 border text-gray-200 border-gray-700 rounded-lg hover:bg-[#11131a] disabled:bg-slate-800 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            title="Next 1000 blocks"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleLatest}
            disabled={disabled}
            className="px-4 py-2 bg-[#cc7400] text-black rounded-lg hover:brightness-110 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            title="Jump to latest blocks"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Latest</span>
          </button>
        </div>
      </div>
    </div>
  );
}
