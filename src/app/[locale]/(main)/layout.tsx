import { Metadata } from 'next';
import Layout from '../../../../layout/layout';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import axios from 'axios';

interface AppLayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    title: 'YOUR COACH | Dashboard',
    description: 'COACH Dashboard',
    robots: { index: false, follow: false },
    viewport: { initialScale: 1, width: 'device-width' },
    openGraph: {
        type: 'website',
        title: 'YOUR COACH | Dashboard',
        url: process.env.WEBSITE_URL,
        description: 'YOUR COACH Dashboard',
        images: ['/logo.png'],
        ttl: 604800
    },
    icons: {
        icon: '/logo.png'
    }
};

export default async function AppLayout({ children, params: { locale } }: { children: React.ReactNode; params: { locale: string } }) {
    // GET THE TOKEN FROM THE COOKIE
    const token = cookies().get('token');

    if (!token) {
        redirect(`/${locale}/login`);
    }

    // CHECK IF THE TOKEN IS VALID
    await axios
        .get(`${process.env.API_URL}/get/verify/token`, {
            params: {
                token: token.value
            }
        })
        .then((response) => {
            if (!response.data.success) {
                redirect(`/${locale}/login`);
            }
        })
        .catch(() => {
            redirect(`/${locale}/login`);
        });

    return <Layout>{children}</Layout>;
}
