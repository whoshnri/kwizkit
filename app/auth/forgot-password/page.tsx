"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import VerificationCodeInput from '../components/VerificationCodeInput'
import {Check} from "lucide-react"
import animationData1 from "../public/lottie/check.json";



export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [sending , setSending] = useState<boolean>(false)
  const [filled , setFilled] = useState<boolean>(false)
  const [inputCode, setInputCode] = useState<string>('')
  const [count , setCount] = useState<number>(0)
  const [error, setError] = useState<string>("")
  const [password , setPassword] = useState<string>("")
  const [done, setDone] = useState<boolean>(false)

  const handleReset = async (e) => {
    e.preventDefault()
    setSending(true)
    const res = await fetch("/api/auth/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()
    if (res.ok) {
      setSubmitted(true)
      setCount(50)
      setSending(false)
    } else {
      setError(data.error || "Something went wrong")
      setSending(false)
    }
  }

  const handleVerifyAndReset = async () => {
  setSending(true)
  const res = await fetch("/api/auth/verify-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code: inputCode as number , password }),
  });

    const data = await res.json()
    setSending(false)

  if (!res.ok) {
    setError(data.error || "Verification failed")
  } else {
    setDone(true)
  }
}


  const handleResend = (e: React.FormEvent) => {
    handleReset()
    setCount(50)

  };


  useEffect(()=>{
    console.log(inputCode)
    if(inputCode.length === 4){
      setFilled(true)
    }
    else{
      setFilled(false)
    }
  },[inputCode])


  useEffect(() => {
  if (!submitted || count <= 0) return;

  const timer = setTimeout(() => {
    setCount((prev) => prev - 1);
  }, 1000);

  return () => clearTimeout(timer); // cleanup
}, [count, submitted]);

  return (
    <div className="theme-bg min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 border theme-border p-8 rounded-lg shadow-sm">
        {/* Header */}
        <h2 className="text-2xl font-semibold text-center theme-text">Forgot Password</h2>

        {(submitted && !done) ? (
            <div>
            <p className="text-sm text-center theme-text">We sent a 4-digit code to your email</p>

            <VerificationCodeInput inputCode={inputCode} setInputCode={setInputCode} />
            <p
            onClick={() => setSubmitted(false)}
            className="text-xs text-blue-500 hover:underline mt-5 cursor-pointer">Change email?</p>
           {(count == 0) ?  <p
            onClick={handleResend}
            className="text-xs mt-1 theme-text hover:underline cursor-pointer">Did not get a code? Resend.</p>
            :
            <div className="flex gap-2 items-center mt-1">
            <span className="loading loading-bars loading-xs"></span>
            <p className="text-xs text-gray-500 cursor-not-allowed">Waiting for code ... {count}</p>
            </div>
          }
          <label className="w-full rounded p-1">
            <p className="text-sm">New Password</p>
            <input type="password" className="theme-border border-2 w-full rounded p-1 focus:outline-none" type="text" value={password} onChange={(e) => setPassword(e.target.value)}/>
            </label>
            {error &&  <p className="mt-3 w-full text-xs text-center rounded p-3 bg-red-500 line-clamp-2 text-white">{error}</p>}
            <button
            onClick={handleVerifyAndReset}
            disabled={!filled || !(password.length > 0)}
             className="mt-6 w-full cursor-pointer bg-blue-600 text-white py-2.5 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-400">{ sending ?  <span className="loading loading-bars loading-sm"></span> : "Verify"}</button>
            </div>

        ) :  (!submitted && !done) ? (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium theme-text mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border theme-border rounded-md  focus:outline-none text-sm"
              />
            </div>
            {error &&  <p className="mt-1 w-full text-xs text-center rounded p-3 bg-red-500 line-clamp-2 text-white">{error}</p>}
            <button
              type="submit"
              disabled={!email.includes("@")}
              className="w-full bg-blue-600 cursor-pointer text-white py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 ease-in-out active:scale-95 hover:bg-blue-700 focus:ring-offset-2
                disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-blue-400 disabled:hover:bg-blue-400 disabled:active:scale-100"
            >
              { sending ?  <span className="loading loading-bars loading-sm"></span> : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <div className="w-100 mx-auto">
          <Lottie animationData={animationData} loop={true} autoplay={true} />
          </div>
        )}

        <div className="w-fit mx-auto pt-2">
          <Link href="/auth/authorize" className="text-sm text-blue-500 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
