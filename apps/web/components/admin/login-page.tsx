import { Button } from "@/components/ui/button";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn, useSignUp } from "@clerk/nextjs";

export const LoginPage = () => {
  const router = useRouter();
  const publishableKey =
    (typeof window !== "undefined"
      ? (window as unknown as { NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string })
          .NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
      : undefined) || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const {
    isLoaded: signInLoaded,
    signIn,
    setActive: setActiveFromSignIn,
  } = useSignIn();
  const {
    isLoaded: signUpLoaded,
    signUp,
    setActive: setActiveFromSignUp,
  } = useSignUp();
  const clerkReady = useMemo(
    () => signInLoaded && signUpLoaded,
    [signInLoaded, signUpLoaded],
  );

  return (
    <div className="min-h-screen flex">
      <div className="container relative grid flex-col items-center justify-center sm:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            Paramarsh SMS
          </div>
          {/* Left panel kept for visual balance; removed placeholder quote */}
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            {publishableKey ? (
              <>
                <div className="flex flex-col space-y-2 text-center">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {mode === "sign-in" ? "Sign in" : "Sign up"}
                  </h1>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <button
                      className={`px-3 py-1.5 rounded-md border ${
                        mode === "sign-in"
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                      onClick={() => {
                        setError(null);
                        setMode("sign-in");
                      }}
                    >
                      Sign in
                    </button>
                    <button
                      className={`px-3 py-1.5 rounded-md border ${
                        mode === "sign-up"
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                      onClick={() => {
                        setError(null);
                        setMode("sign-up");
                      }}
                    >
                      Sign up
                    </button>
                  </div>
                </div>
                {error ? (
                  <p className="text-sm text-red-600 text-center">{error}</p>
                ) : null}
                {mode === "sign-up" ? (
                  <div
                    id="clerk-captcha"
                    data-clerk-captcha
                    className="hidden"
                  />
                ) : null}
                <form
                  className="space-y-4"
                  onSubmit={async (e: FormEvent) => {
                    e.preventDefault();
                    setError(null);
                    if (!clerkReady || !signIn || !signUp) return;
                    try {
                      if (mode === "sign-in") {
                        const res = await signIn.create({
                          identifier: email,
                          password,
                        });
                        if (res.status === "complete") {
                          await setActiveFromSignIn({
                            session: res.createdSessionId,
                          });
                          router.push("/admin");
                          return;
                        }
                        setError(
                          "Additional steps required to complete sign in.",
                        );
                      } else {
                        if (password !== confirmPassword) {
                          setError("Passwords do not match.");
                          return;
                        }
                        const res = await signUp.create({
                          emailAddress: email,
                          password,
                        });
                        if (res.status === "complete") {
                          await setActiveFromSignUp({
                            session: res.createdSessionId,
                          });
                          router.push("/admin");
                          return;
                        }
                        setError(
                          res.status === "missing_requirements"
                            ? "Verification required. Please check your email."
                            : "Additional steps required to complete sign up.",
                        );
                      }
                    } catch (err: unknown) {
                      const msg = (
                        err as { errors?: Array<{ message?: string }> }
                      )?.errors?.[0]?.message;
                      setError(
                        msg || "Authentication failed. Please try again.",
                      );
                    }
                  }}
                >
                  <div className="space-y-2 text-left">
                    <label className="block text-sm font-medium">Email</label>
                    <input
                      className="w-full rounded-md border px-3 py-2"
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail((e.target as HTMLInputElement).value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="block text-sm font-medium">
                      Password
                    </label>
                    <input
                      className="w-full rounded-md border px-3 py-2"
                      type="password"
                      value={password}
                      onChange={(e) =>
                        setPassword((e.target as HTMLInputElement).value)
                      }
                      required
                    />
                  </div>
                  {mode === "sign-up" ? (
                    <div className="space-y-2 text-left">
                      <label className="block text-sm font-medium">
                        Confirm Password
                      </label>
                      <input
                        className="w-full rounded-md border px-3 py-2"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(
                            (e.target as HTMLInputElement).value,
                          )
                        }
                        required
                      />
                    </div>
                  ) : null}
                  <Button type="submit">
                    {mode === "sign-in" ? "Sign in" : "Sign up"}
                  </Button>
                </form>
              </>
            ) : (
              <>
                <div className="flex flex-col space-y-2 text-center">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Sign in
                  </h1>
                  <p className="text-sm leading-none text-muted-foreground">
                    Authentication not configured. Continue without auth.
                  </p>
                </div>
                <div className="flex justify-center">
                  <a
                    href="/admin"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
                  >
                    Continue to Admin
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
