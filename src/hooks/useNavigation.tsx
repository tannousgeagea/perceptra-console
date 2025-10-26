import { useNavigate } from 'react-router-dom';

export const useNavigation = () => {
  const navigate = useNavigate();
  
  const goBack = () => {
    navigate(-1); // Go back one step in history
    // OR navigate('/projects') for specific route
  };

  const navigateToProject = (projectId: number) => {
    navigate(`/projects/${projectId}`);
  };

  const navigateToProjects = () => {
    navigate('/projects');
  };

  return { goBack, navigateToProject, navigateToProjects };
};