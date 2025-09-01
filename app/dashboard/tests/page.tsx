"use client";
import { useEffect, useState } from "react";
import NewTest from "../components/NewTest";
import SettingsModal from "../components/SettingsModal";
import { Test } from "@/lib/test";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { MdPublic } from "react-icons/md";
import { MdStarHalf, MdStar, MdStarBorder } from "react-icons/md";
import { MdOutlineLock } from "react-icons/md";
import { fetchTests } from "@/app/actions/fetchUserTests";
import TestOptionsDropdown from "../components/TestOptionsDropdown";
import { useSession } from "@/app/SessionContext";
import { IoCheckmark } from "react-icons/io5";
import { BsCopy } from "react-icons/bs";

export default function TestList() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [newTest, setNewTest] = useState<boolean>(false);
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string>("");
  const [deleting, setDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const { session } = useSession();
  const [copied, setCopied] = useState<boolean>(false);

  function saveToClipboard(e: React.MouseEvent, testSlug: string) {
    e.stopPropagation();
    navigator.clipboard.writeText(`http://localhost:3000//test/${testSlug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

      
    async function loadTests(session: any){
      let mounted = true;
      setLoading(true);
      setError("");
      try {
        const result = await fetchTests(session.sub);
        if (!mounted) return;
        if ("error" in result) throw new Error(result.error);
        const tests = (result.tests ?? []) as Test[];
        setTests(tests);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message ?? "Failed to load tests");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };  

  useEffect(() => {
    if (!session?.sub) {
      return;
    }
    if (newTest || settingsModal) {
      return;
    }



    loadTests(session);

  }, [session?.sub, newTest,settingsModal]);

  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.name.toLowerCase().includes(search.toLowerCase()) ||
      test.subject.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || test.difficulty === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async () => {
    if (!selectedTestId) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/test", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId: selectedTestId }),
      });
      if (!res.ok) throw new Error("Failed to delete test");
      setTests((prev) => prev.filter((test) => test.id !== selectedTestId));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setShowFailure(true);
      setTimeout(() => setShowFailure(false), 3000);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setSelectedTestId("");
    }
  };

  // --- SKELETON UI while loading ---
  if (loading) {
    return (
      <div className="theme-bg theme-text p-2 rounded h-full">
        <p className="text-sm font-semibold p-2">
          Manage and view all your created tests
        </p>
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search tests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border theme-border rounded focus:outline-none focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded border text-sm focus:outline-none appearance-none theme-bg-subtle theme-border theme-text bg-white dark:bg-gray-800"
          >
            <option
              className="bg-white dark:bg-gray-800 text-black dark:text-white"
              value="all"
            >
              All Difficulty
            </option>
            <option
              className="bg-white dark:bg-gray-800 text-black dark:text-white"
              value="easy"
            >
              Easy
            </option>
            <option
              className="bg-white dark:bg-gray-800 text-black dark:text-white"
              value="medium"
            >
              Medium
            </option>
            <option
              className="bg-white dark:bg-gray-800 text-black dark:text-white"
              value="hard"
            >
              Hard
            </option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded shadow-sm transition-shadow duration-200 border theme-border"
            >
              <div className="p-4">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
                <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />

                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
              <div className="px-6 py-3 theme-bg-subtle border-t theme-border">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 theme-bg rounded theme-text mx-auto h-full w-full flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center space-y-2 max-w-sm w-full">
          <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400 mx-auto" />
          <p className="text-red-600 dark:text-red-400 font-semibold text-base">
            Error loading tests
          </p>
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-bg theme-text p-2 rounded h-full">
      {/* Success and Failure Messages */}
      {showSuccess && (
        <div className="fixed top-12 z-50 right-4 bg-green-500 text-white p-4 rounded shadow-lg">
          Test deleted successfully!
        </div>
      )}
      {showFailure && (
        <div className="fixed top-12 z-50 right-4 bg-red-500 text-white p-4 rounded shadow-lg">
          Failed to delete test
        </div>
      )}
      {/* Header */}
      <p className="text-sm font-semibold p-2">
        Manage and view all your created tests
      </p>
      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search tests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border theme-border rounded focus:outline-none focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 rounded border text-sm focus:outline-none appearance-none theme-bg-subtle theme-border theme-text bg-white dark:bg-gray-800"
        >
          <option
            className="bg-white dark:bg-gray-800 text-black dark:text-white"
            value="all"
          >
            All Difficulty
          </option>
          <option
            className="bg-white dark:bg-gray-800 text-black dark:text-white"
            value="easy"
          >
            Easy
          </option>
          <option
            className="bg-white dark:bg-gray-800 text-black dark:text-white"
            value="medium"
          >
            Medium
          </option>
          <option
            className="bg-white dark:bg-gray-800 text-black dark:text-white"
            value="hard"
          >
            Hard
          </option>
        </select>
      </div>
      {/* Tests Grid */}
      {filteredTests.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 theme-bg-subtle rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium theme-text mb-2">
            {tests.length === 0
              ? "No tests created yet"
              : "No tests match your search"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {tests.length === 0
              ? "Create your first test to get started"
              : "Try adjusting your search or filter"}
          </p>
          {tests.length === 0 && (
            <button
              onClick={() => setNewTest(true)}
              className="bg-blue-600 cursor-pointer hover:bg-blue-700 theme-text px-4 py-2 rounded font-medium transition-colors"
            >
              Create Your First Test
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="rounded shadow-sm hover:shadow-md transition-shadow duration-200 border theme-border group cursor-pointer "
            >
              <div
                onClick={() =>
                  router.push(`/dashboard/tests/${test.slug}?testId=${test.id}`)
                }
                className="p-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <span
                      className={`theme-border border theme-bg-subtle px-3 flex items-center py-1 rounded-full text-xs font-medium uppercase `}
                    >
                      {test.difficulty.toLowerCase() === "easy" && (
                        <MdStarBorder className="text-blue-500 w-5 h-5" />
                      )}
                      {test.difficulty.toLowerCase() === "medium" && (
                        <MdStarHalf className="text-orange-500 w-5 h-5" />
                      )}
                      {test.difficulty.toLowerCase() === "hard" && (
                        <MdStar className="text-red-500 w-5 h-5" />
                      )}
                      <span className="capitalize">{test.difficulty}</span>
                    </span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      className="w-5 h-5 brand-text"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
                {/* Content */}
                <h3 className="text-lg font-semibold  mb-2 group-hover:text-blue-600 dark:group-hover:brand-text transition-colors">
                  {test.name}
                </h3>
                <p className=" opacity-70 mb-4 text-sm uppercase">Subject: {test.subject}</p>
                {/* Stats */}
                <div className="flex gap-4 text-xs opacity-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{test.numberOfQuestions} questions</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                    <span>{test.totalMarks} marks</span>
                  </div>
                </div>
              </div>
              {/* Footer */}
              <div className="px-2 py-3 theme-bg-subtle border-t theme-border">
                <div className="flex items-center justify-between">
                  <span
                    className=''
                  >
                    {test.visibility ? (
                      <div className="flex gap-4 items-center text-sm">
                        <span className="uppercase flex gap-1 bg-green-500 opp-text items-center py-1 px-3 rounded-full border border-gray-500">
                          <MdPublic className="w-4 h-4" />
                          public
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            saveToClipboard(e, test.slug);
                          }}
                          className={`w-full rounded-full p-1 overflow-hidden border border-gray-500 ${copied ? 'brand-bg' : "theme-bg"} hover:cursor-pointer`}
                        >
                          {copied ? (
                            <span className=" text-white flex items-center gap-1 w-full  px-3 transition-colors">
                              <IoCheckmark className="w-4 h-4 inline" /> Copied!
                            </span>
                          ) : (
                            <span className="flex items-center  gap-2 w-full px-3 transition-colors">
                              <BsCopy className="w-4 h-4" />
                              Share Test
                            </span>
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="uppercase flex gap-1 items-center bg-gray-500 opp-text py-1 px-3 rounded-full border border-gray-500 text-sm">
                        <MdOutlineLock className="w-4 h-4" />
                        private
                      </span>
                    )}
                  </span>
                  <TestOptionsDropdown
                    testVisibility={test.visibility}
                    testSlug={test.slug}
                    setShowSettingsModal={setShowSettingsModal}
                    setSelectedTestId={setSelectedTestId}
                    testId={test.id}
                    setShowDeleteModal={setShowDeleteModal}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="theme-bg p-6 rounded shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-4">
              Are you sure you want to delete this test? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTestId("");
                }}
                className="px-4 py-2 cursor-pointer hover:bg-gray-400 bg-gray-300 text-gray-800 rounded duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={`px-4 py-2 cursor-pointer hover:bg-red-700 duration-200 bg-red-600 text-white rounded ${
                  deleting ? "opacity-50" : ""
                }`}
              >
                {deleting ? (
                  <span className="loading loading-bars loading-sm" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {newTest && <NewTest setNewTest={setNewTest} />}
      {settingsModal && (
        <SettingsModal
          testId={selectedTestId}
          setShowSettingsModal={setShowSettingsModal}
        />
      )}
    </div>
  );
}
