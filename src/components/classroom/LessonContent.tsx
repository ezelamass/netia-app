import { Fragment } from 'react';

interface LessonContentProps {
  content: string;
}

/**
 * Renders lesson text with basic formatting support:
 * - Paragraphs (separated by blank lines)
 * - Unordered lists (lines starting with "- ")
 * - Ordered lists (lines starting with "1. ", "2. ", etc.)
 * - Bold text (**bold**)
 * - Headings (lines ending with ":")
 */
export function LessonContent({ content }: LessonContentProps) {
  // Split into blocks separated by double newlines
  const blocks = content.split(/\n\n+/).filter(b => b.trim());

  return (
    <div className="space-y-4">
      {blocks.map((block, blockIdx) => {
        const lines = block.split('\n').filter(l => l.trim());

        // Check if this block is a list
        const isUnorderedList = lines.every(l => l.trim().startsWith('- '));
        const isOrderedList = lines.every(l => /^\d+[\.\)]\s/.test(l.trim()));

        if (isUnorderedList) {
          return (
            <ul key={blockIdx} className="space-y-1.5 pl-1">
              {lines.map((line, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/85 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                  <span>{renderInline(line.replace(/^-\s*/, ''))}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (isOrderedList) {
          return (
            <ol key={blockIdx} className="space-y-1.5 pl-1">
              {lines.map((line, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/85 leading-relaxed">
                  <span className="mt-0.5 flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span>{renderInline(line.replace(/^\d+[\.\)]\s*/, ''))}</span>
                </li>
              ))}
            </ol>
          );
        }

        // Mixed block: some lines might be list items, others paragraph text
        // Check if it's a heading-like line (short line ending with ":")
        if (lines.length === 1 && lines[0].trim().endsWith(':') && lines[0].length < 80) {
          return (
            <h3 key={blockIdx} className="text-sm font-semibold text-foreground mt-2">
              {renderInline(lines[0])}
            </h3>
          );
        }

        // Check for mixed content: some list items + some paragraphs
        const hasListItems = lines.some(l => l.trim().startsWith('- ') || /^\d+[\.\)]\s/.test(l.trim()));
        if (hasListItems) {
          return (
            <div key={blockIdx} className="space-y-1.5">
              {lines.map((line, i) => {
                const trimmed = line.trim();
                if (trimmed.startsWith('- ')) {
                  return (
                    <div key={i} className="flex items-start gap-2 text-sm text-foreground/85 leading-relaxed pl-1">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                      <span>{renderInline(trimmed.replace(/^-\s*/, ''))}</span>
                    </div>
                  );
                }
                if (/^\d+[\.\)]\s/.test(trimmed)) {
                  const num = trimmed.match(/^(\d+)/)?.[1] || '1';
                  return (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-foreground/85 leading-relaxed pl-1">
                      <span className="mt-0.5 flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                        {num}
                      </span>
                      <span>{renderInline(trimmed.replace(/^\d+[\.\)]\s*/, ''))}</span>
                    </div>
                  );
                }
                // Heading-like line (ends with ":")
                if (trimmed.endsWith(':') && trimmed.length < 80) {
                  return (
                    <h4 key={i} className="text-sm font-semibold text-foreground mt-1">
                      {renderInline(trimmed)}
                    </h4>
                  );
                }
                return (
                  <p key={i} className="text-sm text-foreground/85 leading-relaxed">
                    {renderInline(trimmed)}
                  </p>
                );
              })}
            </div>
          );
        }

        // Plain paragraph
        return (
          <p key={blockIdx} className="text-sm text-foreground/85 leading-relaxed">
            {renderInline(lines.join(' '))}
          </p>
        );
      })}
    </div>
  );
}

/** Renders inline formatting: **bold** */
function renderInline(text: string): React.ReactNode {
  // Split by **bold** markers
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
