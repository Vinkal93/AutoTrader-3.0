import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Super Admin Portal',
  robots: {
    index: false,
    follow: false,
  },
};

export default function adminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
