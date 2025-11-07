"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useSession } from "@/app/SessionContext";
import { Test } from "@/lib/test";
import { fetchTests } from "@/app/actions/fetchUserTests";

import NewTest from "../components/NewTest";
import SettingsModal from "../components/SettingsModal";
import TestCard from "./components/TestCard";
import SkeletonLoader from "./components/SkeletonLoader";
import ErrorDisplay from "./components/ErrorDisplay";
import { toast } from "sonner";
import EmptyState from "./components/EmptyState";
import DeleteModal from "./components/DeleteModal";
import { deleteTest } from "@/app/actions/testOps";

export default function TestList() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isNewTestModalOpen, setNewTestModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState("");
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();
  const { session } = useSession();

  const containerRef = useRef<HTMLDivElement>(null);

  const loadTests = useCallback(async () => {
    if (!session?.id) return;
    setLoading(true);
    try {
      const result = await fetchTests(session.id);
      if ("error" in result) {
        toast.error(result.error);
        setTests([]);
        return;
      }
      setTests((result.tests ?? []) as Test[]);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load tests");
    } finally {
      setLoading(false);
    }
  }, [session?.id]);

  useEffect(() => {
    loadTests();
  }, [session]);

  const handleDelete = async () => {
    if (!selectedTestId) return;
    setDeleting(true);
    console.log("Deleting test with ID:", selectedTestId);
    const res = await deleteTest(selectedTestId);
    setDeleting(false);
    if (res.status === 200) {
      setTests((prev) => prev.filter((test) => test.id !== selectedTestId));
      toast.success("Test deleted successfully!");
      setDeleteModalOpen(false);
    } else {
      toast.error("Failed to delete test.");
    }
  };

  const openDeleteModal = (id: string) => {
    setSelectedTestId(id);
    setDeleteModalOpen(true);
  };

  const openSettingsModal = (id: string) => {
    setSelectedTestId(id);
    setSettingsModalOpen(true);
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setSelectedTestId("");
  };

  const filteredTests = tests.filter(
    (test) =>
      (test.name.toLowerCase().includes(search.toLowerCase()) ||
        test.subject.toLowerCase().includes(search.toLowerCase())) &&
      (filter === "all" || test.difficulty === filter)
  );

  if (loading) return <SkeletonLoader />;
  if (error) return <ErrorDisplay message={error} />;

  return (
    <div
      ref={containerRef}
      className="theme-bg theme-text p-2 rounded-md h-full"
    >
      <p className="animated-content text-sm font-semibold p-2">
        Manage and view all your created tests
      </p>

      <div className="animated-content mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 theme-text-secondary" />
          <input
            type="text"
            placeholder="Search tests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className=" pl-10 w-full theme-input"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="theme-input"
        >
          <option className="theme-bg" value="all">All Difficulty</option>
          <option className="theme-bg" value="easy">Easy</option>
          <option className="theme-bg" value="medium">Medium</option>
          <option className="theme-bg" value="hard">Hard</option>
        </select>
      </div>

      {filteredTests.length === 0 ? (
        <EmptyState
          hasTests={tests.length > 0}
          onCreate={() => setNewTestModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredTests.map((test, index) => (
            <TestCard
              key={test.id}
              test={test}
              index={index}
              onSettingsClick={openSettingsModal}
              onDeleteClick={openDeleteModal}
            />
          ))}
        </div>
      )}

      {isNewTestModalOpen && (
        <NewTest
          setNewTest={(value) => {
            setNewTestModalOpen(value);
            if (!value) loadTests();
          }}
        />
      )}
      {isSettingsModalOpen && (
        <SettingsModal
          testId={selectedTestId}
          setShowSettingsModal={(value) => {
            setSettingsModalOpen(value);
            if (!value) loadTests();
          }}
        />
      )}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onCancel={cancelDelete}
        onDelete={handleDelete}
        deleting={deleting}
      />
    </div>
  );
}
