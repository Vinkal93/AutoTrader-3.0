import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trader Onboarding',
  robots: {
    index: false,
    follow: false,
  },
};

export default function onboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
