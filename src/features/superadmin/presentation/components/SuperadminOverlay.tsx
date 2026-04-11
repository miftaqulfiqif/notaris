'use client';

import { useEffect, useId, type ButtonHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { ChevronDown, X } from 'lucide-react';

export type SuperadminSelectOption = {
    label: string;
    value: string;
};

type SuperadminModalProps = {
    children: ReactNode;
    maxWidthClassName?: string;
    onClose: () => void;
    title: string;
};

type SuperadminTextInputProps = {
    ariaLabel?: string;
    label: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    value: string;
};

type SuperadminSelectFieldProps = {
    ariaLabel?: string;
    label: string;
    onChange: (value: string) => void;
    options: SuperadminSelectOption[];
    value: string;
};

type SuperadminTextareaProps = {
    ariaLabel?: string;
    label: string;
    onChange: (value: string) => void;
    rows?: number;
    value: string;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'aria-label' | 'onChange' | 'rows' | 'value'>;

type SuperadminActionButtonProps = {
    children: ReactNode;
    variant?: 'primary' | 'secondary';
} & ButtonHTMLAttributes<HTMLButtonElement>;

function fieldClassName() {
    return 'h-10 w-full rounded-[8px] border border-[#212121] bg-[#0F1012] px-3 text-[14px] text-white outline-none transition-colors placeholder:text-[#6F6F6F] hover:border-[#3B414D] focus:border-[#C99D4B]';
}

export function SuperadminFieldLabel({ children }: Readonly<{ children: string }>) {
    return <span className="text-[12px] text-[#636363]">{children}</span>;
}

export function SuperadminModal({
    children,
    maxWidthClassName = 'max-w-[560px]',
    onClose,
    title,
}: Readonly<SuperadminModalProps>) {
    const titleId = useId();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/60 px-4 py-4 backdrop-blur-sm sm:items-center sm:py-6"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                onClick={(event) => event.stopPropagation()}
                className={`max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-[16px] border border-[#2A2A2A] bg-[#16181C] shadow-[0_24px_80px_rgba(0,0,0,0.4)] ${maxWidthClassName}`}
            >
                <div className="flex items-center gap-3 border-b border-[#4B4B4B] px-5 py-5">
                    <h2 id={titleId} className="flex-1 text-[24px] font-medium leading-none text-white">
                        {title}
                    </h2>
                    <button
                        type="button"
                        aria-label="Tutup modal"
                        onClick={onClose}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#C7CBD6] transition-colors hover:bg-[#202328] hover:text-white"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

export function SuperadminTextInput({
    ariaLabel,
    label,
    onChange,
    placeholder,
    type = 'text',
    value,
}: Readonly<SuperadminTextInputProps>) {
    const inputId = useId();

    return (
        <label htmlFor={inputId} className="block space-y-1.5">
            <SuperadminFieldLabel>{label}</SuperadminFieldLabel>
            <input
                id={inputId}
                type={type}
                aria-label={ariaLabel ?? label}
                value={value}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
                className={fieldClassName()}
            />
        </label>
    );
}

export function SuperadminSelectField({
    ariaLabel,
    label,
    onChange,
    options,
    value,
}: Readonly<SuperadminSelectFieldProps>) {
    const selectId = useId();

    return (
        <label htmlFor={selectId} className="block space-y-1.5">
            <SuperadminFieldLabel>{label}</SuperadminFieldLabel>
            <div className="relative">
                <select
                    id={selectId}
                    aria-label={ariaLabel ?? label}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className={`${fieldClassName()} appearance-none pr-9 text-[#6F6F6F]`}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6F6F6F]" />
            </div>
        </label>
    );
}

export function SuperadminTextarea({
    ariaLabel,
    label,
    onChange,
    rows = 4,
    value,
    ...props
}: Readonly<SuperadminTextareaProps>) {
    const textareaId = useId();

    return (
        <label htmlFor={textareaId} className="block space-y-1.5">
            <SuperadminFieldLabel>{label}</SuperadminFieldLabel>
            <textarea
                id={textareaId}
                rows={rows}
                aria-label={ariaLabel ?? label}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-[8px] border border-[#212121] bg-[#0F1012] px-3 py-2 text-[14px] leading-5 text-white outline-none transition-colors placeholder:text-[#6F6F6F] hover:border-[#3B414D] focus:border-[#C99D4B]"
                {...props}
            />
        </label>
    );
}

export function SuperadminActionButton({
    children,
    className = '',
    type = 'button',
    variant = 'secondary',
    ...props
}: Readonly<SuperadminActionButtonProps>) {
    const variantClassName =
        variant === 'primary'
            ? 'bg-[#C9AA6F] text-[#25282D] hover:bg-[#D7B97F]'
            : 'border border-[#797F8F] bg-[#16181C] text-[#797F8F] hover:border-[#C99D4B] hover:text-[#C99D4B]';

    return (
        <button
            type={type}
            className={`inline-flex h-10 items-center justify-center rounded-[10px] px-4 text-[14px] transition-colors ${variantClassName} ${className}`.trim()}
            {...props}
        >
            {children}
        </button>
    );
}
