import React, { useRef, FC } from 'react';
import './file-select-button.css';
import folderUpload from '../../../assets/icons/icons8-mappe.svg';

interface FolderSelectButtonProps {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FolderSelectButton: FC<FolderSelectButtonProps> = ({ onChange }) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    
    const handleClick = (): void => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <>
            <input 
                type='file'
                // webkitdirectory="false"
                // directory=""
                multiple
                id='fileInput'
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={onChange}
            />

            <button id='selectFileButton' onClick={handleClick} className='upload-file-button'>
                <span className='upload-button-text'>
                    <img src={folderUpload} alt="Button icon" className="button-icon"/>
                    Select Folder
                </span>
            </button> 
        </>
    );
};

export default FolderSelectButton;