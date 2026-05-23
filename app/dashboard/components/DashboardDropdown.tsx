"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef, useMemo, useState } from "react";
import { PiCaretDown, PiCaretRight, PiCheck, PiMagnifyingGlass } from "react-icons/pi";

function DashboardDropdown({ ...props }: ComponentPropsWithoutRef<typeof DropdownMenu.Root>) {
  return <DropdownMenu.Root {...props} />;
}

function DashboardDropdownTrigger({
  ...props
}: ComponentPropsWithoutRef<typeof DropdownMenu.Trigger>) {
  return <DropdownMenu.Trigger {...props} />;
}

const DashboardDropdownContent = forwardRef<
  ElementRef<typeof DropdownMenu.Content>,
  ComponentPropsWithoutRef<typeof DropdownMenu.Content> & { align?: "start" | "center" | "end" }
>(({ className = "", sideOffset = 8, align = "end", ...props }, ref) => (
  <DropdownMenu.Portal>
    <DropdownMenu.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={`z-50 min-w-[240px] overflow-hidden rounded-xl border border-[var(--border)]  bg-white p-1.5 text-[var(--rubric-black)] shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 ${className}`}
      {...props}

    />
  </DropdownMenu.Portal>
));
DashboardDropdownContent.displayName = "DashboardDropdownContent";

const DashboardDropdownItem = forwardRef<
  ElementRef<typeof DropdownMenu.Item>,
  ComponentPropsWithoutRef<typeof DropdownMenu.Item> & { inset?: boolean }
>(({ className = "", inset, ...props }, ref) => (
  <DropdownMenu.Item
    ref={ref}
    className={`relative flex cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors focus:bg-[#FAF8F3] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${
      inset ? "pl-8" : ""
    } ${className}`}
    {...props}
  />
));
DashboardDropdownItem.displayName = "DashboardDropdownItem";

const DashboardDropdownLabel = forwardRef<
  ElementRef<typeof DropdownMenu.Label>,
  ComponentPropsWithoutRef<typeof DropdownMenu.Label> & { inset?: boolean }
>(({ className = "", inset, ...props }, ref) => (
  <DropdownMenu.Label
    ref={ref}
    className={`px-3 py-2 text-xs font-bold uppercase text-[var(--rubric-muted)] ${
      inset ? "pl-8" : ""
    } ${className}`}
    {...props}
  />
));
DashboardDropdownLabel.displayName = "DashboardDropdownLabel";

const DashboardDropdownSeparator = forwardRef<
  ElementRef<typeof DropdownMenu.Separator>,
  ComponentPropsWithoutRef<typeof DropdownMenu.Separator>
>(({ className = "", ...props }, ref) => (
  <DropdownMenu.Separator ref={ref} className={`my-1 h-px bg-[var(--border)] ${className}`} {...props} />
));
DashboardDropdownSeparator.displayName = "DashboardDropdownSeparator";

const DashboardDropdownSub = DropdownMenu.Sub;

