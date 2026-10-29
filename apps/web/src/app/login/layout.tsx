import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trader Sign In',
  robots: {
    index: false,
    follow: false,
  },
};

export default function loginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
