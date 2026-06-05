import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCredits from "./pages/admin/AdminCredits";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminHealth from "./pages/admin/AdminHealth";
import Overview from "./pages/dashboard/Overview";
import Composer from "./pages/dashboard/Composer";
import Calendar from "./pages/dashboard/Calendar";
import Posts from "./pages/dashboard/Posts";
import Accounts from "./pages/dashboard/Accounts";
import Media from "./pages/dashboard/Media";
import AIStudio from "./pages/dashboard/AIStudio";
import Analytics from "./pages/dashboard/Analytics";
import Activity from "./pages/dashboard/Activity";
import AutoReply from "./pages/dashboard/AutoReply";
import Settings from "./pages/dashboard/Settings";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* User Dashboard Routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<Overview />} />
                    <Route path="compose" element={<Composer />} />
                    <Route path="calendar" element={<Calendar />} />
                    <Route path="posts" element={<Posts />} />
                    <Route path="accounts" element={<Accounts />} />
                    <Route path="media" element={<Media />} />
                    <Route path="ai-studio" element={<AIStudio />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="activity" element={<Activity />} />
                    <Route path="auto-reply" element={<AutoReply />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Route>

            {/* Admin Portal Routes */}
            <Route element={<AdminProtectedRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="credits" element={<AdminCredits />} />
                    <Route path="logs" element={<AdminLogs />} />
                    <Route path="health" element={<AdminHealth />} />
                </Route>
            </Route>
        </Routes>
    );
}
