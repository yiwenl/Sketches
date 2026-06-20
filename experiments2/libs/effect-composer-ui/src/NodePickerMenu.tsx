import React, { useEffect, useRef, useState } from "react";

export interface CatalogEntry {
  group: string;
  label: string;
  onAdd: () => void;
}

interface NodePickerMenuProps {
  screenPos: { x: number; y: number };
  catalog: CatalogEntry[];
  onClose: () => void;
}

const MENU_WIDTH = 220;
const MENU_MAX_HEIGHT = 420;

export function NodePickerMenu({ screenPos, catalog, onClose }: NodePickerMenuProps) {
  const [query, setQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input when menu opens
  useEffect(() => {
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, []);

  // Dismiss on click outside
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Use capture so the click outside fires before React's synthetic events
    document.addEventListener("mousedown", handleMouseDown, true);
    return () => document.removeEventListener("mousedown", handleMouseDown, true);
  }, [onClose]);

  // Dismiss on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [onClose]);

  const lowerQuery = query.toLowerCase().trim();
  const filtered = lowerQuery
    ? catalog.filter((e) => e.label.toLowerCase().includes(lowerQuery))
    : catalog;

  // Build grouped structure only when not searching
  const groups: { name: string; entries: CatalogEntry[] }[] = [];
  if (!lowerQuery) {
    const seen = new Map<string, CatalogEntry[]>();
    for (const entry of filtered) {
      if (!seen.has(entry.group)) seen.set(entry.group, []);
      seen.get(entry.group)!.push(entry);
    }
    seen.forEach((entries, name) => groups.push({ name, entries }));
  }

  // Clamp position to viewport so menu doesn't overflow
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const left = Math.min(screenPos.x, vw - MENU_WIDTH - 8);
  const top = Math.min(screenPos.y, vh - MENU_MAX_HEIGHT - 8);

  const handleSelect = (entry: CatalogEntry) => {
    entry.onAdd();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        left,
        top,
        width: MENU_WIDTH,
        maxHeight: MENU_MAX_HEIGHT,
        background: "var(--color-surface-raised)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: 14,
        boxShadow: "var(--shadow-panel-glow), 0 8px 32px rgb(0 0 0 / 40%)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "DM Sans, system-ui, sans-serif",
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Search field */}
      <div
        style={{
          padding: "10px 10px 8px",
          borderBottom: "1px solid var(--color-border-subtle)",
        }}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search nodes…"
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: "var(--color-surface-base, #1b1d22)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: 8,
            color: "var(--color-text-primary)",
            fontSize: 13,
            fontFamily: "inherit",
            padding: "6px 10px",
            outline: "none",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = "var(--color-accent-cyan)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = "var(--color-border-subtle)")
          }
        />
      </div>

      {/* Item list */}
      <div style={{ overflowY: "auto", flex: 1, padding: "6px 0" }}>
        {lowerQuery ? (
          // Flat filtered list
          filtered.length === 0 ? (
            <div
              style={{
                padding: "10px 14px",
                fontSize: 13,
                color: "var(--color-text-muted)",
              }}
            >
              No results
            </div>
          ) : (
            filtered.map((entry) => (
              <MenuItem key={entry.label} entry={entry} onSelect={handleSelect} />
            ))
          )
        ) : (
          // Grouped list
          groups.map((group, gi) => (
            <React.Fragment key={group.name}>
              {gi > 0 && (
                <hr
                  style={{
                    margin: "4px 10px",
                    border: "none",
                    borderTop: "1px solid var(--color-border-subtle)",
                  }}
                />
              )}
              <div
                style={{
                  padding: "4px 14px 2px",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                }}
              >
                {group.name}
              </div>
              {group.entries.map((entry) => (
                <MenuItem key={entry.label} entry={entry} onSelect={handleSelect} />
              ))}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
}

function MenuItem({
  entry,
  onSelect,
}: {
  entry: CatalogEntry;
  onSelect: (entry: CatalogEntry) => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(entry)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(entry)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "0 14px",
        height: 40,
        display: "flex",
        alignItems: "center",
        fontSize: 14,
        fontWeight: 500,
        color: "var(--color-text-secondary)",
        background: hovered ? "var(--color-surface-hover)" : "transparent",
        cursor: "pointer",
        borderRadius: 8,
        margin: "1px 6px",
        transition: "background 80ms",
        userSelect: "none",
      }}
    >
      {entry.label}
    </div>
  );
}
