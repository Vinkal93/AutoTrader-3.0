import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Notifications',
  robots: {
    index: false,
    follow: false,
  },
};

export default function notificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
