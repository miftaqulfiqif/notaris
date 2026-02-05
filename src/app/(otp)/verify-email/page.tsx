'use client';

import { EmailVerificationForm } from "@/features/auth/presentation/components/EmailVerificationForm";
import { UnverifiedOnlyRoute } from "@/features/auth/presentation/components/UnverifiedOnlyRoute";

export default function VerifyEmailPage() {
    return (
        <UnverifiedOnlyRoute>
            <div className="w-full max-w-md">
                <EmailVerificationForm />
            </div>
        </UnverifiedOnlyRoute>
    );
}
