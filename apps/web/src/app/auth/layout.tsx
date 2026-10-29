import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication',
  robots: {
    index: false,
    follow: false,
  },
};

export default function authLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
