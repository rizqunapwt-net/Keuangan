import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Typography, message } from 'antd';
import { LockOutlined, SafetyOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const PIN_LENGTH = 6;
const SESSION_KEY = 'finance_pin_session';
const PIN_KEY = 'finance_security_pin';
const SESSION_DURATION_KEY = 'finance_pin_duration';
const DEFAULT_SESSION_MINUTES = 15;

/** Check if a valid PIN session exists */
export const hasValidPinSession = (): boolean => {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return false;
        const session = JSON.parse(raw);
        return session.expiresAt > Date.now();
    } catch {
        return false;
    }
};

/** Create a new PIN session */
const createPinSession = () => {
    const durationMinutes = Number(localStorage.getItem(SESSION_DURATION_KEY)) || DEFAULT_SESSION_MINUTES;
    const session = {
        verified: true,
        createdAt: Date.now(),
        expiresAt: Date.now() + durationMinutes * 60 * 1000,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

/** Clear PIN session (for logout or manual lock) */
export const clearPinSession = () => {
    localStorage.removeItem(SESSION_KEY);
};

/** Check if a PIN has been set */
export const isPinConfigured = (): boolean => {
    return !!localStorage.getItem(PIN_KEY);
};

/** Set or update the PIN */
export const setSecurityPin = (pin: string) => {
    // Simple hash for localStorage (not cryptographically secure, but adequate for client-side UX guard)
    const hash = btoa(pin.split('').reverse().join('') + ':rizquna');
    localStorage.setItem(PIN_KEY, hash);
};

/** Verify PIN against stored hash */
const verifyPin = (pin: string): boolean => {
    const stored = localStorage.getItem(PIN_KEY);
    if (!stored) return true; // No PIN set = always pass
    const hash = btoa(pin.split('').reverse().join('') + ':rizquna');
    return hash === stored;
};

interface FinancePinGuardProps {
    children: React.ReactNode;
}

const FinancePinGuard: React.FC<FinancePinGuardProps> = ({ children }) => {
    const [verified, setVerified] = useState(() => hasValidPinSession());
    const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(''));
    const [error, setError] = useState(false);
    const [shake, setShake] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [locked, setLocked] = useState(false);
    const [lockTimer, setLockTimer] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // If no PIN configured, skip guard entirely
    if (!isPinConfigured()) {
        return <>{children}</>;
    }

    // Check session expiry periodically
    useEffect(() => {
        if (!verified) return;
        const interval = setInterval(() => {
            if (!hasValidPinSession()) {
                setVerified(false);
                setPin(Array(PIN_LENGTH).fill(''));
            }
        }, 10_000); // Check every 10 seconds
        return () => clearInterval(interval);
    }, [verified]);

    // Lock timer countdown
    useEffect(() => {
        if (!locked) return;
        const interval = setInterval(() => {
            setLockTimer(prev => {
                if (prev <= 1) {
                    setLocked(false);
                    setAttempts(0);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [locked]);

    // Auto-focus first input on mount
    useEffect(() => {
        if (!verified && !locked) {
            setTimeout(() => inputRefs.current[0]?.focus(), 300);
        }
    }, [verified, locked]);

    const handleSubmit = useCallback((currentPin: string[]) => {
        const pinStr = currentPin.join('');
        if (pinStr.length !== PIN_LENGTH) return;

        if (verifyPin(pinStr)) {
            createPinSession();
            setVerified(true);
            setError(false);
            setAttempts(0);
            message.success({ content: 'Akses keuangan terbuka', icon: <SafetyOutlined /> });
        } else {
            setError(true);
            setShake(true);
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            if (newAttempts >= 5) {
                setLocked(true);
                setLockTimer(60); // Lock for 60 seconds after 5 failed attempts
                message.error('Terlalu banyak percobaan. Coba lagi dalam 60 detik.');
            } else {
                message.error(`PIN salah. Sisa percobaan: ${5 - newAttempts}`);
            }

            setTimeout(() => {
                setShake(false);
                setPin(Array(PIN_LENGTH).fill(''));
                setError(false);
                inputRefs.current[0]?.focus();
            }, 600);
        }
    }, [attempts]);

    const handleChange = (index: number, value: string) => {
        if (locked) return;
        // Only allow digits
        const digit = value.replace(/\D/g, '').slice(-1);
        const newPin = [...pin];
        newPin[index] = digit;
        setPin(newPin);
        setError(false);

        if (digit && index < PIN_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all digits filled
        if (digit && index === PIN_LENGTH - 1) {
            handleSubmit(newPin);
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
            const newPin = [...pin];
            newPin[index - 1] = '';
            setPin(newPin);
        }
        if (e.key === 'Enter') {
            handleSubmit(pin);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, PIN_LENGTH);
        if (!pasted) return;
        const newPin = Array(PIN_LENGTH).fill('');
        pasted.split('').forEach((d, i) => { newPin[i] = d; });
        setPin(newPin);
        if (pasted.length === PIN_LENGTH) {
            handleSubmit(newPin);
        } else {
            inputRefs.current[pasted.length]?.focus();
        }
    };

    if (verified) {
        return <>{children}</>;
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 120px)',
            padding: 40,
        }}>
            <div style={{
                textAlign: 'center',
                maxWidth: 420,
                width: '100%',
                background: '#fff',
                borderRadius: 24,
                padding: '48px 40px',
                boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
                border: '1px solid #f0f0f0',
            }}>
                {/* Lock Icon */}
                <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: 20,
                    background: 'linear-gradient(135deg, #0fb9b1, #20bf6b)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: '0 8px 24px rgba(15, 185, 177, 0.3)',
                }}>
                    <LockOutlined style={{ fontSize: 32, color: '#fff' }} />
                </div>

                <Title level={4} style={{ margin: '0 0 8px', fontWeight: 700 }}>
                    Verifikasi Keamanan
                </Title>
                <Text style={{ color: '#888', fontSize: 13, display: 'block', marginBottom: 32 }}>
                    Masukkan PIN 6 digit untuk mengakses data keuangan
                </Text>

                {/* PIN Input Grid */}
                <div
                    style={{
                        display: 'flex',
                        gap: 10,
                        justifyContent: 'center',
                        marginBottom: 24,
                        animation: shake ? 'pinShake 0.5s ease-in-out' : undefined,
                    }}
                    onPaste={handlePaste}
                >
                    {pin.map((digit, i) => (
                        <input
                            key={i}
                            ref={el => { inputRefs.current[i] = el; }}
                            type="password"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            disabled={locked}
                            onChange={e => handleChange(i, e.target.value)}
                            onKeyDown={e => handleKeyDown(i, e)}
                            style={{
                                width: 48,
                                height: 56,
                                textAlign: 'center',
                                fontSize: 24,
                                fontWeight: 700,
                                borderRadius: 14,
                                border: `2px solid ${error ? '#ef4444' : digit ? '#0fb9b1' : '#e5e7eb'}`,
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                background: locked ? '#f5f5f5' : digit ? 'rgba(15, 185, 177, 0.05)' : '#fafafa',
                                color: '#333',
                                fontFamily: "'Poppins', sans-serif",
                                caretColor: 'transparent',
                            }}
                            onFocus={e => {
                                e.target.style.borderColor = '#0fb9b1';
                                e.target.style.boxShadow = '0 0 0 3px rgba(15, 185, 177, 0.12)';
                            }}
                            onBlur={e => {
                                e.target.style.borderColor = digit ? '#0fb9b1' : '#e5e7eb';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    ))}
                </div>

                {/* Status messages */}
                {locked && (
                    <div style={{
                        color: '#ef4444',
                        fontSize: 13,
                        fontWeight: 600,
                        padding: '10px 16px',
                        background: 'rgba(239, 68, 68, 0.08)',
                        borderRadius: 10,
                        marginBottom: 16,
                    }}>
                        🔒 Terkunci — coba lagi dalam {lockTimer} detik
                    </div>
                )}

                {!locked && attempts > 0 && (
                    <div style={{
                        color: '#f59e0b',
                        fontSize: 12,
                        fontWeight: 500,
                        marginBottom: 16,
                    }}>
                        Sisa percobaan: {5 - attempts}
                    </div>
                )}

                <Text style={{ color: '#bbb', fontSize: 11, display: 'block' }}>
                    PIN dapat diubah di halaman Pengaturan
                </Text>

                {/* Shake animation CSS */}
                <style>{`
                    @keyframes pinShake {
                        0%, 100% { transform: translateX(0); }
                        20% { transform: translateX(-10px); }
                        40% { transform: translateX(10px); }
                        60% { transform: translateX(-8px); }
                        80% { transform: translateX(8px); }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default FinancePinGuard;
