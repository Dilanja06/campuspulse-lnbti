import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages (Type A Layout)
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { AccountVerification } from './pages/AccountVerification';

// Core Student Pages (Type B & C Layouts)
import { Home } from './pages/Home';
import { EventExplorer } from './pages/EventExplorer';
import { EventDetails } from './pages/EventDetails';
import { Register } from './pages/Register';
import { EventCalendar } from './pages/EventCalendar';
import { MyRegistrations } from './pages/MyRegistrations';
import { PaymentAndReceipt } from './pages/PaymentAndReceipt';
import { MyQR } from './pages/MyQR';
import { MyBadges } from './pages/MyBadges';
import { ClubsDirectory } from './pages/ClubsDirectory';
import { ClubProfile } from './pages/ClubProfile';
import { MyMemberships } from './pages/MyMemberships';
import { Notifications } from './pages/Notifications';
import { MyProfile } from './pages/MyProfile';
import { RefundStatus } from './pages/RefundStatus';

// Organizer Workspace Pages (O01 - O06)
import { OrganizerDashboard } from './pages/organizer/OrganizerDashboard';
import { ProposalsAndApprovals } from './pages/organizer/ProposalsAndApprovals';
import { CreateEventProposal } from './pages/organizer/CreateEventProposal';
import { ManageEvents } from './pages/organizer/ManageEvents';
import { EventRegistrations } from './pages/organizer/EventRegistrations';
import { ClubMembers } from './pages/organizer/ClubMembers';

// Lecturer Coordinator Workspace Pages (L01 - L04)
import { CoordinatorDashboard } from './pages/coordinator/CoordinatorDashboard';
import { ProposalReviewQueue } from './pages/coordinator/ProposalReviewQueue';
import { ProposalReviewRouting } from './pages/coordinator/ProposalReviewRouting';
import { AssignedClubs } from './pages/coordinator/AssignedClubs';

// Central Admin Workspace Pages (A01 - A05)
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { OfficialRecords } from './pages/admin/OfficialRecords';
import { RolesPermissions } from './pages/admin/RolesPermissions';
import { MerchantsAndDevices } from './pages/admin/MerchantsAndDevices';
import { SystemAudits } from './pages/admin/SystemAudits';

// Higher University Authority Workspace Pages (H01 - H04)
import { AuthorityDashboard } from './pages/authority/AuthorityDashboard';
import { ApprovalStages } from './pages/authority/ApprovalStages';
import { StageDecisionSignOff } from './pages/authority/StageDecisionSignOff';
import { DecisionHistory } from './pages/authority/DecisionHistory';

// Club Committee Workspace Pages (C01 - C03)
import { CommitteeDashboard } from './pages/committee/CommitteeDashboard';
import { AssignedCommitteeActions } from './pages/committee/AssignedCommitteeActions';
import { CommitteeActionDetail } from './pages/committee/CommitteeActionDetail';

// Auth Provider, Theme Provider & Role Guard
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DatabaseStatusProvider } from './context/DatabaseStatusContext';
import { ProtectedRoute } from './components/ProtectedRoute';

