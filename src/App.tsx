import './App.css';
import { lazy, Suspense } from 'react';
import Layout from './components/ui/common/layout';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProjectLayout from './components/ui/common/project-layout';
import { ProtectedRoute, PublicRoute} from './pages/ProtectedRoute';
import { Toaster } from './components/ui/ui/toaster';
import { Toaster as Sonner } from "@/components/ui/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from './contexts/AuthContext';
import { TooltipProvider } from './components/ui/ui/tooltip';
import { AuthLayout } from './components/auth/AuthLayout';
import { ProjectProvider } from './contexts/ProjectContext';
import { AppBoot } from './components/layout/AppBoot';
import CommandPalette from './components/command-palette/CommandPalette';
import { RealtimeProvider } from './contexts/RealtimeContext';
import { SentBackWatcher } from './components/review/SentBackWatcher';
import { NotificationSidebar } from './components/jobs/NotificationSidebar';
import { PageFallback } from './components/layout/PageFallback';

// Pages load on first visit, so signing in doesn't download the annotation
// tool, charts, billing PDFs and so on. Layouts and guards above stay eager.
const Projects = lazy(() => import('./pages/project/Projects'));
const ProjectDataset = lazy(() => import('./pages/dataset/Dataset'));
const DatasetVersions = lazy(() => import('./pages/versions/DatasetVersions'));
const Index = lazy(() => import('./pages/annotate-tool/AnnotationTool'));
const AnalysisPage = lazy(() => import('./pages/analysis/Index'));
const JobAnnotation = lazy(() => import('./pages/annotate/JobAnnotation'));
const UploadIndex = lazy(() => import('./pages/upload/Index'));
const RegisterFromStorage = lazy(() => import('./pages/register/RegisterFromStorage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ClassesManagement = lazy(() => import('./pages/class_management/ClassManagement'));
const ActivityPage = lazy(() => import('./pages/activity/ProjectActivity'));
const OrgActivityPage = lazy(() => import('./pages/activity/OrgActivity'));
const Analytics = lazy(() => import('./pages/analytics/Analytics'));
const OrganizationPage = lazy(() => import('./pages/organiation/OrganizationPage'));
const OrganizationMembersPage = lazy(() => import('./pages/organiation/OrganizationMembersPage'));
const ProjectMembersPage = lazy(() => import('./pages/organiation/ProjectMembersPage'));
const JobPage = lazy(() => import('./pages/jobs/JobsPage'));
const NoPermissionPage = lazy(() => import('./pages/NoPermissionPage'));
const DataLake = lazy(() => import('./pages/datalake/DataLake'));
const Login = lazy(() => import('./pages/Login'));
const InvitePage = lazy(() => import('./pages/invite/InvitePage'));
const ModelsList = lazy(() => import('./pages/models/ModelsList'));
const ModelDetail = lazy(() => import('./pages/models/ModelDetail'));
const ModelTraining = lazy(() => import('./pages/models/ModelTraining'));
const CreateModel = lazy(() => import('./pages/models/CreateModel'));
const SessionsPage = lazy(() => import('./pages/training_sessions/TrainingSession'));
const SessionDetailPage = lazy(() => import('./pages/training_sessions/TrainingSessionDetails'));
const TeamProgress = lazy(() => import('./pages/team_progress/TeamProgress'));
const Inference = lazy(() => import('./pages/inference/Inference'));
const CreateProject = lazy(() => import('./pages/project/create-project'));
const Settings = lazy(() => import('./pages/settings/Settings'));
const OAuthCallback = lazy(() => import('./pages/OAuthCallback').then((m) => ({ default: m.OAuthCallback })));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Signup = lazy(() => import('./pages/Signup'));
const Billing = lazy(() => import('./pages/Billing'));
const BillingReport = lazy(() => import('./pages/BillingReport'));
const Invoices = lazy(() => import('./pages/Invoices'));
const InvoiceDetails = lazy(() => import('./pages/InvoiceDetails'));
const Contractors = lazy(() => import('./pages/Contractors'));
const ContractorSummary = lazy(() => import('./pages/ContractorSummary'));
const Evaluation = lazy(() => import('./pages/Evaluation'));
const AutoAnnotate = lazy(() => import('./pages/AutoAnnotate'));
const ScanHistory = lazy(() => import('./pages/ScanHistory'));
const ScanResults = lazy(() => import('./pages/ScanResults'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // For queries that don't set their own (most do): reuse data for 30 s
      // instead of refetching on every mount and window focus.
      staleTime: 30_000,
      // One retry, not three with backoff, so errors show in ~1 s, not ~7 s.
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppBoot>
          <AuthProvider>
              <TooltipProvider delayDuration={100}>
                <RealtimeProvider>
                <Suspense fallback={<PageFallback fullScreen />}>
                <Routes>
                  <Route element={<PublicRoute />}>
                    <Route element={<AuthLayout />}>
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                    </Route>
                  </Route>
                  {/* Outside PublicRoute: it signs the user in, then decides where to go
                      (e.g. back to an invitation), so it must not be redirected away. */}
                  <Route path="/auth/callback" element={<OAuthCallback />} />
                  {/* Invitation links: for signed-out and signed-in visitors alike */}
                  <Route path="/invite/:token" element={<InvitePage />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Layout />}>
                      <Route index element={<Navigate to="/projects" replace />} />
                      <Route path="/no-permission" element={<NoPermissionPage />} />
                      <Route path='/organizations/:orgId' element={<OrganizationPage />} />
                      <Route path="/organizations/:orgId/members" element={<OrganizationMembersPage />} />
                      <Route path='/team' element={<TeamProgress />} />
                      <Route path='/organizations/:orgId/progress' element={<Navigate to="/team" replace />} />
                      <Route path='/datalake' element={<DataLake />} />
                      <Route path='/upload' element={<UploadIndex />} />
                      <Route path='/link' element={<RegisterFromStorage />} />
                      <Route path='/register' element={<Navigate to="/link" replace />} />
                      <Route path='/projects' element={<Projects />} />
                      <Route path='/projects/add' element={<CreateProject />} />
                      <Route path='/inference' element={<Inference />} />
                      <Route path='/activity' element={<OrgActivityPage />} />
                      <Route path="/billing" element={<Billing />} />
                      <Route path="/billing/report" element={<BillingReport />} />
                      <Route path="/billing/invoices" element={<Invoices />} />
                      <Route path="/billing/invoices/:invoiceId" element={<InvoiceDetails />} />
                      <Route path="/billing/contractors" element={<Contractors />} />
                      <Route path="/billing/contractors/:userId/summary" element={<ContractorSummary />} />
                      <Route path='/settings/*' element={<Settings />} />
                      <Route path="/similarity" element={<Navigate to="/similarity/scans" replace />} />
                      <Route path="/similarity/scans" element={<ScanHistory />} />
                      <Route path="/similarity/scans/:scanId/results" element={<ScanResults />} />
                      <Route path='projects/:projectId' element={
                        <ProjectProvider>
                          <ProjectLayout />
                        </ProjectProvider>
                      }>
                        <Route path='upload' element={<UploadIndex />} />
                        <Route path='link' element={<RegisterFromStorage />} />
                        <Route path='register' element={<Navigate to="../link" replace />} />
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
                        <Route path='annotate/job/:jobId/auto-annotate' element={<AutoAnnotate />} />
                        <Route path="no-permission" element={<NoPermissionPage />} />
                        <Route path="*" element={<NotFound />} />
                      </Route>
                      <Route path="*" element={<NotFound />} />
                    </Route>
                    <Route path='/projects/:projectId/images/:imageId' element={<Index />} />
                  </Route>
                </Routes>
                </Suspense>
                <SentBackWatcher />
                <NotificationSidebar />
                </RealtimeProvider>
              </TooltipProvider>
              <Toaster />
              <Sonner />
              <CommandPalette />
          </AuthProvider>
        </AppBoot>
      </Router>
    </QueryClientProvider>
  );
}

export default App;