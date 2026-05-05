'use client';

import { ResetPasswordForm } from "@/features/auth/presentation/components/ResetPasswordForm";
import { PublicOnlyRoute } from "@/features/auth/presentation/components/PublicOnlyRoute";

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
