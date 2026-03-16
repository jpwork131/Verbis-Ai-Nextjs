"use client";

import dynamic from 'next/dynamic';
const Providers = dynamic(() => import('@/providers/Providers'), { ssr: false });

export default function ClientProviders({ children }) {
  return <Providers>{children}</Providers>;
}
