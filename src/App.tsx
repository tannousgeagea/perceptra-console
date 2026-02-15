import './App.css';
import Projects from './pages/project/Projects';
import Layout from './components/ui/common/layout';
import ProjectDataset from './pages/dataset/Dataset';
import DatasetVersions from './pages/versions/DatasetVersions';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProjectLayout from './components/ui/common/project-layout';
import Index from './pages/annotate-tool/AnnotationTool';
import { ProtectedRoute, PublicRoute} from './pages/ProtectedRoute';
import AnalysisPage from './pages/analysis/Index';
import JobAnnotation from './pages/annotate/JobAnnotation';
import UploadIndex from './pages/upload/Index';
import NotFound from './pages/NotFound';
import ClassesManagement from './pages/class_management/ClassManagement';
import ActivityPage from './pages/activity/ProjectActivity';
import OrgActivityPage from './pages/activity/OrgActivity';
import Analytics from './pages/analytics/Analytics';
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
import CreateModel from './pages/models/CreateModel';
import SessionsPage from './pages/training_sessions/TrainingSession';
import SessionDetailPage from './pages/training_sessions/TrainingSessionDetails';
import TeamProgress from './pages/team_progress/TeamProgress';
import Inference from './pages/inference/Inference';
import CreateProject from './pages/project/create-project';
import Settings from './pages/settings/Settings';
import { TooltipProvider } from './components/ui/ui/tooltip';
import { OAuthCallback } from '@/pages/OAuthCallback';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import Signup from './pages/Signup';
import { AuthLayout } from './components/auth/AuthLayout';
import { ProjectProvider } from './contexts/ProjectContext';
import Billing from './pages/Billing';
import BillingReport from './pages/BillingReport';
import Evaluation from './pages/Evaluation';
import AutoAnnotate from "./pages/AutoAnnotate";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AuthProviderMock>
            <TooltipProvider delayDuration={100}>
              <Routes>
                <Route element={<PublicRoute />}>
                  <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/auth/callback" element={<OAuthCallback />} />
                  </Route>
                </Route>
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
                    <Route path='/activity' element={<OrgActivityPage />} />
                    <Route path="/billing" element={<Billing />} />
                    <Route path="/billing/report" element={<BillingReport />} />
                    <Route path='/settings/*' element={<Settings />} />
                    <Route path='projects/:projectId' element={
                      <ProjectProvider>
                        <ProjectLayout />
                      </ProjectProvider>
                    }>
                      <Route path='upload' element={<UploadIndex />} />
                      <Route path='dataset' element={<ProjectDataset />} />
                      {/* <Route path='annotate' element={<Annotate />} /> */}
                      <Route path='versions' element={<DatasetVersions />} />
                      <Route path="analysis" element={<AnalysisPage/>} />
                      <Route path='classes' element={<ClassesManagement/>} />
                      <Route path='analytics' element={<Analytics/>} />
                      <Route path='members' element={<ProjectMembersPage/>} />
                      <Route path='activity' element={<ActivityPage />} />
                      <Route path='annotate' element={<JobPage/>} />
                      <Route path="models" element={<ModelsList />} />
                      <Route path="models/new" element={<CreateModel />} />
                      <Route path="models/:modelId" element={<ModelDetail />} />
                      <Route path="models/:modelId/train" element={<ModelTraining />} />
                      <Route path="evaluation" element={<Evaluation />} />
                      <Route path="auto-annotate" element={<AutoAnnotate />} />
                      <Route path="sessions" element={<SessionsPage />} />
                      <Route path="sessions/:sessionId" element={<SessionDetailPage />} />
                      <Route path='annotate/job/:jobId' element={<JobAnnotation />} />
                      <Route path="no-permission" element={<NoPermissionPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Route>
                  <Route path='/projects/:projectId/images/:imageId' element={<Index />} />
                </Route>
              </Routes>
            </TooltipProvider>
            <Toaster />
            <Sonner />
          </AuthProviderMock>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;