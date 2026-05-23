"use client";

import { PiFloppyDisk } from "react-icons/pi";
import { motion } from "framer-motion";
import {
  DashboardButton,
  DashboardSwitch,
  ResponsiveSheet,
} from "./primitives";
import { useSettingsModal } from "@/app/dashboard/hooks/useSettingsModal";

interface SettingsProps {
  testId: string;
  setShowSettingsModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const SettingSwitch = ({
  section,
  keyName,
  value,
  onChange,
}: {
  section: "general" | "security";
  keyName: string;
  value: boolean;
  onChange: (
    section: "general" | "security",
    key: string,
    value: boolean
  ) => void;
}) => {
  return (
    <DashboardSwitch checked={value} onChange={(checked) => onChange(section, keyName, checked)} />
  );
};

const SettingsModal = ({ testId, setShowSettingsModal }: SettingsProps) => {
  const close = () => setShowSettingsModal(false);
  const { settings, saving, loading, updateSetting, handleSubmit } = useSettingsModal({
    testId,
    onClose: close,
  });

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      >
        <motion.div
          initial={{ y: 16, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 12, opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-64 w-full max-w-md items-center justify-center rounded-2xl bg-white"
        >
          <span className="loading loading-bars loading-xl" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <ResponsiveSheet
      title="Test Settings"
      onClose={close}
      className="md:max-w-[420px]"
      footer={
        <DashboardButton type="submit" form="settings-form" disabled={saving} className="w-full">
          {saving ? (
            "Saving..."
          ) : (
            <>
              <PiFloppyDisk className="h-4 w-4" />
              Save Settings
            </>
          )}
        </DashboardButton>
      }
    >
      <form onSubmit={handleSubmit} id="settings-form" className="space-y-5">
        <SettingsSection
          title="General Settings"
          entries={settings.general}
          section="general"
          onChange={updateSetting}
        />
        <SettingsSection
          title="Security Settings"
          entries={settings.security}
          section="security"
          onChange={updateSetting}
        />
      </form>
    </ResponsiveSheet>
  );
};

export default SettingsModal;

function SettingsSection({
  title,
  entries,
  section,
  onChange,
}: {
  title: string;
  entries: Record<string, boolean>;
  section: "general" | "security";
  onChange: (section: "general" | "security", key: string, value: boolean) => void;
}) {
  const labels: Record<string, string> = {
    shuffleQuestions: "Shuffle questions",
    shuffleOptions: "Shuffle options",
    enableTabSwitching: "Enable tab switching",
    disableCopyPaste: "Disable copy paste",
  };

  return (
    <section className="space-y-3">
      <h3 className="text-[15px] font-semibold text-[var(--rubric-black)]">{title}</h3>
      {Object.entries(entries).map(([key, value]) => (
        <div key={key} className="flex h-[42px] items-center justify-between">
          <span className="text-sm font-medium text-[var(--rubric-black)]">
            {labels[key] ?? key.replace(/([A-Z])/g, " $1")}
          </span>
          <SettingSwitch section={section} keyName={key} value={value} onChange={onChange} />
        </div>
      ))}
    </section>
  );
}
