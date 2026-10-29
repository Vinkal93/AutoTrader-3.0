import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Performance Analytics',
  robots: {
    index: false,
    follow: false,
  },
};

export default function analyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
