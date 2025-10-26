import { FC } from 'react';
import useFetchData from '@/hooks/use-fetch-data';
import ImageCard2 from '@/components/ui/card/image-card2';
import SplitCard from '@/components/ui/card/split-card';
import DownloadVersionBtn from '@/components/ui/button/actions/download-version-btn';

interface Version {
    id: number;
    version_number: string;
    name: string;
    created_at: string;
    count_images: number;
    count_train: number;
    count_val: number;
}

interface VersionContentProps {
    version: Version | null;
    projectId: string;
}

const VersionContent: FC<VersionContentProps> = ({ version, projectId }) => {
    const { data: versionImages }: { data?: { data: Array<{ image_name: string, image_url: string, image_id: string }> }; } = useFetchData(
        version ? `/api/v1/projects/${projectId}/versions/${version.version_number}` : ''
    );

    return (
        <>
            {version ? (
                <>
                    <div className="version-content-header">
                        <div className="version-content-title">
                            <h2>{version.name}</h2>
                            <p>Created at: {new Date(version.created_at).toLocaleString()}</p>
                        </div>

                        <DownloadVersionBtn
                            projectId={projectId}
                            versionID={version.id}
                        />
                    </div>

                    <div className="version-content-images">
                        <h3>{version.count_images} 
                            <p>Images</p>
                        </h3>
                        <div className="version-images">
                            {versionImages?.data?.map((image) => (
                                <ImageCard2 key={image.image_name} image={image} />
                            ))}
                        </div>
                    </div>

                    <div className="version-content-dataset-split">
                        <h3>Dataset Split</h3>
                        <div className="split-cards-container">
                            <SplitCard
                                key="0"
                                title="Train Set"
                                count={version.count_train}
                                color="#ffa500"
                                percentage={Math.round((version.count_train / version.count_images) * 100)}
                            />

                            <SplitCard
                                key="1"
                                title="Valid Set"
                                count={version.count_val}
                                color="#00bfff"
                                percentage={Math.round((version.count_val / version.count_images) * 100)}
                            />
                        </div>
                    </div>

                    <div className="version-content-preprocessing">
                        <h3>Preprocessing</h3>
                        <p>No preprocessing were applied</p>
                    </div>

                    <div className="version-content-augmentation">
                        <h3>Augmentation</h3>
                        <p>No augmentation were applied</p>
                    </div>
                </>
            ) : (
                <p>Select a version to view its details.</p>
            )}
        </>
    );
}

export default VersionContent;