"use client";
import React, { useEffect } from 'react';
import { AuthModalProvider } from '../contexts/AuthModalContext';
import { HomeStateProvider } from '../contexts/HomeStateContext';
import { BrandingProvider } from '../contexts/BrandingContext';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import LoginModal from '../components/modals/LoginModal';
import FloatingConsole from '../components/ui/FloatingConsole';
import { startIngestionWorker } from '../services/schedule';
import { fixMissingCloudinaryImages } from '../services/articles';
import { usePathname } from 'next/navigation';

export default function Providers({ children }) {
    const pathname = usePathname() || '';
    const isAdminPage = pathname.startsWith("/analytics") || pathname.startsWith("/admin");

    useEffect(() => {
        startIngestionWorker();
        fixMissingCloudinaryImages();
    }, []);

    return (
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
            <AuthModalProvider>
                <HomeStateProvider>
                    <BrandingProvider>
                        <div className="min-h-screen transition-colors duration-300">
                            <Toaster position="top-center" />
                            {children}
                            <LoginModal />
                            {isAdminPage && <FloatingConsole />}
                        </div>
                    </BrandingProvider>
                </HomeStateProvider>
            </AuthModalProvider>
        </ThemeProvider>
    );
}
