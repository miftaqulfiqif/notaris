'use client';

import { Suspense } from 'react'
import { ResetPasswordForm } from "@/features/auth/presentation/components/ResetPasswordForm";

import { Suspense } from 'react';

export default function ResetPasswordPage() {
    return (
        <div className="w-full max-w-md">
            <Suspense fallback={<div>Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
