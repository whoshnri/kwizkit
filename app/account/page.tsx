"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  User, Mail, Settings, LogOut, Shield,
  Trash2, ChevronRight, FileText, Users as StudentsIcon
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// --- Type Definitions ---
interface AnimatedNumberProps { value: number; }
interface AccountDetail {
  icon: React.ReactNode;
  label: string;
  value: string;
  action: "Edit" | "Upgrade";
}

// --- GSAP-Powered Animated Number Component ---
function AnimatedNumber({ value }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    gsap.to(ref.current, {
      textContent: value,
      duration: 1.5,
      ease: "power2.inOut",
      roundProps: "textContent",
      scrollTrigger: { trigger: ref.current, start: "top 90%" }
    });
  }, { dependencies: [value], scope: ref });
  return <span ref={ref}>0</span>;
}

const accountDetails: AccountDetail[] = [
  { icon: <Mail size={20} />, label: "Email Address", value: "john.educator@school.edu", action: "Edit" },
  { icon: <User size={20} />, label: "Full Name", value: "John Educator", action: "Edit" },
  { icon: <Shield size={20} />, label: "Current Plan", value: "Tutor+ Plan", action: "Upgrade" },
];

export default function AccountPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.utils.toArray<HTMLElement>(".animated-section").forEach((section, index) => {
      gsap.from(section, {
        opacity: 0, y: 50, duration: 0.8, delay: index * 0.1, ease: "power2.out",
        scrollTrigger: { trigger: section, start: "top 95%" }
      });
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="theme-bg theme-text min-h-screen py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <section className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Manage Your <span className="theme-text-accent">Account</span></h1>
          <p className="text-lg md:text-xl theme-text-secondary">Update your preferences and track your activity</p>
        </div>

        {/* Profile Card */}
        <div className="animated-section rounded-md p-8 border-2 border-dashed theme-border-color mb-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 border-2 theme-text-accent border-dashed theme-border-color-accent rounded-full flex items-center justify-center"><User className="" size={40} /></div>
            <div>
              <h2 className="text-2xl font-bold">John Educator</h2>
              <p className="theme-text-secondary cursor-pointer hover:underline">@john.pioneer1</p>
            </div>
          </div>
          <div className="space-y-4">
            {accountDetails.map((detail, index) => (
              <div key={index} className="flex items-center justify-between p-4 theme-border-color border-2 border-dashed rounded-md">
                <div className="flex flex-1 items-center gap-4">
                  <div className="theme-text-secondary">{detail.icon}</div>
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary">{detail.label}</label>
                    <p className="font-semibold">{detail.value}</p>
                  </div>
                </div>
                <button className={detail.action === "Upgrade" ? "theme-button-primary flex-1 text-sm py-1.5 px-4" : "theme-text-accent hover:underline text-sm font-medium"}>
                  {detail.action}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Stats and Actions Grid */}
        <div className="grid gap-8 mb-8">
          {/* Stats */}
          <div className="animated-section rounded-md p-8 border-2 border-dashed theme-border-color">
            <h3 className="text-xl font-semibold mb-6">Activity at a Glance</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <FileText className="theme-text-accent" size={24} />
                <div>
                  <div className="text-3xl font-bold theme-text-accent"><AnimatedNumber value={24} /></div>
                  <div className="text-sm theme-text-secondary">Tests Created</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <StudentsIcon className="theme-text-accent" size={24} />
                <div>
                  <div className="text-3xl font-bold theme-text-accent"><AnimatedNumber value={156} /></div>
                  <div className="text-sm theme-text-secondary">Students Assessed</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Danger Zone */}
        <div className="animated-section rounded-md p-8 border-2 border-dashed theme-danger-border-color">
          <h3 className="text-xl font-semibold theme-danger-text mb-4">Danger Zone</h3>
          <div className="space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
            <p className="text-sm theme-danger-text flex-1">These actions are permanent and cannot be undone.</p>
            <div className="flex items-center gap-4 flex-shrink-0">
              <button className="flex-1 theme-button-secondary">Log Out</button>
              <button className="theme-button-danger">Delete Account</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}