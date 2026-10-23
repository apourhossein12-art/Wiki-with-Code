import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Code Converter Pro - مبدل کد هوشمند',
  description: 'مبدل و ارتقا دهنده پیشرفته کد و معماری چندفایلی بهینه برای آیفون و موبایل با پشتیبانی دوزبانه فارسی و انگلیسی و زیرنویس تعاملی اعلانات آموزشی',
  openGraph: {
    title: 'Code Converter Pro - مبدل کد هوشمند',
    description: 'Multi-file framework migration and code conversion workbench optimized for iPhone & mobile with bilingual support and interactive alert subtitles.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Code Converter Pro - مبدل کد هوشمند',
    description: 'Multi-file framework migration and code conversion workbench optimized for iPhone & mobile with bilingual support and interactive alert subtitles.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#030712',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Vazirmatn:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
