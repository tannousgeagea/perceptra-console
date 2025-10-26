import { FC } from 'react';
import './submit-button.css'
import fileUpload from '../../../assets/icons/file.png'

interface SubmitButtonProps {
  onSubmit: () => void;
}

const SubmitButton: FC<SubmitButtonProps> = ({ onSubmit }) => {

    return (
        <div className='submit-button' onClick={onSubmit}>
            <div className='submit-button-content'>
                <img src={fileUpload} alt="Button icon" className="button-icon"/>
                <span>Save and Submit</span>
            </div>
        </div>
    );
};

export default SubmitButton;