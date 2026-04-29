'use client';

import { Suspense } from 'react'
import { ResetPasswordForm } from "@/features/auth/presentation/components/ResetPasswordForm";

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
