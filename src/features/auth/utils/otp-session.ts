const OTP_SESSION_KEY_PREFIX = 'notarix:email-verification-otp:';

export interface StoredOtpSession {
    email: string;
    otpExpiresAt: number;
    resendAvailableAt: number;
}

const isBrowser = () => typeof window !== 'undefined';

export const getOtpSessionKey = (email: string) => `${OTP_SESSION_KEY_PREFIX}${email}`;

export const getStoredOtpSession = (email: string): StoredOtpSession | null => {
    if (!isBrowser()) return null;

    const rawSession = window.localStorage.getItem(getOtpSessionKey(email));
    if (!rawSession) return null;

    try {
        const session = JSON.parse(rawSession) as Partial<StoredOtpSession>;
        if (
            session.email !== email ||
            typeof session.otpExpiresAt !== 'number' ||
            typeof session.resendAvailableAt !== 'number'
        ) {
            return null;
        }

        return session as StoredOtpSession;
    } catch {
        return null;
    }
};

export const storeOtpSession = (session: StoredOtpSession) => {
    if (!isBrowser()) return;

    window.localStorage.setItem(getOtpSessionKey(session.email), JSON.stringify(session));
};

export const removeStoredOtpSession = (email: string) => {
    if (!isBrowser()) return;

    window.localStorage.removeItem(getOtpSessionKey(email));
};

export const clearStoredOtpSessions = () => {
    if (!isBrowser()) return;

    Object.keys(window.localStorage)
        .filter((key) => key.startsWith(OTP_SESSION_KEY_PREFIX))
        .forEach((key) => window.localStorage.removeItem(key));
};
