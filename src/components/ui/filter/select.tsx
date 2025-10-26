import { useState, FC } from 'react';
import './select.css';
import DownArrow from '@/assets/icons/down-arrow.png';
import useToggle from '@/hooks/use-toggle';
import { ChevronDown } from 'lucide-react';

interface FilterItem {
    key: string;
    value: string;
  }

interface ScrollFilterProps {
    name: string;
    data: FilterItem[] | null;
    onFilterChange: (value: string) => void;
}

const SelectFilter: FC<ScrollFilterProps> = ({ name, data, onFilterChange }) => {
    const { isOpen, setIsOpen, filterRef, handleToggle } = useToggle();
    const [count, setCount] = useState<number | string>('');

    const handleOptionClick = (value: string): void => {
        onFilterChange(value);
        setCount(1);
        setIsOpen(false);
    };

    const handleClearClick = (): void => {
        onFilterChange('');
        setCount('');
    };

    return (
        <div className="select-filter-container" ref={filterRef}>
            <button className="select-filter-content" onClick={handleToggle}>
                <div className='select-filter-name'>
                    {name}
                    <span>{count}</span>
                </div>
                <ChevronDown />
            </button>
            {isOpen && (
                <div className="select-filter-dropdown">
                    <div className='select-filter-clear' onClick={handleClearClick}>
                        <span>Clear</span>
                    </div>
                    {data?.map(item => (
                        <i
                            key={item.key}
                            className="select-filter-option"
                            onClick={() => handleOptionClick(item.key)}
                        >
                            {item.value}
                        </i>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SelectFilter;