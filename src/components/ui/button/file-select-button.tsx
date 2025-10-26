import React, { useRef, FC } from 'react';
import './file-select-button.css';

import fileUpload from '../../../assets/icons/file.png';

interface FileSelectButtonProps {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileSelectButton: FC<FileSelectButtonProps> = ({ onChange }) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    
    const handleClick = (): void => {
        if(fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <>
            <input 
                type='file'
                multiple
                id='fileInput'
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={onChange}
            />

            <button id='selectFileButton' onClick={handleClick} className='upload-file-button'>
                <span className='upload-button-text'>
                    <img src={fileUpload} alt="Button icon" className="button-icon"/>
                    Select Files
                </span>
            </button> 
        </>
    );
};

export default FileSelectButton;