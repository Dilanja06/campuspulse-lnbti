import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, getRoleHomeRoute } from './context/AuthContext';
import { DatabaseStatusProvider } from './context/DatabaseStatusContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth Pages
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { AccountVerification } from './pages/AccountVerification';

// Student Pages
import { Home } from './pages/Home';
import { EventExplorer } from './pages/EventExplorer';
import { EventDetails } from './pages/EventDetails';
import { Register } from './pages/Register';
import { EventCalendar } from './pages/EventCalendar';
import { MyRegistrations } from './pages/MyRegistrations';
import { PaymentAndReceipt } from './pages/PaymentAndReceipt';
import { MyQR } from './pages/MyQR';
import { RefundStatus } from './pages/RefundStatus';
import { ClubsDirectory } from './pages/ClubsDirectory';
import { ClubProfile } from './pages/ClubProfile';
import { MyMemberships } from './pages/MyMemberships';
import { MyBadges } from './pages/MyBadges';
import { Notifications } from './pages/Notifications';
import { MyProfile } from './pages/MyProfile';

// Organizer Pages
import { OrganizerDashboard } from './pages/organizer/OrganizerDashboard';
import { ProposalsAndApprovals } from './pages/organizer/ProposalsAndApprovals';
import { CreateEventProposal } from './pages/organizer/CreateEventProposal';
import { ProposalDetails } from './pages/organizer/ProposalDetails';
import { ManageEvents } from './pages/organizer/ManageEvents';
import { EventCancellation } from './pages/organizer/EventCancellation';
import { EventRegistrations } from './pages/organizer/EventRegistrations';
import { AttendanceScanner } from './pages/organizer/AttendanceScanner';
import { OrganizerRefunds } from './pages/organizer/OrganizerRefunds';
import { ClubMembers } from './pages/organizer/ClubMembers';

// Committee Pages
import { CommitteeDashboard } from './pages/committee/CommitteeDashboard';
import { AssignedCommitteeActions } from './pages/committee/AssignedCommitteeActions';
import { CommitteeActionDetail } from './pages/committee/CommitteeActionDetail';

// Coordinator Pages
import { CoordinatorDashboard } from './pages/coordinator/CoordinatorDashboard';
import { ProposalReviewQueue } from './pages/coordinator/ProposalReviewQueue';
import { ProposalReviewRouting } from './pages/coordinator/ProposalReviewRouting';
import { AssignedClubs } from './pages/coordinator/AssignedClubs';

// Higher Authority Pages
import { AuthorityDashboard } from './pages/authority/AuthorityDashboard';
import { ApprovalStages } from './pages/authority/ApprovalStages';
import { StageDecisionSignOff } from './pages/authority/StageDecisionSignOff';
import { DecisionHistory } from './pages/authority/DecisionHistory';

// External Verification Staff Pages
import { VerificationQueue } from './pages/verification/VerificationQueue';

// Central Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { OfficialRecords } from './pages/admin/OfficialRecords';
import { RolesPermissions } from './pages/admin/RolesPermissions';
import { MerchantsAndDevices } from './pages/admin/MerchantsAndDevices';
import { AdminGovernance } from './pages/admin/AdminGovernance';
import { SystemAudits } from './pages/admin/SystemAudits';

const LandingRedirect: React.FC = () => {
  const { user, role, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-surface text-light-on-surface-variant font-body">
        Initializing CampusPulse...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getRoleHomeRoute(role)} replace />;
};

