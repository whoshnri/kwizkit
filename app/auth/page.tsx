import {
  RegisterLink,
  LoginLink,
} from "@kinde-oss/kinde-auth-nextjs/components";

export default function AuthPage() {
  return (
    <div className=" flex items-center justify-center theme-bg p-4">
      <div className="shadow-xs shadow-blue-400 rounded p-10 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold theme-text mb-2">Welcome</h1>
        <p className="theme-text opacity-75 mb-8">
          Sign in to access your dashboard or create a new account.
        </p>

        <div className="space-y-4">
          <LoginLink
            postLoginRedirectURL="/dashboard"
            className="block w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
          >
            Sign In
          </LoginLink>

          <RegisterLink
            postLoginRedirectURL="/auth/onboarding"
            className="block w-full px-6 py-3 bg-white text-indigo-600 border border-indigo-200 font-semibold rounded-xl shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
          >
            Create Account
          </RegisterLink>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          By continuing, you agree to our{" "}
          <a href="/terms" className="text-indigo-600 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-indigo-600 hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
