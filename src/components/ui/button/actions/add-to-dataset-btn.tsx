import React from 'react';
import { useState } from 'react';
import useAddToDataset from '@/hooks/useAddToDataset';
import LoadingPopup from '../../popup/loading-popup';
import ErrorPopup from '../../popup/error-popup';
import SuccessPopup from '../../popup/success-popup';
import TrainValidSlider from '../../modal/TrainValidSlider';
import { useSplitDataset } from '../../../../hooks/use-split-dataset';
import { Plus } from 'lucide-react';
import './add-to-dataset-btn.css'

interface AddToDatasetButtonProps {
  projectId: string;
  totalRecord: number;
  onSuccess?: () => void; // Callback when the operation is successful
}

const AddToDatasetButton: React.FC<AddToDatasetButtonProps> = ({
  projectId,
  totalRecord,
  onSuccess,
}) => {
  const { addToDataset, loading, error } = useAddToDataset();
  const { splitDataset } = useSplitDataset();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showError, setShowError] = useState<boolean>(false);
  const [TrainPercentage, setTrainPercentage] = useState<number>();
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleClick = async (): Promise<void>=> {
    try {
        await addToDataset(projectId);
        await splitDataset(projectId, TrainPercentage);
        setSuccessMessage(`Successfully added ${totalRecord} images to Dataset !`)
        if (onSuccess) {
          onSuccess();
        }
        setShowModal(false)
    } catch(err) {
        console.log(err)
        setShowError(true)
    }
  };

  return (
    <div className='add-to-dataset-btn-container'>
      <button
        onClick={() => setShowModal(true)}
        disabled={totalRecord === 0}
        className="add-to-dataset-btn"
      >
        <Plus />
        {loading ? 'Adding...' : totalRecord === 1 ? `Add ${totalRecord} Image to Dataset` : `Add ${totalRecord} Images to Dataset`}
      </button>

      <TrainValidSlider
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        defaultTrain={70}
        onChange={setTrainPercentage}
        onClick={handleClick}
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

export default AddToDatasetButton;
