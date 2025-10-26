import { useEffect, useRef, useState } from "react";
import React from "react";

const useToggle = (): { isOpen: boolean; setIsOpen: React.Dispatch<React.SetStateAction<boolean>>; filterRef: React.RefObject<HTMLDivElement>; handleToggle: () => void; } => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const filterRef = useRef<HTMLDivElement | null>(null);

    const handleToggle = (): void => {
        setIsOpen(!isOpen);
    };

    const handleClickOutside = (event: MouseEvent): void => {
        if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return { isOpen, setIsOpen, filterRef, handleToggle };
};

export default useToggle;