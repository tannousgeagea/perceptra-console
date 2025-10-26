import { useState, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateVersion } from '../../../../hooks/use-create-version';
import ErrorPopup from '../../popup/error-popup';
import SuccessPopup from '../../popup/success-popup';
import LoadingPopup from '../../popup/loading-popup';
import { TaskProgressTracker } from '@/components/progress/TaskProgressTracker';
import './create-version-btn.css';

interface CreateDatasetVersionProps {
    projectId: string;
}

const CreateDatasetVersion: FC<CreateDatasetVersionProps> = ({ projectId }) => {
    const { createVersion, loading, error, taskId } = useCreateVersion();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showError, setShowError] = useState<boolean>(false);
    const navigate = useNavigate()
    
    const handleCreateVersion = async (): Promise<void> => {
        try {
            const newVersion = await createVersion(projectId);
            if (newVersion) {
                console.log(newVersion)
                setSuccessMessage("Version created successfully!");
                setTimeout(() => {
                  navigate(`/projects/${projectId}/versions`);
                }, 2000);
              }
        } catch (err) {
            console.error(err);
            setShowError(true);
        }
    };

    return (
        <>
            <button className="create-btn" onClick={handleCreateVersion}>
                Create Version
            </button>

            {loading && taskId && (
                <div className='fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50'>
                    <div className='rounded-lg px-8 py-6 text-center shadow-lg max-w-md w-[90%]'>
                        <TaskProgressTracker
                            taskId={taskId || ''}
                            title="Create Version"
                            variant="bar"
                            size="md"
                            pollingInterval={1000}
                        />
                    </div>
                </div>
            )}
            {showError && <ErrorPopup message={error} onClose={() => setShowError(false)} />}
            {successMessage && (
                <SuccessPopup
                    message={successMessage}
                    onClose={() => setSuccessMessage(null)}
                />
            )}

        </>
    );
};

export default CreateDatasetVersion;