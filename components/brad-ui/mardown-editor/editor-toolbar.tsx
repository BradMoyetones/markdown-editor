'use client';

import {
    Bold,
    Italic,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Link,
    Image,
    Minus,
    Undo2,
    Redo2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ToolbarAction {
    icon: React.ReactNode;
    label: string;
    prefix: string;
    suffix?: string;
    block?: boolean;
}

interface EditorToolbarProps {
    onAction: (prefix: string, suffix?: string, block?: boolean) => void;
    onUndo?: () => void;
    onRedo?: () => void;
    canUndo?: boolean;
    canRedo?: boolean;
}

const toolbarGroups: ToolbarAction[][] = [
    [
        { icon: <Heading1 className="size-4" />, label: 'Heading 1', prefix: '# ', block: true },
        { icon: <Heading2 className="size-4" />, label: 'Heading 2', prefix: '## ', block: true },
        { icon: <Heading3 className="size-4" />, label: 'Heading 3', prefix: '### ', block: true },
    ],
    [
        { icon: <Bold className="size-4" />, label: 'Bold', prefix: '**', suffix: '**' },
        { icon: <Italic className="size-4" />, label: 'Italic', prefix: '*', suffix: '*' },
        { icon: <Code className="size-4" />, label: 'Inline Code', prefix: '`', suffix: '`' },
    ],
    [
        { icon: <List className="size-4" />, label: 'Bullet List', prefix: '- ', block: true },
        { icon: <ListOrdered className="size-4" />, label: 'Numbered List', prefix: '1. ', block: true },
        { icon: <Quote className="size-4" />, label: 'Blockquote', prefix: '> ', block: true },
        { icon: <Minus className="size-4" />, label: 'Horizontal Rule', prefix: '\n---\n', block: true },
    ],
    [
        { icon: <Link className="size-4" />, label: 'Link', prefix: '[', suffix: '](url)' },
        { icon: <Image className="size-4" />, label: 'Image', prefix: '![', suffix: '](url)' },
    ],
];

export function EditorToolbar({ onAction, onUndo, onRedo, canUndo, canRedo }: EditorToolbarProps) {
    return (
        <TooltipProvider delayDuration={300}>
            <div className="flex flex-wrap items-center gap-0.5 rounded-lg border border-border bg-muted/50 px-2 py-1.5">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7" onClick={onUndo} disabled={!canUndo}>
                            <Undo2 className="size-3.5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>Undo</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7" onClick={onRedo} disabled={!canRedo}>
                            <Redo2 className="size-3.5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>Redo</p>
                    </TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" className="mx-1 h-5" />

                {toolbarGroups.map((group, gi) => (
                    <div key={gi} className="flex items-center gap-0.5">
                        {gi > 0 && <Separator orientation="vertical" className="mx-1 h-5" />}
                        {group.map((action) => (
                            <Tooltip key={action.label}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7"
                                        onClick={() => onAction(action.prefix, action.suffix, action.block)}
                                    >
                                        {action.icon}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p>{action.label}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                ))}
            </div>
        </TooltipProvider>
    );
}
