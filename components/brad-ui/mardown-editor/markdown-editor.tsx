'use client';

import React, { useRef, useCallback, useLayoutEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

function highlightMarkdown(text: string): string {
    const lines = text.split('\n');
    const highlighted: string[] = [];
    let inCodeBlock = false;

    for (const line of lines) {
        if (line.startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            highlighted.push(`<span class="md-code-block">${escapeHtml(line)}</span>`);
            continue;
        }

        if (inCodeBlock) {
            highlighted.push(`<span class="md-code-block">${escapeHtml(line)}</span>`);
            continue;
        }

        highlighted.push(highlightLine(line));
    }

    return highlighted.join('\n');
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function highlightLine(line: string): string {
    // Headings
    const headingMatch = line.match(/^(#{1,6})\s(.*)/);
    if (headingMatch) {
        return `<span class="md-hash">${escapeHtml(headingMatch[1])}</span> <span class="md-heading">${escapeHtml(headingMatch[2])}</span>`;
    }

    // Blockquotes
    if (line.startsWith('>')) {
        return `<span class="md-blockquote">${escapeHtml(line)}</span>`;
    }

    // HR
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
        return `<span class="md-hr">${escapeHtml(line)}</span>`;
    }

    // List items
    const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s/);
    if (listMatch) {
        const indent = escapeHtml(listMatch[1]);
        const marker = escapeHtml(listMatch[2]);
        const rest = line.slice(listMatch[0].length);
        return `${indent}<span class="md-list-marker">${marker}</span> ${highlightInline(rest)}`;
    }

    return highlightInline(line);
}

function highlightInline(text: string): string {
    let result = '';
    let i = 0;

    while (i < text.length) {
        // Images ![alt](url)
        if (text[i] === '!' && text[i + 1] === '[') {
            const closeBracket = text.indexOf(']', i + 2);
            if (closeBracket !== -1 && text[closeBracket + 1] === '(') {
                const closeParen = text.indexOf(')', closeBracket + 2);
                if (closeParen !== -1) {
                    result += `<span class="md-image">${escapeHtml(text.slice(i, closeParen + 1))}</span>`;
                    i = closeParen + 1;
                    continue;
                }
            }
        }

        // Links [text](url)
        if (text[i] === '[') {
            const closeBracket = text.indexOf(']', i + 1);
            if (closeBracket !== -1 && text[closeBracket + 1] === '(') {
                const closeParen = text.indexOf(')', closeBracket + 2);
                if (closeParen !== -1) {
                    result += `<span class="md-link">${escapeHtml(text.slice(i, closeParen + 1))}</span>`;
                    i = closeParen + 1;
                    continue;
                }
            }
        }

        // Inline code
        if (text[i] === '`') {
            const end = text.indexOf('`', i + 1);
            if (end !== -1) {
                result += `<span class="md-code">${escapeHtml(text.slice(i, end + 1))}</span>`;
                i = end + 1;
                continue;
            }
        }

        // Bold **text** or __text__
        if ((text[i] === '*' && text[i + 1] === '*') || (text[i] === '_' && text[i + 1] === '_')) {
            const delim = text.slice(i, i + 2);
            const end = text.indexOf(delim, i + 2);
            if (end !== -1) {
                result += `<span class="md-bold">${escapeHtml(text.slice(i, end + 2))}</span>`;
                i = end + 2;
                continue;
            }
        }

        // Italic *text* or _text_
        if (text[i] === '*' || text[i] === '_') {
            const delim = text[i];
            const end = text.indexOf(delim, i + 1);
            if (end !== -1 && end > i + 1) {
                result += `<span class="md-italic">${escapeHtml(text.slice(i, end + 1))}</span>`;
                i = end + 1;
                continue;
            }
        }

        result += escapeHtml(text[i]);
        i++;
    }

    return result;
}

export function MarkdownEditor({ value, onChange, className }: MarkdownEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLPreElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    const syncScroll = useCallback(() => {
        if (textareaRef.current && highlightRef.current) {
            highlightRef.current.scrollTop = textareaRef.current.scrollTop;
            highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    }, []);

    useLayoutEffect(() => {
        syncScroll();
    }, [value, syncScroll]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const target = e.currentTarget;
                const start = target.selectionStart;
                const end = target.selectionEnd;
                const newValue = value.substring(0, start) + '  ' + value.substring(end);
                onChange(newValue);
                requestAnimationFrame(() => {
                    target.selectionStart = target.selectionEnd = start + 2;
                });
            }
        },
        [value, onChange]
    );

    return (
        <div
            ref={containerRef}
            className={cn(
                'relative overflow-hidden rounded-lg border border-border bg-card transition-colors',
                isFocused && 'ring-2 ring-ring/30 border-ring/50',
                className
            )}
        >
            <pre
                ref={highlightRef}
                className="md-editor pointer-events-none absolute inset-0 overflow-auto p-4 text-sm text-foreground whitespace-pre-wrap wrap-break-word"
                aria-hidden="true"
                dangerouslySetInnerHTML={{
                    __html: highlightMarkdown(value) + '\n',
                }}
            />
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onScroll={syncScroll}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="md-editor relative z-10 size-full min-h-[500px] resize-none bg-transparent p-4 text-sm text-transparent caret-foreground outline-none whitespace-pre-wrap wrap-break-word"
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                placeholder="Start writing your markdown here..."
            />
        </div>
    );
}
