import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trade History',
  robots: {
    index: false,
    follow: false,
  },
};

export default function tradesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
