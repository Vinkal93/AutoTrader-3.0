import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Strategy Settings',
  robots: {
    index: false,
    follow: false,
  },
};

export default function strategiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
