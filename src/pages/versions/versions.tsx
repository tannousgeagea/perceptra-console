import { useEffect, useState, FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useFetchData from '@/hooks/use-fetch-data';
import Spinner from '@/components/ui/animation/spinner';
import ErrorPopup from '@/components/ui/popup/error-popup';
import SuccessPopup from '@/components/ui/popup/success-popup';
import Header from '@/components/ui/header/Header';
import VersionList from './components/version-list';
import VersionContent from './components/version-content';
import GenerateVersionSection from './components/generate-version';
import './versions.css';

interface VersionsProps {
    mode: string;
}

const Versions: FC<VersionsProps> = ({ mode }) => {
    const { projectId, versionID } = useParams<{ projectId: string; versionID?: string }>();
    const navigate = useNavigate();
    const { data: versions, loading, error } = useFetchData(`/api/v1/projects/${projectId}/versions`);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [selectedVersion, setSelectedVersion] = useState<any | null>(null);

    useEffect(() => {
        if (versions && versions.length && mode === 'view') {
            if (!versionID) {
                const latestVersion = [...versions].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                const version_id: string = latestVersion.version_number;
                navigate(`/projects/${projectId}/versions/${latestVersion.version_number}`, { state : { version_id } });
                setSelectedVersion(latestVersion);
            } else {
                const currentVersion = versions.find((version: any) => version.version_number === parseInt(versionID));
                setSelectedVersion(currentVersion);
            }
        }
    }, [versions, versionID, navigate, projectId]);

    const dataLength: number = versions?.length || 0;

    return (
        <div className="versions">
            {mode === "view" ? (
                <Header
                    title="Dataset Version"
                    description={``}
                />
            ) : (
                <Header
                    title="Generate New Version"
                    description={``}
                />
            )}

            {loading ? (
                <Spinner />
            ) : error ? (
                <ErrorPopup message={error?.message} onClose={() => {}} />
            ) : dataLength === 0 && mode === 'view' ? (
                    <div className="no-results">
                        <i className="info-icon">ℹ️</i>
                        <span>The search returned 0 results.</span>
                    </div>
            ) : (
                <div className="versions-body">
                    <VersionList 
                        versions={versions}
                        setSelectedVersion={setSelectedVersion}
                        projectId={projectId || ''}
                    />
                    <div className="version-content">
                        {mode === "view" ? (
                            <VersionContent 
                                version={selectedVersion}
                                projectId={projectId || ''}
                            />
                        ) : (
                            <GenerateVersionSection 
                                projectId={projectId || ''}
                            />
                        )}
                    </div>
                </div>
            )}

            {error && <ErrorPopup message={error?.message} onClose={() => {}} />}
            {successMessage && <SuccessPopup message={successMessage} onClose={() => setSuccessMessage(null)} />}
        </div>
    );
};

export default Versions;