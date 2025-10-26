import { useState, ChangeEvent, FC } from 'react';
import './filter.css';

interface SearchFilterProps {
    placeholder?: string;
    onSearchChange: (value: string) => void;
}

const SearchFilter: FC<SearchFilterProps> = ({ placeholder, onSearchChange }) => {
    const [searchTerm, setSearchTerm] = useState<string>('');

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const value: string = event.target.value;
        setSearchTerm(value);
        onSearchChange(value);
    };

    return (
        <div className="filter-container">
            <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                placeholder={placeholder}
                className="filter-content"
            />
        </div>
    );
};

export default SearchFilter;