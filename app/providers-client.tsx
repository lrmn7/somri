'use client';

import { Providers } from '@/components/providers';

export default function ClientOnlyProviders({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}