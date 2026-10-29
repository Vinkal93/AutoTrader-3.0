import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trading Terminal',
  robots: {
    index: false,
    follow: false,
  },
};

export default function tradingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