function DashboardDropdownSubTrigger({
  className = "",
  children,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownMenu.SubTrigger>) {
  return (
    <DropdownMenu.SubTrigger
      className={`flex cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2.5 text-sm outline-none focus:bg-[#FAF8F3] ${className}`}
      {...props}
    >
      {children}
      <PiCaretRight className="ml-auto h-4 w-4" />
    </DropdownMenu.SubTrigger>
  );
}

const DashboardDropdownSubContent = forwardRef<
  ElementRef<typeof DropdownMenu.SubContent>,
  ComponentPropsWithoutRef<typeof DropdownMenu.SubContent>
>(({ className = "", ...props }, ref) => (
  <DropdownMenu.Portal>
    <DropdownMenu.SubContent
      ref={ref}
      className={`z-50 min-w-[200px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] p-1.5 shadow-xl ${className}`}
      {...props}
    />
  </DropdownMenu.Portal>
));
DashboardDropdownSubContent.displayName = "DashboardDropdownSubContent";

const DashboardDropdownCheckboxItem = forwardRef<
  ElementRef<typeof DropdownMenu.CheckboxItem>,
  ComponentPropsWithoutRef<typeof DropdownMenu.CheckboxItem>
>(({ className = "", children, checked, ...props }, ref) => (
  <DropdownMenu.CheckboxItem
    ref={ref}
    checked={checked}
    className={`relative flex cursor-pointer select-none items-center rounded-lg py-2.5 pl-8 pr-3 text-sm outline-none focus:bg-[#FAF8F3] ${className}`}
    {...props}
  >
    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
      <DropdownMenu.ItemIndicator>
        <PiCheck className="h-4 w-4" />
      </DropdownMenu.ItemIndicator>
    </span>
    {children}
  </DropdownMenu.CheckboxItem>
));
DashboardDropdownCheckboxItem.displayName = "DashboardDropdownCheckboxItem";

type DashboardSelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

function DashboardSelect({
  value,
  options,
  onValueChange,
  placeholder = "Select",
  disabled,
  className = "",
  searchable = true,
  searchPlaceholder = "Search options...",
  maxMenuHeight = 260,
}: {
  value: string;
  options: DashboardSelectOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  maxMenuHeight?: number;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = options.find((option) => option.value === value);
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(normalizedQuery) ||
        option.value.toLowerCase().includes(normalizedQuery)
    );
  }, [options, query]);

  return (
    <DashboardDropdown
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setQuery("");
      }}
    >
      <DashboardDropdownTrigger asChild disabled={disabled}>
        <button
          type="button"
          disabled={disabled}
          className={`flex h-12 w-full items-center justify-between rounded-lg border border-[var(--border)] bg-white px-4 text-left text-sm text-[var(--rubric-black)] outline-none transition focus:border-[var(--rubric-black)] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        >
          <span className={selected ? "" : "text-[var(--rubric-muted)]"}>
            {selected?.label ?? placeholder}
          </span>
          <PiCaretDown className="h-4 w-4 text-[var(--rubric-muted)]" />
        </button>
      </DashboardDropdownTrigger>
      <DashboardDropdownContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] p-0">
        {searchable && (
          <div className="border-b border-[var(--border)] p-2">
            <div className="relative">
              <PiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--rubric-muted)]" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => event.stopPropagation()}
                placeholder={searchPlaceholder}
                className="h-10 w-full rounded-lg border border-[var(--border)] bg-[#FAF8F3] pl-9 pr-3 text-sm outline-none placeholder:text-[var(--rubric-muted)] focus:border-[var(--rubric-black)]"
              />
            </div>
          </div>
        )}
        <div
          className="overflow-y-auto p-1.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ maxHeight: maxMenuHeight }}
        >
          {filteredOptions.length ? (
            filteredOptions.map((option) => (
              <DashboardDropdownItem
                key={option.value}
                disabled={option.disabled}
                onSelect={() => {
                  onValueChange(option.value);
                  setOpen(false);
                  setQuery("");
                }}
                className="justify-between"
              >
                <span className="truncate">{option.label}</span>
                {option.value === value && <PiCheck className="h-4 w-4 shrink-0" />}
              </DashboardDropdownItem>
            ))
          ) : (
            <div className="px-3 py-6 text-center text-sm text-[var(--rubric-muted)]">
              No options found.
            </div>
          )}
        </div>
      </DashboardDropdownContent>
    </DashboardDropdown>
  );
}

export {
  DashboardDropdown,
  DashboardDropdownTrigger,
  DashboardDropdownContent,
  DashboardDropdownItem,
  DashboardDropdownLabel,
  DashboardDropdownSeparator,
  DashboardDropdownSub,
  DashboardDropdownSubTrigger,
  DashboardDropdownSubContent,
  DashboardDropdownCheckboxItem,
  DashboardSelect,
};
