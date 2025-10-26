import { useState, useEffect, FC } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import SelectFilter from "./select";
import { baseURL } from "@/components/api/base";
import useFilters from "@/hooks/useFilters";
import './filter-dataset.css'

interface FilterItem {
  key: string;
  value: string;
}

interface Filter {
  key: string;
  title: string;
  placeholder: string;
  type: "text" | "select";
  items?: FilterItem[] | null;
}

interface FiltersDatasetProps {
  onSearch: (key: string) => void;
}

const FiltersDataset: FC<FiltersDatasetProps> = ({ onSearch }) => {
  const { projectId } = useParams()
  const [filters, setFilters] = useState<Filter[]>([]);
  const { filterValues, handleFilterChange, clearFilter } = useFilters({});
  useEffect(() => {
    const fetchFilters = async () => {
      const response = await axios.get(`${baseURL}/api/v1/projects/${projectId}/filters`);
      setFilters(response.data.filters);
    };
    fetchFilters();
  }, []);

  const handleSearch = () => {
    const userFilters = JSON.stringify(filterValues);
    const query = `${encodeURIComponent(userFilters)}`;
    onSearch(query)

  };

  return (
    <div className="filter-container">
      {filters.map((filter) => {
        if (filter.type === "text") {
          return (
            <div key={filter.key} className="filter-item">
              <input
                type="text"
                placeholder={filter.placeholder}
                value={filterValues[filter.key] || ""}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              />
            </div>
          );
        } else if (filter.type === "select" && filter.items) {
          return (
            <SelectFilter
              key={filter.key}
              name={filter.title}
              data={filter.items}
              onFilterChange={(value) => handleFilterChange(filter.key, value)}
            />
          );
        }
        return null;
      })}
      <button onClick={handleSearch} className="search-btn">Search</button>
    </div>
  );
};

export default FiltersDataset;
