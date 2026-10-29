import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Telemetry',
  robots: {
    index: false,
    follow: false,
  },
};

export default function systemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
