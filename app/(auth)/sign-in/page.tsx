import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { signIn } from "../actions";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign In · Vimtra Chennai Lions GC",
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  creds: "Incorrect email or password.",
  invalid: "Enter a valid email and password.",
  server: "Service is unavailable right now. Please try again.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const safeNext = next && next.startsWith("/") ? next : undefined;
  if (await getCurrentUser()) redirect(safeNext ?? "/profile");

  return (
    <div className="admin-page hp-auth">
      <div className="hp-auth-card">
        <div className="flex items-center gap-3 mb-7">
          <Image src="/assets/logo-lion.png" alt="" width={40} height={40} className="w-10 h-10 object-contain" />
          <div>
            <div className="font-sora font-extrabold text-[15px] tracking-[0.14em] text-ink">WELCOME BACK</div>
            <div className="font-manrope text-[12px] text-muted">Sign in to your Pride account</div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-[12px] font-manrope font-semibold text-[13.5px]" style={{ background: "rgba(196,32,42,0.10)", color: "#C4202A" }}>
            {ERRORS[error] ?? "Could not sign you in."}
          </div>
        )}

        <form action={signIn} className="grid gap-4">
          <input type="hidden" name="next" value={safeNext ?? ""} />
          <div className="field">
            <label>Email</label>
            <input type="email" name="email" required autoComplete="username" placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" name="password" required autoComplete="current-password" />
          </div>
          <button type="submit" className="cta-gold press justify-center" style={{ padding: 13 }}>
            SIGN IN
          </button>
        </form>

        <p className="mt-6 font-manrope text-[13.5px] text-muted text-center">
          New to the Pride?{" "}
          <Link href={safeNext ? `/sign-up?next=${encodeURIComponent(safeNext)}` : "/sign-up"} className="text-crimson-600 font-semibold no-underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
