import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LoginScreenProps {
    onLogin: () => Promise<{ error: any }>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [loginLoading, setLoginLoading] = useState(false);

    const handleLogin = async () => {
        setLoginLoading(true);
        const { error } = await onLogin();
        if (error) {
            alert('Erro ao fazer login. Tente novamente.');
        }
        setLoginLoading(false);
    };

    return (
        <div className="flex flex-col h-full w-full relative bg-gradient-to-b from-blue-50/50 to-white overflow-hidden text-zinc-900">
            {/* Background Ambience (Cleaner, no pulsing blobs) */}
            <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-violet-100/20 to-transparent pointer-events-none" />

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">

                {/* Logo Container */}
                <div className="relative group mb-8">
                    <div className="p-4 relative z-10 transform transition-transform duration-500 hover:scale-105">
                        <img
                            src="/logo.svg"
                            alt="Pega ou Passa Logo"
                            className="w-32 h-32 drop-shadow-xl rounded-[30px]"
                        />
                    </div>
                </div>

                {/* Brand Text */}
                <div className="space-y-3 mb-12 animate-slide-up w-full max-w-lg mx-auto px-4">
                    <h1 className="text-4xl font-black tracking-tighter text-zinc-900 leading-none">
                        <span className="text-violet-700">PEGA</span>
                        <span className="text-zinc-400 mx-2 text-2xl align-middle">OU</span>
                        <span className="text-violet-700">PASSA</span>
                    </h1>
                    <p className="text-base text-zinc-600 font-medium whitespace-normal max-w-xs mx-auto">
                        O jeito mais divertido de encontrar seu par!
                    </p>
                </div>

                {/* Login Button */}
                <div className="w-full max-w-sm animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <button
                        onClick={handleLogin}
                        disabled={loginLoading}
                        className="w-full h-14 bg-white hover:bg-zinc-50 text-zinc-800 font-bold text-lg rounded-full shadow-lg shadow-zinc-200/50 border border-zinc-200 flex items-center justify-center gap-3 transition-all active:scale-95 relative overflow-hidden group"
                    >
                        <div className="flex items-center justify-center gap-3 relative z-10">
                            {loginLoading ? (
                                <Loader2 className="animate-spin text-violet-600" size={24} />
                            ) : (
                                <>
                                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    <span>Entrar com Google</span>
                                </>
                            )}
                        </div>
                    </button>

                    <p className="mt-8 text-xs text-zinc-400">
                        Ao entrar, você concorda com nossos <a href="#" className="underline hover:text-violet-600">Termos</a> e <a href="#" className="underline hover:text-violet-600">Privacidade</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};
