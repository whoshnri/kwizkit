"use client";

import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  PiList,
  PiMagnifyingGlass,
  PiPlus,
  PiArrowClockwise,
  PiX,
} from "react-icons/pi";
import NewTest from "./NewTest";
import { useSession } from "../../SessionContext";
import AIContentModal from "./Aimodal";
import { DashboardButton, DashboardField, ResponsiveSheet, fieldClass } from "./primitives";
import FlareIcon from '@mui/icons-material/Flare';
import DashboardBreadcrumb from "./DashboardBreadcrumb";
import { DashboardSearchResult, searchDashboard } from "@/app/actions/dashboardSearchOps";
import { DashboardSelect } from "./DashboardDropdown";
import { toast } from "sonner";
import {
  fetchClassLists,
  fetchMaterials,
  saveCertificate,
  saveClassList,
  saveMaterial,
  saveStudent,
  saveSubject,
} from "@/app/actions/schoolOps";
import { topUpWallet } from "@/app/actions/accountOps";
import {
  genderOptions,
  labelize,
  levelOptions,
  materialTypeOptions,
} from "../lib/schoolOptions";

type HeaderCreateKind =
  | "student"
  | "class"
  | "subject"
  | "material"
  | "certificate"
  | "top-up";

const emptyStudent = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  gender: "male",
  image: "",
  level: "ss1",
  studentId: "",
  dateOfBirth: "",
  address: "",
  guardianName: "",
  guardianPhone: "",
  isActive: true,
};

const emptyClass = {
  name: "",
  description: "",
  level: "ss1",
  session: "",
  isActive: true,
};

const emptySubject = {
  name: "",
  code: "",
  description: "",
  level: "ss1",
  unit: 2,
  classListId: "",
};

const emptyMaterial = {
  name: "",
  level: "ss1",
  type: "document",
  subjectId: "",
};

