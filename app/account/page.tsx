"use client"

import { useEffect, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import {
  User, Mail, Settings, LogOut, Shield,
  Trash2, ChevronRight, FileText, Users as StudentsIcon
} from "lucide-react";

// Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

// Animated number component for stats
function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const spring = useSpring(0, {
    damping: 20,
    stiffness: 100,
    mass: 1,
  });

  const animatedValue = useTransform(spring, (val) => Math.floor(val));

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  return <motion.span ref={ref}>{animatedValue}</motion.span>;
}

// Data for info rows
const accountDetails = [
  {
    icon: <Mail size={20} />,
    label: "Email Address",
    value: "john.educator@school.edu",
    action: "Edit"
  },
  {
    icon: <User size={20} />,
    label: "Full Name",
    value: "John Educator",
    action: "Edit"
  },
  {
    icon: <Shield size={20} />,
    label: "Current Plan",
    value: "Tutor+ Plan",
    action: "Upgrade"
  },
];

export default function AccountPage() {
  return (
    <div className="theme-bg theme-text min-h-screen py-16 md:py-24 px-6">
      <motion.section
        className="max-w-3xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Manage Your <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Account</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
            Update your preferences and track your activity
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div variants={itemVariants} className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-blue-500/5 mb-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <User className="text-white" size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">John Educator</h2>
              <p className="text-gray-500 dark:text-gray-400">Mathematics Teacher</p>
            </div>
          </div>

          <div className="space-y-4">
            {accountDetails.map((detail, index) => (
              <div key={`${detail.label}-${index}`} className="flex items-center justify-between p-4 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-gray-500 dark:text-gray-400">{detail.icon}</div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">{detail.label}</label>
                    <p className="font-semibold">{detail.value}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={
                    detail.action === "Upgrade"
                      ? "px-4 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-md transition-all"
                      : "text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                  }
                >
                  {detail.action}
                </motion.button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats and Actions Grid */}
        <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Stats */}
          <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-blue-500/5">
            <h3 className="text-xl font-semibold mb-6">Activity at a Glance</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-300">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    <AnimatedNumber value={24} />
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Tests Created</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-900/50 rounded-lg text-green-600 dark:text-green-300">
                  <StudentsIcon size={24} />
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    <AnimatedNumber value={156} />
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Students Assessed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-blue-500/5">
            <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>
            <div className="space-y-2">
              <a href="#" className="flex items-center justify-between p-3 text-left hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors group">
                <div className="flex items-center gap-3">
                  <Settings size={20} className="text-gray-500" />
                  <span>Account Preferences</span>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#" className="flex items-center justify-between p-3 text-left hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors group">
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-gray-500" />
                  <span>Notification Settings</span>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={itemVariants} className="bg-red-50/50 dark:bg-red-900/20 rounded-2xl p-8 border border-red-200/50 dark:border-red-800/30">
          <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-4">Danger Zone</h3>
          <div className="space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
            <p className="text-sm text-red-600 dark:text-red-300/80 flex-1">
              These actions are permanent and cannot be undone. Proceed with caution.
            </p>
            <div className="flex items-center gap-4 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <LogOut size={16} />
                Log Out
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md transition-colors"
              >
                <Trash2 size={16} />
                Delete Account
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
}
