'use client';

import { cn } from '@/lib/utils';
import { Streamdown } from 'streamdown';

interface MarkdownPreviewProps {
    content: string;
    className?: string;
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
    if (!content.trim()) {
        return (
            <div
                className={cn(
                    'flex min-h-[500px] items-center justify-center rounded-lg border border-border bg-card p-8 text-muted-foreground',
                    className
                )}
            >
                <div className="text-center">
                    <p className="text-sm">Nothing to preview yet</p>
                    <p className="mt-1 text-xs text-muted-foreground/60">Switch to the editor tab and start writing</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('min-h-[500px] overflow-auto rounded-lg border border-border bg-card p-6', className)}>
            <Streamdown>{content}</Streamdown>
        </div>
    );
}