export function App() {
  return (
    <DatabaseStatusProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public / Auth Routes */}
            <Route path="/" element={<LandingRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify" element={<AccountVerification />} />
            <Route path="/verify-account" element={<AccountVerification />} />

            {/* Student Portal Routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute allowedRoles={['student', 'organizer', 'committee']}>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute allowedRoles={['student', 'organizer', 'committee']}>
                  <EventExplorer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:id"
              element={
                <ProtectedRoute allowedRoles={['student', 'organizer', 'committee']}>
                  <EventDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:id/register"
              element={
                <ProtectedRoute allowedRoles={['student', 'organizer', 'committee']}>
                  <Register />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute allowedRoles={['student', 'organizer', 'committee']}>
                  <EventCalendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-registrations"
              element={
                <ProtectedRoute allowedRoles={['student', 'organizer', 'committee']}>
                  <MyRegistrations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <ProtectedRoute allowedRoles={['student', 'organizer', 'committee']}>
                  <PaymentAndReceipt />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute allowedRoles={['student', 'organizer', 'committee']}>
                  <PaymentAndReceipt />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-qr"
              element={
                <ProtectedRoute allowedRoles={['student', 'organizer', 'committee']}>
                  <MyQR />
                </ProtectedRoute>
              }
            />
            <Route
              path="/refunds"
              element={
                <ProtectedRoute allowedRoles={['student', 'organizer', 'committee']}>
                  <RefundStatus />
                </ProtectedRoute>
              }
            />
            <Route
              path="/refund-status"
              element={
                <ProtectedRoute allowedRoles={['student', 'organizer', 'committee']}>
                  <RefundStatus />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clubs"
              element={
                <ProtectedRoute allowedRoles={['student', 'organizer', 'committee']}>
                  <ClubsDirectory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clubs/:id"
              element={
                <ProtectedRoute allowedRoles={['student', 'organizer', 'committee']}>
                  <ClubProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-memberships"
              element={
                <ProtectedRoute allowedRoles={['student', 'organizer', 'committee']}>
                  <MyMemberships />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-badges"
              element={
                <ProtectedRoute allowedRoles={['student', 'organizer', 'committee']}>
                  <MyBadges />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute allowedRoles={['student', 'organizer', 'committee']}>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-profile"
              element={
                <ProtectedRoute allowedRoles={['student', 'organizer', 'committee']}>
                  <MyProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['student', 'organizer', 'committee']}>
                  <MyProfile />
                </ProtectedRoute>
              }
            />

            {/* Organizer Portal Routes (strictly scoped) */}
            <Route
              path="/organizer"
              element={
                <ProtectedRoute allowedRoles={['organizer', 'committee']}>
                  <OrganizerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/proposals"
              element={
                <ProtectedRoute allowedRoles={['organizer', 'committee']}>
                  <ProposalsAndApprovals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/proposals/new"
              element={
                <ProtectedRoute allowedRoles={['organizer', 'committee']}>
                  <CreateEventProposal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/proposals/:id"
              element={
                <ProtectedRoute allowedRoles={['organizer', 'committee']}>
                  <ProposalDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/events"
              element={
                <ProtectedRoute allowedRoles={['organizer', 'committee']}>
                  <ManageEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/events/:id/cancel"
              element={
                <ProtectedRoute allowedRoles={['organizer', 'committee']}>
                  <EventCancellation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/registrations"
              element={
                <ProtectedRoute allowedRoles={['organizer', 'committee']}>
                  <EventRegistrations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/attendance"
              element={
                <ProtectedRoute allowedRoles={['organizer', 'committee']}>
                  <AttendanceScanner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/refunds"
              element={
                <ProtectedRoute allowedRoles={['organizer', 'committee']}>
                  <OrganizerRefunds />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/members"
              element={
                <ProtectedRoute allowedRoles={['organizer', 'committee']}>
                  <ClubMembers />
                </ProtectedRoute>
              }
            />

            {/* Committee Portal Routes */}
            <Route
              path="/committee"
              element={
                <ProtectedRoute allowedRoles={['committee']}>
                  <CommitteeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/committee/actions"
              element={
                <ProtectedRoute allowedRoles={['committee']}>
                  <AssignedCommitteeActions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/committee/actions/:id"
              element={
                <ProtectedRoute allowedRoles={['committee']}>
                  <CommitteeActionDetail />
                </ProtectedRoute>
              }
            />

            {/* Lecturer Coordinator Routes (strictly isolated) */}
            <Route
              path="/coordinator"
              element={
                <ProtectedRoute allowedRoles={['coordinator']}>
                  <CoordinatorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coordinator/proposals"
              element={
                <ProtectedRoute allowedRoles={['coordinator']}>
                  <ProposalReviewQueue />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coordinator/queue"
              element={
                <ProtectedRoute allowedRoles={['coordinator']}>
                  <ProposalReviewQueue />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coordinator/proposals/:id/review"
              element={
                <ProtectedRoute allowedRoles={['coordinator']}>
                  <ProposalReviewRouting />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coordinator/clubs"
              element={
                <ProtectedRoute allowedRoles={['coordinator']}>
                  <AssignedClubs />
                </ProtectedRoute>
              }
            />

            {/* Higher Authority Routes (strictly isolated) */}
            <Route
              path="/authority"
              element={
                <ProtectedRoute allowedRoles={['authority']}>
                  <AuthorityDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/authority/stages"
              element={
                <ProtectedRoute allowedRoles={['authority']}>
                  <ApprovalStages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/authority/stages/:id/sign-off"
              element={
                <ProtectedRoute allowedRoles={['authority']}>
                  <StageDecisionSignOff />
                </ProtectedRoute>
              }
            />
            <Route
              path="/authority/stages/:id"
              element={
                <ProtectedRoute allowedRoles={['authority']}>
                  <StageDecisionSignOff />
                </ProtectedRoute>
              }
            />
            <Route
              path="/authority/history"
              element={
                <ProtectedRoute allowedRoles={['authority']}>
                  <DecisionHistory />
                </ProtectedRoute>
              }
            />

            {/* External Verification Staff Routes (strictly isolated) */}
            <Route
              path="/verification"
              element={
                <ProtectedRoute allowedRoles={['verification']}>
                  <VerificationQueue />
                </ProtectedRoute>
              }
            />
            <Route
              path="/verification/history"
              element={
                <ProtectedRoute allowedRoles={['verification']}>
                  <VerificationQueue />
                </ProtectedRoute>
              }
            />

            {/* Central Admin Routes (strictly isolated) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/records"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <OfficialRecords />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/roles"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <RolesPermissions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/merchants"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MerchantsAndDevices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/governance"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminGovernance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audits"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SystemAudits />
                </ProtectedRoute>
              }
            />

            {/* Fallback Catch-All */}
            <Route path="*" element={<LandingRedirect />} />
          </Routes>
        </Router>
      </AuthProvider>
    </DatabaseStatusProvider>
  );
}

export default App;
