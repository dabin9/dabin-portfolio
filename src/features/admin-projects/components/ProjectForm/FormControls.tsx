import type { ReactNode } from "react";

export function DetailSectionLabel({ title }: { title: string }) {
  return (
    <div className="md:col-span-3">
      <p className="font-mono text-[12px] uppercase text-muted">{title}</p>
    </div>
  );
}

export function EditableMetaItem({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <dt className="font-mono text-[11px] uppercase text-muted">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

export function RoleInputRow({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-line pt-3">
      <p className="mb-2 font-mono text-[11px] uppercase text-muted">{label}</p>
      {children}
    </div>
  );
}

export function InlineInput(props: {
  ariaLabel: string;
  name: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      aria-label={props.ariaLabel}
      type="text"
      name={props.name}
      value={props.value}
      defaultValue={props.value === undefined ? props.defaultValue ?? "" : undefined}
      onChange={(event) => props.onValueChange?.(event.target.value)}
      placeholder={props.placeholder}
      className="w-full bg-transparent border-0 border-b border-line px-0 py-1.5 text-[14px] leading-6 text-ink focus:outline-none focus:border-ink"
    />
  );
}

export function Field(props: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-[12px] text-muted">{props.label}</span>
      <input
        type={props.type ?? "text"}
        name={props.name}
        defaultValue={props.defaultValue ?? ""}
        required={props.required}
        placeholder={props.placeholder}
        maxLength={props.maxLength}
        className="mt-1.5 w-full bg-surface border border-line rounded-md px-3 py-2 text-[14px] focus:outline-none focus:border-ink"
      />
    </label>
  );
}

export function Textarea(props: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[12px] text-muted">{props.label}</span>
      <textarea
        name={props.name}
        defaultValue={props.defaultValue ?? ""}
        rows={props.rows ?? 3}
        placeholder={props.placeholder}
        className="mt-1.5 w-full bg-surface border border-line rounded-md px-3 py-2 text-[14px] leading-[1.7] focus:outline-none focus:border-ink resize-y"
      />
    </label>
  );
}

export function Checkbox(props: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-[13px] cursor-pointer">
      <input
        type="checkbox"
        name={props.name}
        defaultChecked={!!props.defaultChecked}
        className="w-4 h-4 accent-ink"
      />
      {props.label}
    </label>
  );
}