const RootRedirect: React.FC = () => {
  const { user, role, getRoleHomeRoute } = useAuth();
  if (user) {
    return <Navigate to={getRoleHomeRoute(role)} replace />;
  }
  return <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <DatabaseStatusProvider>
            <Routes>
          {/* Auth routes (Public) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify" element={<AccountVerification />} />

          {/* Student Workspace routes (Accessible by all signed-in users) */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><EventExplorer /></ProtectedRoute>} />
          <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
          <Route path="/events/:id/register" element={<ProtectedRoute><Register /></ProtectedRoute>} />
          <Route path="/events/:id/qr" element={<ProtectedRoute><MyQR /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><EventCalendar /></ProtectedRoute>} />
          <Route path="/my-registrations" element={<ProtectedRoute><MyRegistrations /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><PaymentAndReceipt /></ProtectedRoute>} />
          <Route path="/my-qr" element={<ProtectedRoute><MyQR /></ProtectedRoute>} />
          <Route path="/my-badges" element={<ProtectedRoute><MyBadges /></ProtectedRoute>} />
          <Route path="/clubs" element={<ProtectedRoute><ClubsDirectory /></ProtectedRoute>} />
          <Route path="/clubs/:id" element={<ProtectedRoute><ClubProfile /></ProtectedRoute>} />
          <Route path="/my-memberships" element={<ProtectedRoute><MyMemberships /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/my-profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
          <Route path="/refund-status" element={<ProtectedRoute><RefundStatus /></ProtectedRoute>} />

          {/* Club Organizer Workspace routes */}
          <Route
            path="/organizer"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin', 'committee']}>
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin', 'committee']}>
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/proposals"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin', 'committee']}>
                <ProposalsAndApprovals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/proposals/new"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin', 'committee']}>
                <CreateEventProposal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin', 'committee']}>
                <ManageEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/registrations"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin', 'committee']}>
                <EventRegistrations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/members"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin', 'committee']}>
                <ClubMembers />
              </ProtectedRoute>
            }
          />

          {/* Lecturer Coordinator Workspace routes */}
          <Route
            path="/coordinator"
            element={
              <ProtectedRoute allowedRoles={['coordinator', 'admin', 'authority']}>
                <CoordinatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordinator/dashboard"
            element={
              <ProtectedRoute allowedRoles={['coordinator', 'admin', 'authority']}>
                <CoordinatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordinator/proposals"
            element={
              <ProtectedRoute allowedRoles={['coordinator', 'admin', 'authority']}>
                <ProposalReviewQueue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordinator/proposals/:id/review"
            element={
              <ProtectedRoute allowedRoles={['coordinator', 'admin', 'authority']}>
                <ProposalReviewRouting />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordinator/proposals/review"
            element={
              <ProtectedRoute allowedRoles={['coordinator', 'admin', 'authority']}>
                <ProposalReviewRouting />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordinator/clubs"
            element={
              <ProtectedRoute allowedRoles={['coordinator', 'admin', 'authority']}>
                <AssignedClubs />
              </ProtectedRoute>
            }
          />

          {/* Central Admin Workspace routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
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
            path="/admin/audits"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SystemAudits />
              </ProtectedRoute>
            }
          />

          {/* Higher University Authority Workspace routes */}
          <Route
            path="/authority"
            element={
              <ProtectedRoute allowedRoles={['authority', 'admin']}>
                <AuthorityDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/authority/dashboard"
            element={
              <ProtectedRoute allowedRoles={['authority', 'admin']}>
                <AuthorityDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/authority/stages"
            element={
              <ProtectedRoute allowedRoles={['authority', 'admin']}>
                <ApprovalStages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/authority/stages/:id/sign-off"
            element={
              <ProtectedRoute allowedRoles={['authority', 'admin']}>
                <StageDecisionSignOff />
              </ProtectedRoute>
            }
          />
          <Route
            path="/authority/stages/sign-off"
            element={
              <ProtectedRoute allowedRoles={['authority', 'admin']}>
                <StageDecisionSignOff />
              </ProtectedRoute>
            }
          />
          <Route
            path="/authority/history"
            element={
              <ProtectedRoute allowedRoles={['authority', 'admin']}>
                <DecisionHistory />
              </ProtectedRoute>
            }
          />

          {/* Club Committee Workspace routes (5 Seats) */}
          <Route
            path="/committee"
            element={
              <ProtectedRoute allowedRoles={['committee', 'admin', 'organizer']}>
                <CommitteeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/committee/dashboard"
            element={
              <ProtectedRoute allowedRoles={['committee', 'admin', 'organizer']}>
                <CommitteeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/committee/actions"
            element={
              <ProtectedRoute allowedRoles={['committee', 'admin', 'organizer']}>
                <AssignedCommitteeActions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/committee/actions/:id"
            element={
              <ProtectedRoute allowedRoles={['committee', 'admin', 'organizer']}>
                <CommitteeActionDetail />
              </ProtectedRoute>
            }
          />

          {/* Root & Catch-all: Route unauthenticated users to /login and authenticated users to their role dashboard */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
          </DatabaseStatusProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
