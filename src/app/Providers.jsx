"use client";
import React, { useEffect } from 'react';
import { AuthModalProvider } from '@/context/AuthModalContext.jsx';
import { HomeStateProvider } from '@/context/HomeStateContext.jsx';
import { BrandingProvider } from '@/context/BrandingContext.jsx';
import { Toaster } from 'react-hot-toast';
import LoginModal from '@/components/modals/LoginModal.jsx';
import FloatingConsole from '@/components/ui/FloatingConsole.jsx';
import { startIngestionWorker } from '@/api/schedule.js';
import { fixMissingCloudinaryImages } from '@/api/articles.js';
import { usePathname } from 'next/navigation';

export default function Providers({ children }) {
    const pathname = usePathname() || '';
    const isAdminPage = pathname.startsWith("/analytics") || pathname.startsWith("/admin");

    useEffect(() => {
        startIngestionWorker();
        fixMissingCloudinaryImages();
    }, []);

    return (
        <AuthModalProvider>
            <HomeStateProvider>
                <BrandingProvider>
                    <div>
                        <Toaster position="top-center" />
                        {children}
                        <LoginModal />
                        {isAdminPage && <FloatingConsole />}
                    </div>
                </BrandingProvider>
            </HomeStateProvider>
        </AuthModalProvider>
    );
}
