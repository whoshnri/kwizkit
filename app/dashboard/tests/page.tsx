"use client";

import { useEffect, useState, useCallback } from "react";
import { PiMagnifyingGlass } from "react-icons/pi";
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
import { DashboardField, fieldClass } from "../components/primitives";
import { DashboardSelect } from "../components/DashboardDropdown";

function getSubjectName(test: Test) {
  if (typeof test.subject === "string") return test.subject;
  return test.subjectName || test.subject?.name || "";
}

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

  const { session } = useSession();

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
      setTests((result.tests ?? []) as unknown as Test[]);
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
        getSubjectName(test).toLowerCase().includes(search.toLowerCase())) &&
      (filter === "all" || test.difficulty === filter)
  );

  if (loading) return <SkeletonLoader />;
  if (error) return <ErrorDisplay message={error} />;

  return (
    <div className="space-y-8 pb-6">
      <section className="grid gap-4 lg:grid-cols-2">
        <DashboardField label="Search">
          <div className="relative">
            <PiMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[var(--rubric-muted)]" />
            <input
              type="text"
              placeholder="Search tests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${fieldClass} pl-12`}
            />
          </div>
        </DashboardField>
        <DashboardField label="Difficulty">
          <DashboardSelect
            value={filter}
            onValueChange={setFilter}
            options={[
              { value: "all", label: "All difficulty" },
              { value: "easy", label: "Easy" },
              { value: "medium", label: "Medium" },
              { value: "hard", label: "Hard" },
            ]}
          />
        </DashboardField>
      </section>

      {filteredTests.length === 0 ? (
        <EmptyState
          hasTests={tests.length > 0}
          onCreate={() => setNewTestModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
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
