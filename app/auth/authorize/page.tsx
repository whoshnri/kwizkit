"use client";
import { signIn, signOut } from "next-auth/react";
import { Github } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { useSession } from 'next-auth/react';
import { MoreVertical } from "lucide-react";
import animationData1 from "@/public/lottie/login.json";
import animationData2 from "@/public/lottie/signup.json";
import Lottie from "lottie-react";






const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked: "Account already exists with a different provider.",
  AccessDenied: "Access denied. Please try again.",
  Configuration: "Authentication is not properly configured.",
  Callback: "Login callback failed. Try again.",
  Signin: "Login failed. Please try again.",
  CredentialsSignin: "Invalid email or password.",
  default: "Unexpected error occurred. Please try again.",
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState<string>()
  const [lastName, setLastName] = useState<string>()
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [sending , setSending] = useState<boolean>(false)
  const [oErrorMessage, setOErrorMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get("error")
  const { data: session, status } = useSession();
  const [githubPopup , setGithubPopup] = useState<boolean>(false)
  const [googlePopup , setGooglePopup] = useState<boolean>(false)
  const [loginPage, setLoginPage] = useState<boolean>(true)


  useEffect(() => {
    const error = searchParams.get("error")
    console.log("Found error param:", error)

    if (error) {
      setOErrorMessage(ERROR_MESSAGES[error] || ERROR_MESSAGES.default)

      // Clean up error param from URL after 3s
      setTimeout(() => {
        const baseUrl = window.location.pathname
        router.replace(baseUrl)
      }, 3000)
    }
    setOErrorMessage(ERROR_MESSAGES[error])
  }, [searchParams, router])




    const handleGithubSignin = async () => {
      setOErrorMessage("");

      try {
        const result = await signIn("github", {
          redirect: false,
          callbackUrl: "/dashboard",
        });
        console.log("OAuth result:", result);
        if (result?.error) {
          setOErrorMessage(ERROR_MESSAGES[result.error] || ERROR_MESSAGES.default);
        } else if (result?.url) {
          router.push(result.url);
        }
      } catch (error) {
        setOErrorMessage(ERROR_MESSAGES.default);
      }
    };

    const handleGoogleSignin = async () => {
      setOErrorMessage("");

      try {
        const result = await signIn("google", {
          redirect: false,
          callbackUrl: "/dashboard",
        });
        console.log("OAuth result:", result);
        if (result?.error) {
          setOErrorMessage(ERROR_MESSAGES[result.error] || ERROR_MESSAGES.default);
        } else if (result?.url) {
          router.push(result.url);
        }
      } catch (error) {
        setOErrorMessage(ERROR_MESSAGES.default);
      }
    };




    const handleSubmit = async (e: React.FormEvent, mode:string) => {
      if (loginPage){
        e.preventDefault();
        setSubmitted(true);
        setSending(true);
        setErrorMessage("");
        setSuccessMessage("")


        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
          callbackUrl: "/dashboard",
        });

        if (result?.error) {
          if (result?.error === "CredentialsSignin"){
            setErrorMessage("Invalid email or password");
          }
        } else if (result?.url) {
          router.push(result.url); // manual redirect
        }
        setSending(false);

      }else{
        e.preventDefault();
        setSending(true);
        setErrorMessage("");
        setSuccessMessage("")
        const res = await fetch('/api/auth/register-auth', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            "firstName" : firstName,
            "lastName": lastName,
            "email" : email,
            "password" : password
          }),
        })
        const data = await res.json()

        if(res.ok){
            setLoginPage(true)
            setSuccessMessage("Creation Successful. Login")
            setSending(false)
        }else{
            setErrorMessage(data.error)
            setSending(false);
        }
      }
    }

      const showPopup = (name) =>{
        if (name === "github"){
          setGithubPopup(!githubPopup)
        }else{
          setGooglePopup(!googlePopup)
        }

      }


  return (
    <div className="theme-bg min-h-screen flex items-center justify-center p-4">
      <div  className="flex border theme-border gap-2 rounded ">
        <div className="w-150 h-150 transition-all duration-200">
          {loginPage ? <Lottie animationData={animationData2} loop={true} autoplay={true} />  :
          <Lottie animationData={animationData1} loop={true} autoplay={true} />
        }
          </div>
      <div className="max-w-md shadow-lg w-full space-y-6 p-6 shadow-sm">

      { loginPage ?
        (<div>
        <h2 className="text-2xl font-semibold text-center theme-text">Login</h2>

        {/* Email/Password Form */}
        <div className="space-y-4 mt-5">
            {successMessage && <p className="w-full text-xs text-center rounded p-3 bg-green-500 text-white">{successMessage}</p>}

          <div>
            <label className="block text-sm font-medium opacity-70 theme-text mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border theme-border rounded-md focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium opacity-70 theme-text mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border theme-border rounded-md focus:outline-none text-sm"
            />
          </div>
            {errorMessage && <p className="w-full text-xs text-center rounded p-3 bg-red-500 line-clamp-2 text-white">{errorMessage}</p>}
          <button
          onClick={handleSubmit}
            disabled={!email || !password}
            className="w-full cursor-pointer bg-blue-600 text-white py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 ease-in-out active:scale-95 hover:bg-blue-700 focus:ring-offset-2
              disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-blue-400 disabled:hover:bg-blue-400 disabled:active:scale-100"
          >
            { sending ?  <span className="loading loading-bars loading-sm"></span> : "Continue"}
          </button>

          <div className="flex text-xs justify-between pt-2">
            <p onClick={() => setLoginPage(false)} className="cursor-pointer text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                Create an account
            </p>
            <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">
              Forgot password?
            </Link>
          </div>
        </div>
        </div>)
         :
          (<div>
              <h2 className="text-2xl font-semibold text-center theme-text">Sign Up</h2>

              {/* Email/Password Form */}
              <div className="space-y-4 mt-5">

              <div className="flex gap-3 justify-between">
              <div>

                  <label className="block text-sm font-medium opacity-70 theme-text mb-1">Fistname</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="FirstName"
                    className="w-full px-3 py-2 border theme-border rounded-md focus:outline-none text-sm"
                  />
              </div>

              <div>
                  <label className="block text-sm font-medium opacity-70 theme-text mb-1">Lastname</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Lastname"
                    className="w-full px-3 py-2 border theme-border rounded-md focus:outline-none text-sm"
                  />
                </div>
                </div>


                <div>
                  <label className="block text-sm font-medium opacity-70 theme-text mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 border theme-border rounded-md focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text opacity-70 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-3 py-2 border theme-border rounded-md focus:outline-none text-sm"
                  />
                </div>
                  {errorMessage && <p className="w-full text-xs text-center rounded p-3 bg-red-500 text-white">{errorMessage}</p>}
                <button
                onClick={handleSubmit}
                  disabled={!email || !password}
                  className="w-full cursor-pointer bg-blue-600 text-white py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 ease-in-out active:scale-95 hover:bg-blue-700 focus:ring-offset-2
                    disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-blue-400 disabled:hover:bg-blue-400 disabled:active:scale-100"
                >
                  { sending ?  <span className="loading loading-bars loading-sm"></span> : "Continue"}
                </button>

                <div className="flex text-xs justify-between pt-2">
                  <p onClick={() => setLoginPage(true)} className="cursor-pointer text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                    Already have an account? Login
                  </p>
                </div>
              </div>
        </div>)
      }
        {/* Divider */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px theme-bg-subtle"></div>
          <span className="text-sm theme-text font-medium">or</span>
          <div className="flex-1 h-px theme-bg-subtle"></div>
        </div>

        {/* Social Login */}
        <div className="space-y-3">
          {oErrorMessage && <p className="w-full p-3 bg-red-500 text-white">{oErrorMessage}</p>}
          <button
            onClick={handleGithubSignin}
            className="relative z-0 w-full flex items-center gap-3 justify-center border theme-border brand-bg text-white text-gray-700 py-2.5 px-4 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
              hover:bg-gray-300 group cursor-pointer"
          >

            {/* Dots Icon */}
              { session?.user?.provider === "github" &&

            <div
              className="absolute cursor-pointer top-1 right-2 z-10 p-1.5 rounded-md hover:bg-gray-200 active:bg-gray-300 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                showPopup("github")
              }}
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </div>
          }

            {/* Main Button Content */}
            {status === 'loading' ? (
              <span className="loading loading-bars loading-sm"></span>
            ) : (
              <span className="flex items-center gap-3">
                <Github className="w-5 h-5" />
                {(status === 'unauthenticated' || (status !== 'unauthenticated' && session?.user?.provider !== "github"))
                  ? "Continue with GitHub"
                  : `Continue as ${session?.user?.firstName}`}
              </span>
            )}
          </button>

          {(githubPopup &&  status !== 'unauthenticated' && session?.user.provider === "github") &&
          <p className="text-gray-500 text-xs text-center w-full mx-auto hover:bg-gray-300 p-1 rounded cursor-pointer" onClick={() => signOut("github")}
          > Logout? </p >}


          <button
              onClick={handleGoogleSignin}
              className="relative w-full flex items-center gap-3 justify-center border border-gray-300 bg-white text-gray-700 py-2.5 px-4 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 hover:bg-gray-300 cursor-pointer"
            >

              {/* Independent clickable dot icon */}
              { session?.user?.provider === "google" &&
              <div
                className="absolute cursor-pointer top-1 right-2 z-10 p-1.5 rounded-md hover:bg-gray-200 active:bg-gray-300 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  showPopup("google")
                }}
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </div>
            }

              {/* Button label and icon */}
              {status === 'loading' ? (
                <span className="loading loading-bars loading-sm"></span>
              ) : (
                <span className="flex items-center gap-3">
                  <GoogleIcon w={"1.2rem"} h={"1.2rem"} className="w-5 h-5" />
                  {status === 'unauthenticated' || session?.user?.provider !== "google"
                    ? "Continue with Google"
                    : `Continue as ${session?.user?.firstName}`}
                </span>
              )}
            </button>

          {(googlePopup && status !== 'unauthenticated' && session?.user.provider === "google") &&
          <p className="text-gray-500 text-xs text-center w-full mx-auto hover:bg-gray-300 p-1 rounded cursor-pointer" onClick={() => signOut("google")}
          > Logout? </p >}
        </div>
      </div>
    </div>
    </div>
  );
}

interface IconProps {
  w: string;
  h: string;
}

const GoogleIcon = ({ w, h }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={w} height={h} viewBox="0 0 48 48">
    <path
      fill="currentColor"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8
    c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
    C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20
    c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12
    c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4
    C16.318,4,9.656,8.337,6.306,14.691z"></path>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238
    C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025
    C9.505,39.556,16.227,44,24,44z"></path>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303
    c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238
    C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
);
