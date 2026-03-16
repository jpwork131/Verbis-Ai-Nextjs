import '../styles/main.css';
import '../styles/App.css';
import '../styles/startej.css';
import ClientProviders from '@/providers/ClientProviders';

export const metadata = {
  title: 'StartEJ | Startup News & Tech Intelligence',
  description: 'AI-powered news, funding alerts, and ecosystem insights from StartEJ.com.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
