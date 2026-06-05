import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

const PLAN_CREDITS: Record<string, { name: string; credits: number }> = {
    starter: { name: "Starter", credits: 5 },
    pro: { name: "Pro", credits: 200 },
    agency: { name: "Agency", credits: 1000 },
};

const PasswordWithProfile = Password({
    profile(params) {
        const email = String(params.email ?? "").toLowerCase();
        const planKey = String(params.plan ?? "starter").toLowerCase();
        const plan = PLAN_CREDITS[planKey] ?? PLAN_CREDITS.starter;
        return {
            email,
            name: (params.name as string | undefined) ?? email.split("@")[0],
            plan: plan.name,
            aiCredits: plan.credits,
            aiCreditsTotal: plan.credits,
            role: adminEmails.includes(email) ? "admin" : "user",
        };
    },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
    providers: [PasswordWithProfile],
});
