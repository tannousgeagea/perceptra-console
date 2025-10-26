import { useState } from "react";

const useFilters = (initialFilters: Record<string, string>) => {
  const [filterValues, setFilterValues] = useState(initialFilters);

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilter = (key: string) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: initialFilters[key], // Reset to initial value for that filter
    }));
  };

  const resetFilters = () => {
    setFilterValues(initialFilters); // Reset all filters
  };

  const getActiveFilters = () => {
    return Object.entries(filterValues).filter(([_, value]) => value !== "");
  };

  return {
    filterValues,
    handleFilterChange,
    clearFilter,
    resetFilters,
    getActiveFilters,
  };
};

export default useFilters;
