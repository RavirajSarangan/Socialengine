import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

const PasswordWithProfile = Password({
    profile(params) {
        const email = String(params.email ?? "").toLowerCase();
        return {
            email,
            name: (params.name as string | undefined) ?? email.split("@")[0],
            plan: "Starter",
            aiCredits: 5,
            aiCreditsTotal: 5,
            role: adminEmails.includes(email) ? "admin" : "user",
        };
    },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
    providers: [PasswordWithProfile],
});
