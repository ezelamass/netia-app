import { Suspense, lazy, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import type { UserRole } from "@/contexts/AuthContext";
import { DemoProvider } from "@/contexts/DemoContext";
import { RouteGuard } from "@/components/RouteGuard";
import { AppShell } from "@/layouts/AppShell";
import { PageSkeleton } from "@/components/skeletons/PageSkeleton";

// Public pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const ClubsLandingPage = lazy(() => import("./pages/ClubsLandingPage"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Demo = lazy(() => import("./pages/Demo"));
const DemoEntry = lazy(() => import("./pages/DemoEntry"));

// Student pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Training = lazy(() => import("./pages/Training"));
const DiagnosticTest = lazy(() => import("./pages/DiagnosticTest"));
const Chat = lazy(() => import("./pages/Chat"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Settings = lazy(() => import("./pages/Settings"));
const OnboardingResult = lazy(() => import("./pages/OnboardingResult"));

// Parent pages
const ParentDashboard = lazy(() => import("./pages/parent/ParentDashboard"));
const ParentChild = lazy(() => import("./pages/parent/ParentChild"));
const ParentMedical = lazy(() => import("./pages/parent/ParentMedical"));

// Club pages
const ClubDashboard = lazy(() => import("./pages/club/ClubDashboard"));
const Members = lazy(() => import("./pages/club/Members"));
const Teams = lazy(() => import("./pages/club/Teams"));
const Fees = lazy(() => import("./pages/club/Fees"));
const Medical = lazy(() => import("./pages/club/Medical"));
const Attendance = lazy(() => import("./pages/club/Attendance"));
const Fixtures = lazy(() => import("./pages/club/Fixtures"));
const ClubSetup = lazy(() => import("./pages/club/ClubSetup"));
const ParentFees = lazy(() => import("./pages/parent/ParentFees"));
const ParentAnnouncements = lazy(() => import("./pages/parent/ParentAnnouncements"));
const TrainingLoad = lazy(() => import("./pages/club/TrainingLoad"));
const Reports = lazy(() => import("./pages/club/Reports"));
const Communication = lazy(() => import("./pages/club/Communication"));

// Classroom pages
const Classroom = lazy(() => import("./pages/Classroom"));
const ClassroomModule = lazy(() => import("./pages/ClassroomModule"));
const ClassroomLesson = lazy(() => import("./pages/ClassroomLesson"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const Users = lazy(() => import("./pages/admin/Users"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminCourses = lazy(() => import("./pages/admin/Courses"));

const queryClient = new QueryClient();

const ALL: UserRole[] = ["player", "parent", "coach", "club_admin", "admin"];
const PLAYER: UserRole[] = ["player", "coach", "club_admin", "admin"];
const CLUB: UserRole[] = ["coach", "club_admin", "admin"];
const PARENT: UserRole[] = ["parent"];
const ADMIN: UserRole[] = ["admin"];

const guard = (roles: UserRole[], el: ReactNode) => (
  <RouteGuard allowedRoles={roles}>{el}</RouteGuard>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <DemoProvider>
              <Suspense fallback={<div className="p-6"><PageSkeleton /></div>}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/clubes" element={<ClubsLandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/demo" element={<Demo />} />
                  <Route path="/demo/:slug" element={<DemoEntry />} />
                  <Route path="/onboarding" element={guard(ALL, <Onboarding />)} />
                  <Route path="/onboarding-result" element={guard(ALL, <OnboardingResult />)} />

                  {/* Authenticated routes share one shell (no se remonta al navegar) */}
                  <Route element={<RouteGuard><AppShell /></RouteGuard>}>
                    {/* Player */}
                    <Route path="/dashboard" element={guard(PLAYER, <Dashboard />)} />
                    <Route path="/profile" element={guard(ALL, <Profile />)} />
                    <Route path="/calendar" element={guard(PLAYER, <Calendar />)} />
                    <Route path="/training" element={guard(PLAYER, <Training />)} />
                    <Route path="/chat" element={guard(PLAYER, <Chat />)} />
                    <Route path="/settings" element={guard(ALL, <Settings />)} />
                    <Route path="/leaderboard" element={guard(PLAYER, <Leaderboard />)} />
                    <Route path="/achievements" element={guard(PLAYER, <Achievements />)} />
                    <Route path="/diagnostic" element={guard(PLAYER, <DiagnosticTest />)} />

                    {/* Classroom */}
                    <Route path="/classroom" element={guard(PLAYER, <Classroom />)} />
                    <Route path="/classroom/:moduleId" element={guard(PLAYER, <ClassroomModule />)} />
                    <Route path="/classroom/:moduleId/lesson/:lessonId" element={guard(PLAYER, <ClassroomLesson />)} />

                    {/* Parent */}
                    <Route path="/parent/dashboard" element={guard(PARENT, <ParentDashboard />)} />
                    <Route path="/parent/child" element={guard(PARENT, <ParentChild />)} />
                    <Route path="/parent/child/:childId" element={guard(PARENT, <ParentChild />)} />
                    <Route path="/parent/medical" element={guard(PARENT, <ParentMedical />)} />
                    <Route path="/parent/fees" element={guard(PARENT, <ParentFees />)} />
                    <Route path="/parent/announcements" element={guard(PARENT, <ParentAnnouncements />)} />

                    {/* Club */}
                    <Route path="/club/dashboard" element={guard(CLUB, <ClubDashboard />)} />
                    <Route path="/club/roster" element={<Navigate to="/club/members" replace />} />
                    <Route path="/club/members" element={guard(CLUB, <Members />)} />
                    <Route path="/club/teams" element={guard(CLUB, <Teams />)} />
                    <Route path="/club/fees" element={guard(CLUB, <Fees />)} />
                    <Route path="/club/medical" element={guard(CLUB, <Medical />)} />
                    <Route path="/club/attendance" element={guard(CLUB, <Attendance />)} />
                    <Route path="/club/fixtures" element={guard(CLUB, <Fixtures />)} />
                    <Route path="/club/setup" element={guard(CLUB, <ClubSetup />)} />
                    <Route path="/club/reports" element={guard(CLUB, <Reports />)} />
                    <Route path="/club/training-load" element={guard(CLUB, <TrainingLoad />)} />
                    <Route path="/club/communication" element={guard(CLUB, <Communication />)} />

                    {/* Platform admin */}
                    <Route path="/admin/dashboard" element={guard(ADMIN, <AdminDashboard />)} />
                    <Route path="/admin/users" element={guard(ADMIN, <Users />)} />
                    <Route path="/admin/analytics" element={guard(ADMIN, <Analytics />)} />
                    <Route path="/admin/settings" element={guard(ADMIN, <AdminSettings />)} />
                    <Route path="/admin/courses" element={guard(ADMIN, <AdminCourses />)} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </DemoProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
