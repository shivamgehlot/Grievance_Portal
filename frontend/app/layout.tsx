import { AuthProvider } from '@/context/AuthContext';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Public Grievance System',
  description: 'AI-Powered Public Grievance Portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
