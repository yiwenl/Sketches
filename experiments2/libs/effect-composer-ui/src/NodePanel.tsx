import React, { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import CloseIcon from "@mui/icons-material/Close";
import { CatalogEntry } from "./NodePickerMenu";

interface NodePanelProps {
  catalog: CatalogEntry[];
  onExport?: () => void;
  onImport?: () => void;
  onClose?: () => void;
}

export function NodePanel({ catalog, onExport, onImport, onClose }: NodePanelProps) {
  // Build grouped structure from catalog
  const groups = new Map<string, CatalogEntry[]>();
  for (const entry of catalog) {
    if (!groups.has(entry.group)) groups.set(entry.group, []);
    groups.get(entry.group)!.push(entry);
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        width: 220,
        zIndex: 10,
        background: "var(--color-surface-raised)",
        borderRight: "1px solid var(--color-border-subtle)",
        boxShadow: "4px 0 20px rgb(0 0 0 / 30%)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "DM Sans, system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px 12px",
          borderBottom: "1px solid var(--color-border-subtle)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
          }}
        >
          Node Library
        </span>
      </div>

      {/* Scrollable content */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        {Array.from(groups.entries()).map(([groupName, entries]) => (
          <CategorySection key={groupName} title={groupName}>
            {entries.map((entry) => (
              <NodeRow key={entry.label} entry={entry} />
            ))}
          </CategorySection>
        ))}

        {/* System section */}
        {(onExport || onImport || onClose) && (
          <CategorySection title="System" defaultOpen={false}>
            {onExport && (
              <ActionRow
                label="Export"
                icon={<DownloadIcon style={{ fontSize: 14 }} />}
                onClick={onExport}
              />
            )}
            {onImport && (
              <ActionRow
                label="Import"
                icon={<UploadIcon style={{ fontSize: 14 }} />}
                onClick={onImport}
              />
            )}
            {onClose && (
              <ActionRow
                label="Close"
                icon={<CloseIcon style={{ fontSize: 14 }} />}
                onClick={onClose}
                danger
              />
            )}
          </CategorySection>
        )}
      </div>
    </div>
  );
}

// ── Category section ──────────────────────────────────────────────────────────

interface CategorySectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CategorySection({ title, defaultOpen = true, children }: CategorySectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 14px 8px 16px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "var(--color-text-muted)",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </span>
        <ExpandMoreIcon
          style={{
            fontSize: 16,
            transition: "transform 160ms ease",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
          }}
        />
      </button>

      {open && <div style={{ paddingBottom: 4 }}>{children}</div>}
    </div>
  );
}

// ── Node row (catalog entry) ──────────────────────────────────────────────────

function NodeRow({ entry }: { entry: CatalogEntry }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={entry.onAdd}
      onKeyDown={(e) => e.key === "Enter" && entry.onAdd()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: 36,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 14px 0 18px",
        cursor: "pointer",
        background: hovered ? "var(--color-surface-hover)" : "transparent",
        color: hovered ? "var(--color-text-primary)" : "var(--color-text-secondary)",
        fontSize: 13,
        fontWeight: 500,
        userSelect: "none",
        transition: "background 80ms, color 80ms",
      }}
    >
      <AddIcon style={{ fontSize: 13, opacity: 0.5, flexShrink: 0 }} />
      {entry.label}
    </div>
  );
}

// ── Action row (export / import / close) ─────────────────────────────────────

function ActionRow({
  label,
  icon,
  onClick,
  danger = false,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: 36,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 14px 0 18px",
        cursor: "pointer",
        background: hovered
          ? danger
            ? "rgba(255, 80, 80, 0.12)"
            : "var(--color-surface-hover)"
          : "transparent",
        color: danger
          ? hovered
            ? "#ff6b6b"
            : "var(--color-text-muted)"
          : hovered
          ? "var(--color-text-primary)"
          : "var(--color-text-secondary)",
        fontSize: 13,
        fontWeight: 500,
        userSelect: "none",
        transition: "background 80ms, color 80ms",
      }}
    >
      <span style={{ opacity: 0.6, display: "flex", alignItems: "center" }}>{icon}</span>
      {label}
    </div>
  );
}
