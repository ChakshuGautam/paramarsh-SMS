import { Button } from "@/components/ui/button";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import Image from "next/image";

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

  // Carousel state for left panel screenshots
  const screenshots = useMemo(
    () => [
      "/screenshots/admin-1.png",
      "/screenshots/admin-2.png",
      "/screenshots/admin-3.png",
    ],
    [],
  );
  const fallbackScreens = ["/window.svg", "/next.svg", "/globe.svg"];
  const slides = (
    screenshots && screenshots.length ? screenshots : fallbackScreens
  ).slice(0, 5);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const id = setInterval(
      () => setCurrent((i) => (i + 1) % slides.length),
      4000,
    );
    return () => clearInterval(id);
  }, [paused, slides.length]);

  return (
    <div className="min-h-screen flex">
      <div className="container relative grid flex-col items-center justify-center sm:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex overflow-hidden">
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
          {/* Feature bullets */}
          <div className="relative z-20 mt-8 space-y-4">
            <h2 className="text-xl font-semibold">Why Paramarsh SMS?</h2>
            <ul className="space-y-3 text-sm text-zinc-200">
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-400" />
                Unified Admissions, Attendance, Exams, and Fees in one place
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-400" />
                Powerful Admin with shadcn/ui + TanStack Data Tables
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-400" />
                Multi-tenant ready with role-based access controls
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-400" />
                API-first with OpenAPI, mock server for instant local dev
              </li>
            </ul>
          </div>

          {/* Centered, controlled carousel */}
          <div className="relative z-20 flex-1 flex items-center justify-center">
            <div
              className="group relative w-full max-w-xl overflow-hidden rounded-md border border-zinc-800 bg-zinc-950/40"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div className="relative aspect-[16/9] w-full">
                {slides.map((src, i) => (
                  <div
                    key={src + i}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      i === current ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <Image
                      src={src}
                      alt="Admin screenshot"
                      fill
                      sizes="(max-width: 1280px) 100vw, 1280px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              {/* Controls */}
              <button
                aria-label="Previous"
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded bg-zinc-900/60 px-2 py-1 text-sm opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() =>
                  setCurrent((current - 1 + slides.length) % slides.length)
                }
              >
                ◀
              </button>
              <button
                aria-label="Next"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-zinc-900/60 px-2 py-1 text-sm opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => setCurrent((current + 1) % slides.length)}
              >
                ▶
              </button>
              {/* Dots */}
              <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-2 w-2 rounded-full ${
                      i === current ? "bg-emerald-400" : "bg-zinc-500"
                    }`}
                    onClick={() => setCurrent(i)}
                  />
                ))}
              </div>
            </div>
          </div>
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
