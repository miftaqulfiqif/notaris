'use client';

import { ResetPasswordForm } from "@/features/auth/presentation/components/ResetPasswordForm";
import { PublicOnlyRoute } from "@/features/auth/presentation/components/PublicOnlyRoute";

export default function ResetPasswordPage() {
    return (
        <div className="w-full max-w-md">
            <ResetPasswordForm />
        </div>
    );
}
