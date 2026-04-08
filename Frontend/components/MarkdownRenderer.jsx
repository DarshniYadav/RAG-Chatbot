"use client";

import { useState } from "react";

function splitMarkdown(text) {
  const parts = [];
  const regex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: "code", lang: match[1] || "text", value: match[2] || "" });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts;
}

export default function MarkdownRenderer({ content = "" }) {
  const [copied, setCopied] = useState(null);
  const blocks = splitMarkdown(content);

  return (
    <div style={{ lineHeight: 1.7, fontSize: 15, color: "var(--text)" }}>
      {blocks.map((block, idx) => {
        if (block.type === "text") {
          return block.value
            .split("\n\n")
            .filter(Boolean)
            .map((paragraph, pIdx) => (
              <p key={`t-${idx}-${pIdx}`} style={{ margin: "0 0 10px" }}>
                {paragraph}
              </p>
            ));
        }

        return (
          <div
            key={`c-${idx}`}
            style={{
              border: "1px solid #1d2d66",
              borderRadius: 10,
              overflow: "hidden",
              margin: "12px 0",
              background: "#070f27",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 10px",
                background: "#0b1737",
                color: "var(--muted)",
                fontSize: 12,
              }}
            >
              <span style={{ textTransform: "lowercase" }}>{block.lang}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(block.value);
                  setCopied(idx);
                  setTimeout(() => setCopied(null), 1200);
                }}
                style={{
                  background: "transparent",
                  border: "0",
                  color: "var(--muted)",
                  cursor: "pointer",
                }}
              >
                {copied === idx ? "Copied" : "Copy code"}
              </button>
            </div>
            <pre
              style={{
                margin: 0,
                padding: "12px 14px",
                color: "#d8e2ff",
                overflowX: "auto",
                fontFamily: "var(--font-mono), Consolas, monospace",
                fontSize: 13,
              }}
            >
              <code>{block.value}</code>
            </pre>
          </div>
        );
      })}
    </div>
  );
}