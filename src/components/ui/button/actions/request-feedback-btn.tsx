import { FC, useState } from 'react';
import { useRequestFeedback } from '@/hooks/use-request-feedback';
import ErrorPopup from '../../popup/error-popup';
import SuccessPopup from '../../popup/success-popup';
import LoadingPopup from '../../popup/loading-popup';
import { Sticker } from 'lucide-react';
import './request-feedback-btn.css';

interface RequestFeedbackBtnProps {
    projectId: string;
}

const RequestFeedbackBtn: FC<RequestFeedbackBtnProps> = ({ projectId }) => {
    const { requestFeedback, loading, error } = useRequestFeedback();
    const [showError, setShowError] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleRequestFeedback = async (): Promise<void> => {
        try {
          await requestFeedback(projectId);
          setSuccessMessage("Feedback request was successful!");
        } catch (err) {
          console.error(err);
          setShowError(true)
        }
      };

    return (
        <div className='request-feedback-container'>
            <button
                className="request-feedback-btn"
                onClick={handleRequestFeedback}
                disabled={loading}
            >   
                <Sticker />
                Request Feedback
            </button>
            

            {loading && <LoadingPopup />}
            {showError && <ErrorPopup message={error as string} onClose={() => setShowError(false)} />}
            {successMessage && (
                <SuccessPopup
                    message={successMessage}
                    onClose={() => setSuccessMessage(null)}
                />
            )}
        </div>
    );
};

export default RequestFeedbackBtn;