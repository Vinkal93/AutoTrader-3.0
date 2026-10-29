import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Settings',
  robots: {
    index: false,
    follow: false,
  },
};

export default function settingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
