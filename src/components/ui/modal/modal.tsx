import React, { FC } from 'react';
import closeIcon from "@/assets/icons/nav/close.png"
import './modal.css';

interface ModalProps {
    isOpen: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: FC<ModalProps> = ({ isOpen, title, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="close-button" onClick={onClose}>
                        <img src={closeIcon} alt='close icon' />
                    </button>
                </div>
                <div className='modal-content'>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;