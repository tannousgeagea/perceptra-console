import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import generateIcon from "../../../../assets/icons/actions/plus.png";
import { Plus } from 'lucide-react';
import './generate-version-btn.css';

interface GenerateDatasetVersionProps {
  projectId: string;
}

const GenerateDatasetVersion: FC<GenerateDatasetVersionProps> = ({ projectId }) => {
    const navigate = useNavigate();
    
    const handleGenerateVersion = (projectId: string): void => {
        navigate(`/projects/${projectId}/versions/generate`);
    }

    return (
        <>
            <button className="generate-btn" onClick={() => handleGenerateVersion(projectId)}>
                <Plus />
                Generate Version
            </button>
        </>
    );
};

export default GenerateDatasetVersion;