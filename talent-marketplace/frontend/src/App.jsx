import React, { useEffect, lazy, Suspense } from 'react';
import { MotionConfig } from 'framer-motion';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from 'react-router-dom';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';
import PageTransition from './components/PageTransition';
import CustomCursor from './components/CustomCursor';

// These three pull in recharts (a large charting library) purely for
// UI that starts closed/empty — eagerly importing them was tripling the
// main bundle's size for every single page load. Lazy-loading moves
// recharts into its own async chunk instead of the critical path.
const CommandPalette = lazy(() => import('./components/CommandPalette'));
const CompareDock = lazy(() => import('./components/CompareDock'));
const BudgetCalculatorModal = lazy(() => import('./components/BudgetCalculatorModal'));

// Route-level code splitting
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProfileEditor = lazy(() => import('./pages/ProfileEditor'));
const PortfolioManager = lazy(() => import('./pages/PortfolioManager'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const CastingBoard = lazy(() => import('./pages/CastingBoard'));
const CastingDetail = lazy(() => import('./pages/CastingDetail'));
const CreateCasting = lazy(() => import('./pages/CreateCasting'));
const MyApplications = lazy(() => import('./pages/MyApplications'));
const ManageApplicants = lazy(() => import('./pages/ManageApplicants'));
const TalentSearch = lazy(() => import('./pages/TalentSearch'));
const Chat = lazy(() => import('./pages/Chat'));
const Notifications = lazy(() => import('./pages/Notifications'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

const RouteFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh] text-amber-400 font-mono text-xs uppercase tracking-[0.25em] animate-pulse">
    <span>Loading Atelier Experience…</span>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <RouteFallback />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
};

// Declarative role gate for routes that only make sense for specific roles
const RoleRoute = ({ roles, children }) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return <RouteFallback />;
  if (!roles.includes(user?.role)) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
        <p className="text-rose-400 font-semibold mb-4 font-mono text-sm">
          Access Restricted: You do not hold permissions for this stage.
        </p>
        <Link to="/dashboard" className="btn-ghost-luxury text-xs !py-2">
          Back to Studio Dashboard
        </Link>
      </div>
    );
  }

  return children;
};

function App() {
  const { checkAuth } = useAuthStore();
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ErrorBoundary>
      {/* reducedMotion="user" makes every framer-motion animation in the
          app honor the OS prefers-reduced-motion setting automatically —
          transform/layout motion is stripped while opacity fades still
          play, matching "gentler, not zero" rather than killing motion
          outright. */}
      <MotionConfig reducedMotion="user">
      <Router>
        <div className="min-h-screen bg-theme-base font-sans text-theme-primary flex flex-col justify-between selection:bg-amber-400 selection:text-black relative overflow-hidden">
          {/* Ambient Glow Background */}
          <div className="pointer-events-none fixed inset-0 z-0">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-amber-600/10 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse-slow"></div>
            <div className="absolute top-1/2 left-1/2 w-[80%] h-[80%] bg-purple-900/10 rounded-full blur-[100px] mix-blend-screen opacity-30"></div>
          </div>

          <CustomCursor />

          <div className="z-10 flex flex-col min-h-screen w-full relative">
            <Navbar />
            <ScrollProgress />
            <main className="flex-1">
              <Suspense fallback={<RouteFallback />}>
                <PageTransition>
                  <Routes>
                    {/* Public & Editorial Pages */}
                    <Route path="/" element={<Home />} />
                    <Route path="/castings" element={<CastingBoard />} />
                    <Route path="/search" element={<TalentSearch />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />

                    {/* Authenticated Workspace */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile/edit"
                      element={
                        <ProtectedRoute>
                          <ProfileEditor />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/portfolio"
                      element={
                        <ProtectedRoute>
                          <RoleRoute roles={['model']}>
                            <PortfolioManager />
                          </RoleRoute>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/p/:profileId"
                      element={
                        <ProtectedRoute>
                          <PublicProfile />
                        </ProtectedRoute>
                      }
                    />

                    {/* Castings & Applications */}
                    <Route
                      path="/castings/:id"
                      element={
                        <ProtectedRoute>
                          <CastingDetail />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/castings/create"
                      element={
                        <ProtectedRoute>
                          <RoleRoute
                            roles={['industry_professional', 'pageant_organizer', 'admin']}
                          >
                            <CreateCasting />
                          </RoleRoute>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/castings/:id/applicants"
                      element={
                        <ProtectedRoute>
                          <RoleRoute
                            roles={['industry_professional', 'pageant_organizer', 'admin']}
                          >
                            <ManageApplicants />
                          </RoleRoute>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/applications"
                      element={
                        <ProtectedRoute>
                          <RoleRoute roles={['model']}>
                            <MyApplications />
                          </RoleRoute>
                        </ProtectedRoute>
                      }
                    />

                    {/* Direct Communications & Admin */}
                    <Route
                      path="/chat/:applicationId"
                      element={
                        <ProtectedRoute>
                          <Chat />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/notifications"
                      element={
                        <ProtectedRoute>
                          <Notifications />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute>
                          <RoleRoute roles={['admin']}>
                            <AdminDashboard />
                          </RoleRoute>
                        </ProtectedRoute>
                      }
                    />

                    <Route path="/privacy" element={<LegalPage />} />
                <Route path="/terms" element={<LegalPage />} />
                <Route path="/security" element={<LegalPage />} />

                <Route path="*" element={<NotFound />} />
                  </Routes>
                </PageTransition>
              </Suspense>
            </main>
            <Footer />
            <Suspense fallback={null}>
              <CommandPalette />
              <CompareDock />
              <BudgetCalculatorModal />
            </Suspense>
          </div>
        </div>
      </Router>
      </MotionConfig>
    </ErrorBoundary>
  );
}

export default App;
