import { useState, FC } from 'react';
import './filter.css';
import DownArrow from '../../../assets/icons/down-arrow.png';
import useToggle from '../../../hooks/use-toggle';

interface SortFilterProps {
    name: string;
    data: string[];
    onSortChange: (order: string) => void;
}

const SortFilter: FC<SortFilterProps> = ({ name, data, onSortChange }) => {
    const [sortOrder, setSortOrder] = useState<string>('Newest');
    const { isOpen, setIsOpen, filterRef, handleToggle } = useToggle();

    const handleSortChange = (order: string): void => {
        setSortOrder(order);
        onSortChange(order);
        setIsOpen(false);
    };

    return (
        <div className="filter-container" ref={filterRef}>
            <button className="filter-content" onClick={handleToggle}>
                <div className='filter-name'>
                    {name}  
                    <span>{sortOrder}</span>
                </div>
                <img src={DownArrow} alt="Button icon" className="filter-icon" />
            </button>
            {isOpen && (
                <div className="filter-dropdown">
                    {data.map((item: string) => (
                        <i
                            key={item}
                            className="filter-option"
                            onClick={() => handleSortChange(item)}
                        >
                            {item}
                        </i>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SortFilter;