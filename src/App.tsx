import { Suspense, type ReactNode } from "react";
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
import {
  LandingPage,
  ClubsLandingPage,
  Login,
  Register,
  NotFound,
  Demo,
  DemoEntry,
  Dashboard,
  Profile,
  Calendar,
  Training,
  TrainingSession,
  DiagnosticTest,
  Chat,
  Leaderboard,
  Achievements,
  Onboarding,
  Settings,
  OnboardingResult,
  ParentDashboard,
  ParentChild,
  ParentMedical,
  ClubDashboard,
  Members,
  Teams,
  Fees,
  Medical,
  Attendance,
  Fixtures,
  ClubSetup,
  ParentFees,
  ParentAnnouncements,
  TrainingLoad,
  Reports,
  Communication,
  Classroom,
  ClassroomModule,
  ClassroomLesson,
  AdminDashboard,
  Users,
  Analytics,
  AdminSettings,
  AdminCourses,
} from "@/routes/lazyPages";

// Public pages

// Student pages

// Parent pages

// Club pages

// Classroom pages

// Admin pages

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } },
});

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
                    <Route path="/training/sesion" element={guard(PLAYER, <TrainingSession />)} />
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
