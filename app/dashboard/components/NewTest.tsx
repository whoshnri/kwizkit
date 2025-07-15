"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"
import { Test } from "@/lib/test";


interface ToolbarProps {
  setNewTest: (newTest: Partial<Test>) => void;
}

export default function CreateTestPage({setNewTest} : ToolbarProps) {
  const { data: session } = useSession()
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    subject: "",
    format: "multiple_choice",
    totalMarks: 0,
    durationMinutes: 30,
    numberOfQuestions: 0,
    difficulty: "easy",
    visibility: "private",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!form.name.trim() || !form.subject.trim()) {
      setError("Please fill in all required fields");
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
          createdById: session?.user?.id
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create test");
      setNewTest(false)
      window.location.reload()
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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


            {/* Format and Duration - Side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration (mins)
                </label>
                <input
                  type="number"
                  name="durationMinutes"
                  placeholder="30"
                  onChange={handleChange}
                  value={form.durationMinutes}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg theme-text theme-border placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
               {/* Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Format
              </label>
              <select
                name="format"
                onChange={handleChange}
                value={form.format}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg theme-text theme-border placeholder-gray-500 dark:placeholder-gray-400"
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="theory">Theory</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            </div>

            {/* Difficulty and Visibility - Side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Visibility
                </label>
                <select
                  name="visibility"
                  onChange={handleChange}
                  value={form.visibility}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg theme-text theme-border placeholder-gray-500 dark:placeholder-gray-400"
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            className="px-4 py-2 text-gray-700 rounded border theme-border cursor-pointer dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white cursor-pointer rounded font-medium transition-colors flex items-center space-x-2"
            disabled={loading}
          >
            {loading && (
          <span className="loading loading-bars loading-sm"></span>

            )}
            <span>{loading ? "Creating..." : "Create Test"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
