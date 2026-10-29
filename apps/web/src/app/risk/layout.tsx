import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Risk Governance',
  robots: {
    index: false,
    follow: false,
  },
};

export default function riskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
