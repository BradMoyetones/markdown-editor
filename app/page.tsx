'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Eye, Pencil } from 'lucide-react';
import { MarkdownEditor } from '@/components/brad-ui/mardown-editor/markdown-editor';
import { MarkdownPreview } from '@/components/brad-ui/mardown-editor/markdown-preview';
import { EditorToolbar } from '@/components/brad-ui/mardown-editor/editor-toolbar';
import { ModeToggle } from '@/components/mode-toggle';
import { cn } from '@/lib/utils';

const DEFAULT_MARKDOWN = `# Privacy Policy

Welcome to our **Privacy Policy** page. This document outlines how we collect, use, and protect your information.

## Data Collection

We collect the following types of data:

- **Personal Information**: Name, email address, phone number
- **Usage Data**: Pages visited, time spent, interactions
- **Device Information**: Browser type, operating system, IP address

## How We Use Your Data

1. To provide and maintain our service
2. To notify you about changes
3. To provide customer support
4. To gather analysis or valuable information

> Your privacy is important to us. We are committed to protecting your personal data.

## Contact Us

If you have questions, reach us at [support@example.com](mailto:support@example.com).

---

*Last updated: February 2026*
`;

type TabValue = 'editor' | 'preview';

interface HistoryState {
    past: string[];
    future: string[];
}

export default function PoliciesPage() {
    const [content, setContent] = useState(DEFAULT_MARKDOWN);
    const [activeTab, setActiveTab] = useState<TabValue>('editor');
    const [history, setHistory] = useState<HistoryState>({ past: [], future: [] });

    const handleContentChange = useCallback(
        (newContent: string) => {
            setHistory((prev) => ({
                past: [...prev.past.slice(-50), content],
                future: [],
            }));
            setContent(newContent);
        },
        [content]
    );

    const handleUndo = useCallback(() => {
        setHistory((prev) => {
            if (prev.past.length === 0) return prev;
            const previous = prev.past[prev.past.length - 1];
            setContent(previous);
            return {
                past: prev.past.slice(0, -1),
                future: [content, ...prev.future],
            };
        });
    }, [content]);

    const handleRedo = useCallback(() => {
        setHistory((prev) => {
            if (prev.future.length === 0) return prev;
            const next = prev.future[0];
            setContent(next);
            return {
                past: [...prev.past, content],
                future: prev.future.slice(1),
            };
        });
    }, [content]);

    const handleToolbarAction = useCallback(
        (prefix: string, suffix?: string, block?: boolean) => {
            const textarea = document.querySelector('textarea');
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selected = content.substring(start, end);

            let newContent: string;
            let newCursorPos: number;

            if (block) {
                const lineStart = content.lastIndexOf('\n', start - 1) + 1;
                newContent = content.substring(0, lineStart) + prefix + content.substring(lineStart);
                newCursorPos = start + prefix.length;
            } else {
                const wrapped = prefix + (selected || 'text') + (suffix || '');
                newContent = content.substring(0, start) + wrapped + content.substring(end);
                newCursorPos = selected ? start + wrapped.length : start + prefix.length;
            }

            handleContentChange(newContent);

            requestAnimationFrame(() => {
                textarea.focus();
                textarea.selectionStart = textarea.selectionEnd = newCursorPos;
            });
        },
        [content, handleContentChange]
    );

    const tabs: { value: TabValue; label: string; icon: React.ReactNode }[] = [
        { value: 'editor', label: 'Editor', icon: <Pencil className="size-3.5" /> },
        { value: 'preview', label: 'Preview', icon: <Eye className="size-3.5" /> },
    ];

    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const charCount = content.length;
    const lineCount = content.split('\n').length;

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Header */}
            <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-sm">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                            <FileText className="size-4 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-sm font-semibold text-foreground">Policies</h1>
                            <p className="text-xs text-muted-foreground">Markdown Editor</p>
                        </div>
                    </div>
                    <ModeToggle />
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-6">
                {/* Tab Bar */}
                <div className="flex items-center justify-between">
                    <div className="relative flex items-center gap-1 rounded-lg bg-muted p-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setActiveTab(tab.value)}
                                className={cn(
                                    'relative z-10 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                                    activeTab === tab.value
                                        ? 'text-foreground'
                                        : 'text-muted-foreground hover:text-foreground/80'
                                )}
                            >
                                {activeTab === tab.value && (
                                    <motion.div
                                        layoutId="active-tab"
                                        className="absolute inset-0 rounded-md bg-background shadow-sm"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-1.5">
                                    {tab.icon}
                                    {tab.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hidden items-center gap-3 text-xs text-muted-foreground sm:flex"
                    >
                        <span>{lineCount} lines</span>
                        <span className="text-border">|</span>
                        <span>{wordCount} words</span>
                        <span className="text-border">|</span>
                        <span>{charCount} chars</span>
                    </motion.div>
                </div>

                {/* Toolbar - only visible in editor mode */}
                <AnimatePresence mode="wait">
                    {activeTab === 'editor' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                        >
                            <EditorToolbar
                                onAction={handleToolbarAction}
                                onUndo={handleUndo}
                                onRedo={handleRedo}
                                canUndo={history.past.length > 0}
                                canRedo={history.future.length > 0}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Editor / Preview Panels */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="flex-1"
                    >
                        {activeTab === 'editor' ? (
                            <MarkdownEditor value={content} onChange={handleContentChange} />
                        ) : (
                            <MarkdownPreview content={content} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
