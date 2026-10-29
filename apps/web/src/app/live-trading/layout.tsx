import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Trading Terminal',
  robots: {
    index: false,
    follow: false,
  },
};

export default function livetradingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
