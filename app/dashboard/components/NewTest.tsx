"use client";
import React, { useState } from "react";
import { useSession } from "../../SessionContext";

interface ToolbarProps {
  setNewTest: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CreateTestPage({setNewTest} : ToolbarProps) {
  const {session} = useSession()
  const [form, setForm] = useState({
    name: "",
    subject: "",
    totalMarks: 0,
    numberOfQuestions: 0,
    difficulty: "easy",
    visibility: false,
    description: "",
  });
  const [load, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // console.log(session)
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.subject.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    if (!session) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          createdById: session.sub,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create test");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setNewTest(false);
      window.location.reload();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setNewTest(false)
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="theme-bg rounded shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b theme-border dark:border-gray-700 flex items-center justify-between">
          <h1 className="text-xl font-semibold theme-border">
            Create New Test
          </h1>
          <button
            onClick={() => setNewTest(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Test Name */}
            <div>
              <label className="block text-sm font-medium theme-text mb-1">
                Test Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                placeholder="Enter test name"
                onChange={handleChange}
                value={form.name}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg theme-text theme-border placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                name="subject"
                placeholder="Enter subject"
                onChange={handleChange}
                value={form.subject}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg theme-text theme-border placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
            </div>

            {/* Difficulty and Visibility - Side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">
                  Difficulty
                </label>
                <select
                  name="difficulty"
                  onChange={handleChange}
                  value={form.difficulty}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg theme-text theme-border placeholder-gray-500 dark:placeholder-gray-400"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">

                  Visibility
                   <span className="text-red-500 ml-2">*</span>
                   <sup className="ml-1 text-xs text-gray-400">(you can edit this later)</sup>

                </label>
                <input
                  name="visibility"
                  disabled
                  value={form.visibility ? "Public" : "Private"}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg theme-text theme-border placeholder-gray-500 dark:placeholder-gray-400 disabled:cursor-not-allowed disabled:opacity-30 "
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                name="description"
                placeholder="Enter description (optional)"
                onChange={handleChange}
                value={form.description}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg theme-text theme-border placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t theme-border flex justify-end space-x-3">
          <button
            onClick={handleBackdropClick}
            className="px-4 py-2 theme-bg rounded border theme-border cursor-pointer  hover:text-gray-900  transition-colors"
            disabled={load}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white cursor-pointer rounded font-medium transition-colors flex items-center space-x-2"
            disabled={load}
          >
            {load && (
          <span className="loading loading-bars loading-sm"></span>

            )}
            <span>{load ? "Creating..." : "Create Test"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
