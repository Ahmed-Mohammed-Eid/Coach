'use client';
import { LayoutProvider } from '../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import { Toaster } from 'react-hot-toast';

import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
// Global Styles
import '../src/app/[locale]/global.css';
import '../styles/primeReactArabicStyle.scss';

interface RootLayoutProps {
    children: React.ReactNode;
    lang: string;
}

export default function ClientLayout({ children, lang }: RootLayoutProps) {
    return (
        <html suppressHydrationWarning lang={lang}>
            <body>
                <PrimeReactProvider>
                    <LayoutProvider>{children}</LayoutProvider>
                </PrimeReactProvider>
                <Toaster position="bottom-right" />
            </body>
        </html>
    );
}
