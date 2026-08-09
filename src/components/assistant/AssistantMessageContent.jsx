import React from "react";

/**
 * Renders assistant message text with **bold** keywords highlighted
 * in the theme's secondary color. Works across all palettes and
 * dark/light modes via CSS tokens.
 */
export default function AssistantMessageContent({ content }) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p className="whitespace-pre-wrap leading-relaxed">
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <span key={i} className="text-secondary font-semibold">
              {part.slice(2, -2)}
            </span>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </p>
  );
}