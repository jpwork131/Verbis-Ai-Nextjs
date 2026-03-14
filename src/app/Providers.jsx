"use client";
import React, { useEffect } from 'react';
import { AuthModalProvider } from '../context/AuthModalContext';
import { HomeStateProvider } from '../context/HomeStateContext';
import { BrandingProvider } from '../context/BrandingContext';
import { Toaster } from 'react-hot-toast';
import LoginModal from '../components/modals/LoginModal';
import FloatingConsole from '../components/ui/FloatingConsole';
import { startIngestionWorker } from '../api/schedule';
import { fixMissingCloudinaryImages } from '../api/articles';
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
