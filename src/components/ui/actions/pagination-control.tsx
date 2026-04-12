import { FC } from "react";
import './pagination-control.css'

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onNext: () => void;
  onPrevious: () => void;
}

const PaginationControls: FC<PaginationControlsProps> = ({ currentPage, totalPages, onNext, onPrevious }) => (
  <div className="flex items-center justify-center gap-4 mt-2 border-t py-2 border-slate-300 dark:border-slate-700">
    <button
      onClick={onPrevious}
      disabled={currentPage === 1}
      className={`px-3 py-1 rounded-md border transition-colors text-sm
        ${
          currentPage === 1
            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
            : "bg-white dark:bg-gray-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700"
        }`}
    >
      Previous
    </button>

    <span className="text-sm text-slate-600 dark:text-slate-400">
      Page <span className="font-semibold">{currentPage}</span> of{" "}
      <span className="font-semibold">{totalPages}</span>
    </span>

    <button
      onClick={onNext}
      disabled={currentPage === totalPages}
      className={`px-3 py-1 rounded-md border transition-colors text-sm
        ${
          currentPage === totalPages
            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
            : "bg-white dark:bg-gray-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700"
        }`}
    >
      Next
    </button>
  </div>
);

export default PaginationControls;