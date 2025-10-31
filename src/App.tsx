import './App.css';
import Projects from './pages/project/projects';
import Layout from './components/ui/common/layout';
import Dataset from './pages/dataset/dataset';
import Versions from './pages/versions/versions';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProjectLayout from './components/ui/common/project-layout';
import Index from './pages/annotate-tool/annotate-tool';
import { ProtectedRoute, PublicRoute} from './pages/login/ProtectedRoute';
import AnalysisPage from './pages/analysis/Index';
import Annotate from './pages/annotate/annotate';
import UploadIndex from './pages/upload/Index';
import NotFound from './pages/NotFound';
import ClassesManagement from './pages/class_management/ClassManagement';
import AnalyticsPage from './pages/analytics/analytics';
import { Toaster } from './components/ui/ui/toaster';
import { Toaster as Sonner } from "@/components/ui/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OrganizationPage from './pages/organiation/OrganizationPage';
import OrganizationMembersPage from './pages/organiation/OrganizationMembersPage';
import ProjectMembersPage from './pages/organiation/ProjectMembersPage';
import JobPage from './pages/jobs/JobsPage';
import NoPermissionPage from './pages/NoPermissionPage';
import DataLake from './pages/datalake/DataLake';
import Login from './pages/Login';
import { AuthProviderMock } from './hooks/useAuthMock';
import { AuthProvider } from './contexts/AuthContext';
import ModelsList from "./pages/models/ModelsList";
import ModelDetail from "./pages/models/ModelDetail";
import ModelTraining from "./pages/models/ModelTraining";
import SessionsPage from './pages/training_sessions/TrainingSession';
import SessionDetailPage from './pages/training_sessions/TrainingSessionDetails';
import TeamProgress from './pages/team_progress/TeamProgress';
import Inference from './pages/inference/Inference';
import CreateProject from './pages/project/create-project';
import Settings from './pages/settings/Settings';
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AuthProviderMock>
            <Routes>
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Navigate to="/projects" replace />} />
                  <Route path="/no-permission" element={<NoPermissionPage />} />
                  <Route path='/organizations/:orgId' element={<OrganizationPage />} />
                  <Route path="/organizations/:orgId/members" element={<OrganizationMembersPage />} />
                  <Route path='/organizations/:orgId/progress' element={<TeamProgress />} />
                  <Route path='/datalake' element={<DataLake />} />
                  <Route path='/upload' element={<UploadIndex />} />
                  <Route path='/projects' element={<Projects />} />
                  <Route path='/projects/add' element={<CreateProject />} />
                  <Route path='/inference' element={<Inference />} />
                  <Route path='/settings/*' element={<Settings />} />
                  <Route path='projects/:projectId' element={<ProjectLayout />}>
                    <Route path='upload' element={<UploadIndex />} />
                    <Route path='dataset' element={<Dataset />} />
                    {/* <Route path='annotate' element={<Annotate />} /> */}
                    <Route path='versions' element={<Versions mode="view" />} />
                    <Route path='versions/:versionID' element={<Versions mode="view" />} />
                    <Route path="versions/generate" element={<Versions mode="generate" />} />
                    <Route path="analysis" element={<AnalysisPage/>} />
                    <Route path='classes' element={<ClassesManagement/>} />
                    <Route path='analytics' element={<AnalyticsPage/>} />
                    <Route path='members' element={<ProjectMembersPage/>} />
                    <Route path='annotate' element={<JobPage/>} />
                    <Route path="models" element={<ModelsList />} />
                    <Route path="models/:modelId" element={<ModelDetail />} />
                    <Route path="models/:modelId/train" element={<ModelTraining />} />
                    <Route path="sessions" element={<SessionsPage />} />
                    <Route path="sessions/:sessionId" element={<SessionDetailPage />} />
                    <Route path='annotate/job/:jobId' element={<Annotate/>} />
                    <Route path="no-permission" element={<NoPermissionPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Route>
                <Route path='/projects/:projectId/images/annotate' element={<Index />} />
              </Route>
            </Routes>
            <Toaster />
            <Sonner />
          </AuthProviderMock>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;