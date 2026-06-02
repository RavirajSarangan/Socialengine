import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
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
        </Routes>
    );
}
