import React, { useState, useEffect, useRef, FC } from 'react';
import './filter.css';
import DownArrow from '../../../assets/icons/down-arrow.png';
import useToggle from '../../../hooks/use-toggle';

interface ScrollFilterProps {
    name: string;
    data: string[];
    onFilterChange: (value: string) => void;
}

const ScrollFilter: FC<ScrollFilterProps> = ({ name, data, onFilterChange }) => {
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
        <div className="filter-container" ref={filterRef}>
            <button className="filter-content" onClick={handleToggle}>
                <div className='filter-name'>
                    {name}
                    <span>{count}</span>
                </div>
                <img src={DownArrow} alt="Button icon" className="filter-icon" />
            </button>
            {isOpen && (
                <div className="filter-dropdown">
                    <div className='filter-clear' onClick={handleClearClick}>
                        <span>Clear All</span>
                    </div>
                    {data.map(item => (
                        <i
                            key={item}
                            className="filter-option"
                            onClick={() => handleOptionClick(item)}
                        >
                            {item}
                        </i>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ScrollFilter;