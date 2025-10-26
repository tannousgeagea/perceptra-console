import { FC } from "react";
import { useNavigate } from "react-router-dom";
import VersionCard from "@/components/ui/card/version-card";

interface Version {
    id: string;
    version_number: string;
    created_at: string;
    name: string;
    count_images: number;
}

interface VersionListProps {
    versions: Version[];
    setSelectedVersion: (version: Version | undefined) => void;
    projectId: string;
}

const VersionList: FC<VersionListProps> = ({ versions, setSelectedVersion, projectId }) => {
    const navigate = useNavigate();
    
    const handleViewVersion = (versionID: string): void => {
        const selected = versions.find((version) => version.version_number === versionID);
        setSelectedVersion(selected);
        navigate(`/projects/${projectId}/versions/${versionID}`, { state: { versionID } });
    };

    return (
        <div className="versions-list">
            <h2>Existing Versions</h2>
            {versions.length ? (
                <div className="versions-selector">
                    {versions.map((version) => (
                        <VersionCard 
                            key={version.id}
                            version={version}
                            onView={() => handleViewVersion(version.version_number)}
                        />
                    ))}
                </div>
            ) : (
                <p>No versions available.</p>
            )}
        </div>
    );
};

export default VersionList;