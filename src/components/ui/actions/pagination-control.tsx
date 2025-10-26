import { FC } from "react";
import './pagination-control.css'

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onNext: () => void;
  onPrevious: () => void;
}

const PaginationControls: FC<PaginationControlsProps> = ({ currentPage, totalPages, onNext, onPrevious }) => (
  <div className="flex items-center justify-center gap-4 mt-2 border-t py-2 border-slate-300">
    <button
      onClick={onPrevious}
      disabled={currentPage === 1}
      className={`px-3 py-1 rounded-md border transition-colors text-sm
        ${
          currentPage === 1
            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
            : "bg-white text-slate-700 hover:bg-slate-100 border-slate-300"
        }`}
    >
      Previous
    </button>

    <span className="text-sm text-slate-600">
      Page <span className="font-semibold">{currentPage}</span> of{" "}
      <span className="font-semibold">{totalPages}</span>
    </span>

    <button
      onClick={onNext}
      disabled={currentPage === totalPages}
      className={`px-3 py-1 rounded-md border transition-colors text-sm
        ${
          currentPage === totalPages
            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
            : "bg-white text-slate-700 hover:bg-slate-100 border-slate-300"
        }`}
    >
      Next
    </button>
  </div>
);

export default PaginationControls;