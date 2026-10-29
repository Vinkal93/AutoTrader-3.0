import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Broker Connection Cockpit',
  robots: {
    index: false,
    follow: false,
  },
};

export default function brokerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
