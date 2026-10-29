import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trading Workspace',
  robots: {
    index: false,
    follow: false,
  },
};

export default function appLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
