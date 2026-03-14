import '@/theme/main.css';
import '@/theme/App.css';
import '@/theme/verbis.css';
import ClientProviders from './ClientProviders.jsx';

export const metadata = {
  title: 'AI News | Future of Tech',
  description: 'AI-generated news on the latest tech trends',
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