const emptyCertificate = {
  name: "",
  description: "",
  issuedBy: "",
  issuedAt: "",
};

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const [newTest, setNewTest] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<DashboardSearchResult[]>([]);
  const [activeCreate, setActiveCreate] = useState<HeaderCreateKind | null>(null);
  const [createSaving, setCreateSaving] = useState(false);
  const [studentForm, setStudentForm] = useState<any>(emptyStudent);
  const [classForm, setClassForm] = useState<any>(emptyClass);
  const [subjectForm, setSubjectForm] = useState<any>(emptySubject);
  const [materialForm, setMaterialForm] = useState<any>(emptyMaterial);
  const [certificateForm, setCertificateForm] = useState<any>(emptyCertificate);
  const [topUpAmount, setTopUpAmount] = useState(5000);
  const [creationResources, setCreationResources] = useState<any>({
    classes: [],
    subjects: [],
  });
  const { session, loading } = useSession();
  const isTestEditorRoute =
    pathname.startsWith("/dashboard/tests/") && pathname.split("/").length === 4;
  const pageTitle = segments[segments.length - 1]
    ? decodeURIComponent(segments[segments.length - 1]).replace(/-/g, " ")
    : "Dashboard";
  const title = pathname === "/dashboard" ? `Hi, ${session?.firstName ?? "Henry"}` : pageTitle;
  const subtitle =
    pathname === "/dashboard"
      ? "Track academic records, assessments, materials, certificates, and wallet activity."
      : pathname === "/dashboard/tests"
        ? "Manage and view all your created tests."
        : pathname === "/dashboard/students"
          ? "Manage student records and related academic history."
          : pathname === "/dashboard/classes"
            ? "Create class lists and append students."
            : pathname === "/dashboard/subjects"
              ? "Manage subjects, class links, and enrollments."
              : pathname === "/dashboard/materials"
                ? "Create materials and attach dummy uploads."
                : pathname === "/dashboard/certificates"
                  ? "Create certificates and assign them to students."
                  : pathname === "/dashboard/transactions"
                    ? "Review wallet transactions and dummy top-ups."
                    : pathname === "/dashboard/account"
                      ? "Update account details and review usage."
                      : "Manage this dashboard resource.";

  useEffect(() => {
    if (!searchOpen || !session?.id) return;

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    let active = true;
    setSearching(true);
    const timer = window.setTimeout(async () => {
      const response = await searchDashboard(session.id, searchQuery);
      if (!active) return;
      setSearchResults(response.results ?? []);
      setSearching(false);
    }, 180);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [searchOpen, searchQuery, session?.id]);

  useEffect(() => {
    if (!searchOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSearchOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  const newItems = useMemo(
    () => [
      { value: "test", label: "Test" },
      { value: "student", label: "Student" },
      { value: "class", label: "Class" },
      { value: "subject", label: "Subject" },
      { value: "material", label: "Material" },
      { value: "certificate", label: "Certificate" },
      { value: "top-up", label: "Top-up" },
    ],
    []
  );

  useEffect(() => {
    if (!session?.id || !activeCreate) return;

    let active = true;
    async function loadCreationResources() {
      if (activeCreate === "subject") {
        const response = await fetchClassLists(session!.id);
        if (!active) return;
        if ("error" in response) toast.error(response.error);
        else setCreationResources((current: any) => ({ ...current, classes: response.classLists ?? [] }));
      }

      if (activeCreate === "material") {
        const response = await fetchMaterials(session!.id);
        if (!active) return;
        if ("error" in response) toast.error(response.error);
        else setCreationResources((current: any) => ({ ...current, subjects: response.subjects ?? [] }));
      }
    }

    void loadCreationResources();

    return () => {
      active = false;
    };
  }, [activeCreate, session?.id]);

  function openResult(result: DashboardSearchResult) {
    setSearchOpen(false);
    setSearchQuery("");
    router.push(result.href);
  }

  function openCreate(value: string) {
    if (value === "test") {
      setNewTest(true);
      return;
    }

    if (value === "student") setStudentForm(emptyStudent);
    if (value === "class") setClassForm(emptyClass);
    if (value === "subject") setSubjectForm(emptySubject);
    if (value === "material") setMaterialForm(emptyMaterial);
    if (value === "certificate") {
      setCertificateForm({
        ...emptyCertificate,
        issuedBy: [session?.firstName, session?.lastName].filter(Boolean).join(" "),
      });
    }
    if (value === "top-up") setTopUpAmount(5000);

    setActiveCreate(value as HeaderCreateKind);
  }

  async function submitHeaderCreate() {
    if (!session?.id || !activeCreate) return;

    setCreateSaving(true);
    try {
      const response =
        activeCreate === "student"
          ? await saveStudent(session.id, studentForm)
          : activeCreate === "class"
            ? await saveClassList(session.id, classForm)
            : activeCreate === "subject"
              ? await saveSubject(session.id, subjectForm)
              : activeCreate === "material"
                ? await saveMaterial(session.id, materialForm, null)
                : activeCreate === "certificate"
                  ? await saveCertificate(session.id, certificateForm)
                  : await topUpWallet(session.id, topUpAmount);

      if ("error" in response) {
        toast.error(response.error);
        return;
      }

      toast.success(response.message ?? "Created successfully");
      setActiveCreate(null);
      router.refresh();
      if (
        (activeCreate === "student" && pathname === "/dashboard/students") ||
        (activeCreate === "class" && pathname === "/dashboard/classes") ||
        (activeCreate === "subject" && pathname === "/dashboard/subjects") ||
        (activeCreate === "material" && pathname === "/dashboard/materials") ||
        (activeCreate === "certificate" && pathname === "/dashboard/certificates") ||
        (activeCreate === "top-up" && pathname === "/dashboard/transactions")
      ) {
        window.location.reload();
      }
    } finally {
      setCreateSaving(false);
    }
  }

  return (
    <>
      <div className="px-4 pb-4 pt-4 sm:px-6 lg:px-9 lg:pt-12">
        <div className="mb-8 flex items-center justify-between lg:hidden">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Rubric" width={30} height={30} className="rounded-lg" />
            <span className="text-[17px] font-semibold">Rubric</span>
          </Link>
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[var(--rubric-black)] text-white"
            aria-label="Open sidebar"
          >
            <PiList className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <DashboardBreadcrumb pathname={pathname} />
            {loading ? (
              <div className="mt-2 h-11 w-48 animate-pulse rounded-lg bg-black/5" />
            ) : (
              <h1 className="mt-2 truncate text-[40px] font-normal leading-tight tracking-normal text-[var(--rubric-black)]">
                {title} 
              </h1>
            )}
            <p className="mt-1 text-base text-[var(--rubric-muted)]">{subtitle}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {!isTestEditorRoute && <div className="relative w-full sm:w-auto">
              <PiMagnifyingGlass className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--rubric-muted)]" />
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search dashboard"
                className="h-12 w-full rounded-full border border-[var(--border)] bg-[var(--surface-strong)] pl-14 pr-5 text-left text-sm text-[var(--rubric-muted)] outline-none transition hover:border-[var(--rubric-black)]/30 sm:w-[260px] lg:w-[360px]"
              >
                Search dashboard
              </button>
            </div>}
            <DashboardButton variant="secondary" onClick={() => window.location.reload()}>
              <PiArrowClockwise className="h-5 w-5" />
              Reload
            </DashboardButton>
            {!isTestEditorRoute && (
              <div className="w-full sm:w-auto">
                <DashboardSelect
                  value=""
                  placeholder="New"
                  searchPlaceholder="Search creation..."
                  maxMenuHeight={280}
                  trigger={
                    <DashboardButton className="w-full sm:w-auto">
                      <PiPlus className="h-5 w-5" />
                      New
                    </DashboardButton>
                  }
                  options={newItems.map((item) => ({
                    value: item.value,
                    label: item.label,
                  }))}
                  onValueChange={(value) => {
                    openCreate(value);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {pathname !== "/dashboard" && (
        <ProjectToolbar />
      )}
      {newTest && <NewTest setNewTest={setNewTest} />}
      {activeCreate && (
        <HeaderCreateSheet
          kind={activeCreate}
          saving={createSaving}
          onClose={() => setActiveCreate(null)}
          onSubmit={submitHeaderCreate}
          studentForm={studentForm}
          setStudentForm={setStudentForm}
          classForm={classForm}
          setClassForm={setClassForm}
          subjectForm={subjectForm}
          setSubjectForm={setSubjectForm}
          materialForm={materialForm}
          setMaterialForm={setMaterialForm}
          certificateForm={certificateForm}
          setCertificateForm={setCertificateForm}
          topUpAmount={topUpAmount}
          setTopUpAmount={setTopUpAmount}
          classes={creationResources.classes}
          subjects={creationResources.subjects}
        />
      )}
      <AnimatePresence>
        {searchOpen && (
          <DashboardSearchOverlay
            query={searchQuery}
            setQuery={setSearchQuery}
            results={searchResults}
            searching={searching}
            onClose={() => setSearchOpen(false)}
            onOpenResult={openResult}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function HeaderCreateSheet({
  kind,
  saving,
  onClose,
  onSubmit,
  studentForm,
  setStudentForm,
  classForm,
  setClassForm,
  subjectForm,
  setSubjectForm,
  materialForm,
  setMaterialForm,
  certificateForm,
  setCertificateForm,
  topUpAmount,
  setTopUpAmount,
  classes,
  subjects,
}: {
  kind: HeaderCreateKind;
  saving: boolean;
  onClose: () => void;
  onSubmit: () => void;
  studentForm: any;
  setStudentForm: Dispatch<SetStateAction<any>>;
  classForm: any;
  setClassForm: Dispatch<SetStateAction<any>>;
  subjectForm: any;
  setSubjectForm: Dispatch<SetStateAction<any>>;
  materialForm: any;
  setMaterialForm: Dispatch<SetStateAction<any>>;
  certificateForm: any;
  setCertificateForm: Dispatch<SetStateAction<any>>;
  topUpAmount: number;
  setTopUpAmount: Dispatch<SetStateAction<number>>;
  classes: any[];
  subjects: any[];
}) {
  const titleMap: Record<HeaderCreateKind, string> = {
    student: "Add student",
    class: "Create class",
    subject: "Create subject",
    material: "Create material",
    certificate: "Create certificate",
    "top-up": "Top up wallet",
  };

  return (
    <ResponsiveSheet
      title={titleMap[kind]}
      onClose={onClose}
      className={kind === "student" ? "md:max-w-3xl" : undefined}
      footer={
        <DashboardButton onClick={onSubmit} disabled={saving} className="w-full">
          {saving ? "Saving..." : titleMap[kind]}
        </DashboardButton>
      }
    >
      {kind === "student" && (
        <StudentQuickForm form={studentForm} setForm={setStudentForm} />
      )}
      {kind === "class" && (
        <ClassQuickForm form={classForm} setForm={setClassForm} />
      )}
      {kind === "subject" && (
        <SubjectQuickForm form={subjectForm} setForm={setSubjectForm} classes={classes} />
      )}
      {kind === "material" && (
        <MaterialQuickForm form={materialForm} setForm={setMaterialForm} subjects={subjects} />
      )}
      {kind === "certificate" && (
        <CertificateQuickForm form={certificateForm} setForm={setCertificateForm} />
      )}
      {kind === "top-up" && (
        <DashboardField label="Amount">
          <input
            type="number"
            min={1}
            value={topUpAmount}
            onChange={(event) => setTopUpAmount(Number(event.target.value))}
            className={fieldClass}
          />
        </DashboardField>
      )}
    </ResponsiveSheet>
  );
}

function StudentQuickForm({ form, setForm }: { form: any; setForm: Dispatch<SetStateAction<any>> }) {
  const set = (key: string, value: any) => setForm((current: any) => ({ ...current, [key]: value }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[
        ["firstName", "First name"],
        ["lastName", "Last name"],
        ["email", "Email"],
        ["phone", "Phone"],
        ["studentId", "Student ID"],
      ].map(([key, label]) => (
        <DashboardField key={key} label={label}>
          <input
            value={form[key] ?? ""}
            onChange={(event) => set(key, event.target.value)}
            className={fieldClass}
          />
        </DashboardField>
      ))}
      <DashboardField label="Gender">
        <DashboardSelect
          value={form.gender}
          onValueChange={(value) => set("gender", value)}
          options={genderOptions.map((option) => ({ value: option, label: labelize(option) }))}
        />
      </DashboardField>
      <DashboardField label="Level">
        <DashboardSelect
          value={form.level}
          onValueChange={(value) => set("level", value)}
          options={levelOptions.map((option) => ({ value: option, label: labelize(option) }))}
        />
      </DashboardField>
      <DashboardField label="Guardian name">
        <input
          value={form.guardianName ?? ""}
          onChange={(event) => set("guardianName", event.target.value)}
          className={fieldClass}
        />
      </DashboardField>
      <DashboardField label="Guardian phone">
        <input
          value={form.guardianPhone ?? ""}
          onChange={(event) => set("guardianPhone", event.target.value)}
          className={fieldClass}
        />
      </DashboardField>
    </div>
  );
}

function ClassQuickForm({ form, setForm }: { form: any; setForm: Dispatch<SetStateAction<any>> }) {
  const set = (key: string, value: any) => setForm((current: any) => ({ ...current, [key]: value }));

  return (
    <div className="space-y-4">
      <DashboardField label="Name">
        <input value={form.name} onChange={(event) => set("name", event.target.value)} className={fieldClass} />
      </DashboardField>
      <DashboardField label="Level">
        <DashboardSelect
          value={form.level}
          onValueChange={(value) => set("level", value)}
          options={levelOptions.map((option) => ({ value: option, label: labelize(option) }))}
        />
      </DashboardField>
      <DashboardField label="Session">
        <input value={form.session ?? ""} onChange={(event) => set("session", event.target.value)} className={fieldClass} />
      </DashboardField>
      <DashboardField label="Description">
        <input value={form.description ?? ""} onChange={(event) => set("description", event.target.value)} className={fieldClass} />
      </DashboardField>
    </div>
  );
}

function SubjectQuickForm({
  form,
  setForm,
  classes,
}: {
  form: any;
  setForm: Dispatch<SetStateAction<any>>;
  classes: any[];
}) {
  const set = (key: string, value: any) => setForm((current: any) => ({ ...current, [key]: value }));

  return (
    <div className="space-y-4">
      <DashboardField label="Name">
        <input value={form.name} onChange={(event) => set("name", event.target.value)} className={fieldClass} />
      </DashboardField>
      <DashboardField label="Code">
        <input value={form.code} onChange={(event) => set("code", event.target.value)} className={fieldClass} />
      </DashboardField>
      <DashboardField label="Class">
        <DashboardSelect
          value={form.classListId}
          onValueChange={(value) => set("classListId", value)}
          placeholder="Select class"
          options={classes.map((item) => ({ value: item.id, label: item.name }))}
        />
      </DashboardField>
      <DashboardField label="Level">
        <DashboardSelect
          value={form.level}
          onValueChange={(value) => set("level", value)}
          options={levelOptions.map((option) => ({ value: option, label: labelize(option) }))}
        />
      </DashboardField>
      <DashboardField label="Units">
        <input type="number" min={1} value={form.unit} onChange={(event) => set("unit", Number(event.target.value))} className={fieldClass} />
      </DashboardField>
    </div>
  );
}

function MaterialQuickForm({
  form,
  setForm,
  subjects,
}: {
  form: any;
  setForm: Dispatch<SetStateAction<any>>;
  subjects: any[];
}) {
  const set = (key: string, value: any) => setForm((current: any) => ({ ...current, [key]: value }));

  return (
    <div className="space-y-4">
      <DashboardField label="Name">
        <input value={form.name} onChange={(event) => set("name", event.target.value)} className={fieldClass} />
      </DashboardField>
      <DashboardField label="Subject">
        <DashboardSelect
          value={form.subjectId}
          onValueChange={(value) => set("subjectId", value)}
          placeholder="Select subject"
          options={subjects.map((item) => ({ value: item.id, label: item.name }))}
        />
      </DashboardField>
      <DashboardField label="Level">
        <DashboardSelect
          value={form.level}
          onValueChange={(value) => set("level", value)}
          options={levelOptions.map((option) => ({ value: option, label: labelize(option) }))}
        />
      </DashboardField>
      <DashboardField label="Type">
        <DashboardSelect
          value={form.type}
          onValueChange={(value) => set("type", value)}
          options={materialTypeOptions.map((option) => ({ value: option, label: labelize(option) }))}
        />
      </DashboardField>
    </div>
  );
}

function CertificateQuickForm({ form, setForm }: { form: any; setForm: Dispatch<SetStateAction<any>> }) {
  const set = (key: string, value: any) => setForm((current: any) => ({ ...current, [key]: value }));

  return (
    <div className="space-y-4">
      <DashboardField label="Name">
        <input value={form.name} onChange={(event) => set("name", event.target.value)} className={fieldClass} />
      </DashboardField>
      <DashboardField label="Description">
        <input value={form.description ?? ""} onChange={(event) => set("description", event.target.value)} className={fieldClass} />
      </DashboardField>
      <DashboardField label="Issued by">
        <input value={form.issuedBy ?? ""} onChange={(event) => set("issuedBy", event.target.value)} className={fieldClass} />
      </DashboardField>
      <DashboardField label="Issue date">
        <input type="date" value={form.issuedAt ?? ""} onChange={(event) => set("issuedAt", event.target.value)} className={fieldClass} />
      </DashboardField>
    </div>
  );
}

function DashboardSearchOverlay({
  query,
  setQuery,
  results,
  searching,
  onClose,
  onOpenResult,
}: {
  query: string;
  setQuery: (value: string) => void;
  results: DashboardSearchResult[];
  searching: boolean;
  onClose: () => void;
  onOpenResult: (result: DashboardSearchResult) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="fixed inset-y-0 right-0 z-50 bg-black/35 p-3 lg:left-[220px]"
      onMouseDown={onClose}
    >
      <motion.div
        initial={{ y: -18, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -18, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mt-20 flex max-h-[76dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[var(--border)] p-4">
          <PiMagnifyingGlass className="h-5 w-5 shrink-0 text-[var(--rubric-muted)]" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tests, students, classes, subjects, materials, certificates, transactions..."
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[var(--rubric-muted)]"
          />
          <button type="button" onClick={onClose} className="rounded-full p-2 text-[var(--rubric-muted)] hover:bg-[var(--surface-muted)]">
            <PiX className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-[280px] overflow-y-auto p-3">
          {query.trim().length < 2 ? (
            <div className="rounded-lg border border-dashed border-[var(--border)] bg-[#FAF8F3] p-8 text-center text-sm text-[var(--rubric-muted)]">
              Type at least two characters to sweep dashboard records.
            </div>
          ) : searching ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-lg bg-[#FAF8F3]" />
              ))}
            </div>
          ) : results.length ? (
            <div className="space-y-2">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  type="button"
                  onClick={() => onOpenResult(result)}
                  className="flex w-full items-center justify-between gap-4 rounded-lg border border-[var(--border)] bg-[#FAF8F3] p-4 text-left transition hover:border-[var(--rubric-black)]/30"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[var(--rubric-black)]">{result.title}</p>
                    <p className="mt-1 truncate text-sm text-[var(--rubric-slate)]">{result.subtitle}</p>
                  </div>
                  <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-bold uppercase text-[var(--rubric-muted)]">
                    {result.type}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--border)] bg-[#FAF8F3] p-8 text-center text-sm text-[var(--rubric-muted)]">
              No matching dashboard records found.
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
  
export function ProjectToolbar() {
  const pathname = usePathname();
  const isTestDetailRoute =
    pathname.startsWith("/dashboard/tests/") && pathname.split("/").length === 4;

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  if (!isTestDetailRoute) return null;

  return (
    <>
      <div className="px-4 pb-2 sm:px-6 lg:px-9">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button onClick={() => setIsAiModalOpen(true)} className="rubric-button-secondary h-11" aria-label="Use AI Assistant">
            <FlareIcon className="size-4" />
            Use AI
          </button>
        </div>
      </div>

      <AIContentModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentContent=""
      />
    </>
  );
}
