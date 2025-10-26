import { FC } from "react";
import "./filter-tabs.css";

interface Filter {
  key: string;
  label: string;
  count: number;
}

interface FilterTabsProps {
  filters: Filter[];
  selectedFilter: string;
  onSelectFilter: (key: string) => void;
}

const FilterTabs: FC<FilterTabsProps> = ({ filters, selectedFilter, onSelectFilter }) => {
  return (
    <div className="filter-tabs">
      {filters.map((filter) => (
        <div
          key={filter.key}
          className={`tab ${selectedFilter === filter.key ? "active" : ""}`}
          onClick={() => onSelectFilter(filter.key)}
        >
          <span>
            {filter.label}
            <p>{filter.count}</p>
          </span>
        </div>
      ))}
    </div>
  );
};

export default FilterTabs;