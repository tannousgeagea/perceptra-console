import './create-project-button.css';

import { FC } from 'react';

interface NewProjectButtonProps {
    onClick: () => void;
}

const NewProjectButton: FC<NewProjectButtonProps> = ({ onClick }) => {
    return (
        <button className="new-project-button" onClick={onClick}>
            + New Project
        </button>
    );
};

export default NewProjectButton;