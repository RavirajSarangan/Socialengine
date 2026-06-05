import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MailIcon, LockIcon, ArrowRightIcon, ShieldCheckIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiErrorMessage } from "../../lib/api";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await login(email, password);
            // The admin route guard verifies the Convex `role` and redirects non-admins back here.
            navigate("/admin");
        } catch (err) {
            setError(apiErrorMessage(err, "Could not sign in"));
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md">
                {/* Glow effects for dark premium styling */}
                <div className="absolute -top-10 -left-10 size-40 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -right-10 size-40 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-slate-100 shadow-2xl relative overflow-hidden">
                    <div className="flex flex-col items-center mb-8">
                        <Link to="/" className="flex items-center gap-2 mb-2">
                            <ShieldCheckIcon className="size-8 text-violet-500" />
                            <h1 className="text-2xl font-serif text-white tracking-wide">Socialengine</h1>
                        </Link>
                        <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">Admin Gateway</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 text-sm">
                        <div>
                            <label className="block mb-1.5 text-slate-300 font-medium">Administrator Email</label>
                            <div className="relative">
                                <MailIcon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="email"
                                    required
                                    placeholder="admin@socialengine.app"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 outline-none border border-slate-800 focus:border-violet-500 text-white rounded-full transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1.5 text-slate-300 font-medium">Password</label>
                            <div className="relative">
                                <LockIcon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="password"
                                    required
                                    placeholder="********"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 outline-none border border-slate-800 focus:border-violet-500 text-white rounded-full transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-xl px-4 py-2.5">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 px-4 bg-linear-to-r from-violet-600 to-violet-500 hover:shadow-[0_8px_24px_rgba(124,58,237,0.3)] text-white font-medium rounded-full text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                "Verifying gateway..."
                            ) : (
                                <>
                                    Log In to Dashboard <ArrowRightIcon className="size-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-xs text-slate-500">
                        <Link to="/login" className="text-slate-400 hover:text-slate-300 hover:underline">
                            Return to Individual User Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
