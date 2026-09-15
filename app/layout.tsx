import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AnswerLens - Assessment Extraction & Answer Mapping',
  description: 'Extract questions and map student answers with AI',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
