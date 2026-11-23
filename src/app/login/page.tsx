import { cookies } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getAuthConfig } from "@/lib/auth/config";
import { safeRedirectPath, SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

const errorMessages: Record<string, string> = {
  invalid_credentials: "The username or password is incorrect.",
  rate_limited: "Too many sign-in attempts. Please wait before trying again.",
  unavailable: "Sign-in is temporarily unavailable. Please try again shortly.",
  invalid_request: "The sign-in request could not be processed.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = safeRedirectPath(params.next);
  let authenticated = false;
  try {
    const auth = getAuthConfig();
    const cookieStore = await cookies();
    const session = await verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value, auth.AUTH_SESSION_SECRET, auth.ADMIN_USERNAME);
    authenticated = Boolean(session);
  } catch {
    // The login endpoint reports unavailable until production credentials are configured.
  }
  if (authenticated) redirect(next);

  return <main className="login-page">
    <section className="login-card" aria-labelledby="login-title">
      <div className="login-brand">
        <Image src="/brand/horizontal-logo.png" alt="Study Worldwide" width={1200} height={637} priority />
      </div>
      <h1 id="login-title">Administrator sign in</h1>
      <p className="login-intro">Use your private administrator credentials to access the scholarship discovery dashboard.</p>
      {params.error && <p className="login-error" role="alert">{errorMessages[params.error] ?? errorMessages.invalid_request}</p>}
      <form className="login-form" action="/api/auth/login" method="post">
        <input type="hidden" name="next" value={next}/>
        <label htmlFor="username">Username</label>
        <input id="username" name="username" type="text" autoComplete="username" required maxLength={128} autoFocus/>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required maxLength={1024}/>
        <button type="submit">Sign in</button>
      </form>
      <p className="login-security-note">Protected administrator access</p>
    </section>
  </main>;
}
