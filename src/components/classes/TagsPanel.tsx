import { useParams } from 'react-router-dom';
import { TagManager } from '@/components/tags/TagManager';

/** Classes → Tags: the organization's tags as used in this project. */
const TagsPanel = () => {
  const { projectId } = useParams<{ projectId: string }>();
  return <TagManager projectId={projectId} />;
};

export default TagsPanel;
