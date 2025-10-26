import { FC, useState } from 'react';
import { useSplitDataset } from '../../../../hooks/use-split-dataset';
import ErrorPopup from '../../popup/error-popup';
import SuccessPopup from '../../popup/success-popup';
import LoadingPopup from '../../popup/loading-popup';
import splitIcon from '../../../../assets/icons/actions/cut.png'
import TrainValidSlider from '../../modal/TrainValidSlider';
import './split-dataset-btn.css'

interface SplitDatasetButtonProps {
    projectId: string;
    onSplitComplete?: (result: any) => void;
}

const SplitDatasetButton: FC<SplitDatasetButtonProps> = ({ projectId, onSplitComplete }) => {
    const { splitDataset, loading, error } = useSplitDataset();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showError, setShowError] = useState<boolean>(false);
    const [TrainPercentage, setTrainPercentage] = useState<number>();
    const [showModal, setShowModal] = useState<boolean>(false);

    const handleSplitDataset = async (): Promise<void> => {
        try {
            console.log(TrainPercentage)
            const result = await splitDataset(projectId, TrainPercentage);
            setSuccessMessage(result.detail);
            setShowModal(false)
            if (onSplitComplete) onSplitComplete(result); // Callback to refresh UI or fetch updated data
        } catch (err) {
            console.error(err);
            setShowError(true);
        }
    };

    return (
        <div className='split-btn-container'>
            <button
                className="split-dataset-btn"
                onClick={() => setShowModal(true)}
                disabled={loading}
            >   
                <img src={splitIcon} alt="generate-icon" />
                Split Dataset
            </button>
            
            <TrainValidSlider
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                defaultTrain={70}
                onChange={setTrainPercentage}
                onClick={handleSplitDataset}
            />

            {loading && <LoadingPopup />}
            {showError && <ErrorPopup message={error} onClose={() => setShowError(false)} />}
            {successMessage && (
                <SuccessPopup
                    message={successMessage}
                    onClose={() => setSuccessMessage(null)}
                />
            )}
        </div>
    );
};

export default SplitDatasetButton;