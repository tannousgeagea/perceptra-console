import { FC } from "react";
import AddToDatasetButton from "../button/actions/add-to-dataset-btn";
import RequestFeedbackBtn from "../button/actions/request-feedback-btn";
import './annotate-actions.css'

interface AnnotateActionsProps {
  projectId: string;
  totalRecord: number;
  onSuccess: () => void;
}

const AnnotateActions: FC<AnnotateActionsProps> = ({ projectId, totalRecord, onSuccess }) => {

  return (
    <>
      <div className="annotate-actions">
        {/* <RequestFeedbackBtn 
          projectId={projectId}
        /> */}
        
        <AddToDatasetButton 
            projectId={projectId  || ''}
            totalRecord={totalRecord}
            onSuccess={onSuccess}
        />
      </div>

    </>
  );
};

export default AnnotateActions;