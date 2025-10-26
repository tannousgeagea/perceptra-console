import { FC, useState } from 'react';
import useFetchData from '@/hooks/use-fetch-data';
import Spinner from '@/components/ui/animation/spinner';
import ImageCard2 from '@/components/ui/card/image-card2';
import SplitCard from '@/components/ui/card/split-card';
import CreateDatasetVersion from '@/components/ui/button/actions/create-version-btn';
import AugmentationPanel from '@/components/augmentation/AugmentationPanel';
import Modal from '@/components/ui/modal/modal';
import plusIcon from "@/assets/icons/actions/plus.png"

interface GenerateVersionSectionProps {
  projectId: string;
}

interface AugmentationData {
  id:  number;
  name: string;
  title: string;
  thumbnail: string;
  description: string;
}


interface Annotation {
  xyxyn: number[]; // Coordinates in normalized [x_min, y_min, x_max, y_max] format
}

interface ImageProps {
  image_id: string
  image_url: string; // URL of the image
  image_name: string; // Name of the image
  annotations?: Annotation[]; // Optional annotations
}

const GenerateVersionSection: FC<GenerateVersionSectionProps> = ({ projectId }) => {
  const {
    data: datasetInfo,
    loading: datasetLoading,
    // error: datasetError,
  }: {
    data: { 
      total_images: number; 
      count_train: number; 
      count_val: number; 
      data?: Array<ImageProps> 
    };
    loading: boolean;
    error: Error | null;
  } = useFetchData(`/api/v1/projects/${projectId}/dataset-info`);

  const [isOpen, setIsOpen] = useState(false)
  const { data: augmentations, loading:augmentationLoading}:
    {
      data: Array<AugmentationData>;
      loading: boolean;
      error: Error | null;
    } = useFetchData(`/api/v1/augmentations`)

  return (
    <div className="generate-version">
      {datasetLoading ? (
        <div className="spinner-container">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="version-content-header">
            <p>Create New Version</p>
          </div>

          <div className="version-content-images">
            <h3>
              {datasetInfo.total_images} 
              <p>Images</p>
            </h3>
            <div className="version-images">
              {datasetInfo?.data?.map((image, index) => (
                <ImageCard2 key={index} image={image} />
              ))}
            </div>
          </div>

          <div className="version-content-dataset-split">
            <h3>Dataset Split</h3>
            <div className="split-cards-container">
              <SplitCard
                key="0"
                title="Train Set"
                count={datasetInfo.count_train}
                color="#ffa500"
                percentage={Math.round((datasetInfo.count_train / datasetInfo.total_images) * 100)}
              />

              <SplitCard
                key="1"
                title="Valid Set"
                count={datasetInfo.count_val}
                color="#00bfff"
                percentage={Math.round((datasetInfo.count_val / datasetInfo.total_images) * 100)}
              />
            </div>
          </div>

          <div className="version-content-preprocessing">
            <h3>Preprocessing</h3>
            <p>No preprocessing were applied</p>
          </div>

          <div className="version-content-augmentation">
            <h3>Augmentation</h3>
            <button className='add-augmentation-btn' onClick={() => setIsOpen(true)} >
              <img src={plusIcon} alt="add augmentation btn" />
              Add Augmentation Step
              </button>
            <Modal isOpen={isOpen} title="Augmentation settings" onClose={() => setIsOpen(false)}>
              {!augmentationLoading ? (<AugmentationPanel data={augmentations}/>) : <Spinner />}
            </Modal>
          </div>

          <div className="create-version-btn">
            <CreateDatasetVersion 
              projectId={projectId}
            />
          </div>

        </>
      )}
    </div>
  );
};

export default GenerateVersionSection;