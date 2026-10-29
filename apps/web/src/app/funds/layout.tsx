import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Funds & Charges',
  robots: {
    index: false,
    follow: false,
  },
};

export default function fundsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
