import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { signUp } from "../actions";
import { getPendingUser, safeNextPath } from "@/lib/auth";
import PasswordField from "@/components/auth/PasswordField";

export const metadata: Metadata = {
  title: "Create Account",
  robots: { index: false, follow: false },
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const safeNext = safeNextPath(next);
  const pending = await getPendingUser();
  if (pending?.verificationRequired) {
    redirect(safeNext ? `/check-email?next=${encodeURIComponent(safeNext)}` : "/check-email");
  }
  if (pending) redirect(safeNext ?? "/profile");

  return (
    <div className="admin-page hp-auth">
      <div className="hp-auth-card">
        <div className="flex items-center gap-3 mb-7">
          <Image src="/assets/logo-lion.png" alt="" width={40} height={40} className="w-10 h-10 object-contain" />
          <div>
            <div className="font-sora font-extrabold text-[15px] tracking-[0.14em] text-ink">JOIN THE PRIDE</div>
            <div className="font-manrope text-[12px] text-muted">Create your member account</div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-[12px] font-manrope font-semibold text-[13.5px]" style={{ background: "rgba(196,32,42,0.10)", color: "#C4202A" }}>
            {error}
          </div>
        )}

        <form action={signUp} className="grid gap-4">
          <input type="hidden" name="next" value={safeNext ?? ""} />
          <div className="field">
            <label>Full Name</label>
            <input type="text" name="name" required autoComplete="name" placeholder="Your name" />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" name="email" required autoComplete="username" placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <PasswordField name="password" required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" />
          </div>
          <button type="submit" className="cta-gold press justify-center" style={{ padding: 13 }}>
            CREATE ACCOUNT
          </button>
        </form>

        <p className="mt-6 font-manrope text-[13.5px] text-muted text-center">
          Already a member?{" "}
          <Link href={safeNext ? `/sign-in?next=${encodeURIComponent(safeNext)}` : "/sign-in"} className="text-crimson-600 font-semibold no-underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
