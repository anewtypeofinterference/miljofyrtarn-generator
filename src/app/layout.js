import './globals.css';

export const metadata = {
  title: 'Miljøfyrtårn - Visuelt verktøy',
  description: 'Velkommen til Miljøfyrtårn sitt visuelle verktøy. Her kan du enkelt lage og tilpasse innhold. Flytt, rediger og gjør endringer på elementene til du er fornøyd, og eksporter det ferdige resultatet som PNG eller PDF.',
  openGraph: {
    images: [
      {
        url: './placeholder-2.jpg',
        width: 1200,
        height: 630,
        alt: 'Velkommen til Miljøfyrtårn sitt visuelle verktøy. Her kan du enkelt lage og tilpasse innhold. Flytt, rediger og gjør endringer på elementene til du er fornøyd, og eksporter det ferdige resultatet som PNG eller PDF.',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['./placeholder-2.jpg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black/10">{children}</body>
    </html>
  );
}
