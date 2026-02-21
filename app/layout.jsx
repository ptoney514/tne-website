import './globals.css';
import Providers from '@/components/Providers';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'TNE United Express Basketball',
  description: 'Youth basketball program',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
