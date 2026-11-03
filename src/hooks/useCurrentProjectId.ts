import { matchPath, useLocation } from 'react-router-dom';

/** The project the current page belongs to (project pages and the annotator). */
export const useCurrentProjectId = (): string | undefined => {
  const { pathname } = useLocation();
  const match = matchPath({ path: '/projects/:projectId', end: false }, pathname);
  const projectId = match?.params.projectId;
  return projectId && projectId !== 'add' ? projectId : undefined;
};
