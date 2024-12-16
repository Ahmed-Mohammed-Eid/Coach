export const metadata = {
    title: 'YOUR COACH | Login',
    description: 'COACH Login',
    robots: { index: false, follow: false },
    viewport: { initialScale: 1, width: 'device-width' },
    openGraph: {
        type: 'website',
        title: 'YOUR COACH | Login',
        url: process.env.WEBSITE_URL,
        description: 'COACH Login',
        images: ['/logo.png'],
        ttl: 604800
    },
    icons: {
        icon: '/logo.png'
    }
};

export default function Layout({ children }) {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex-1">{children}</div>
        </div>
    );
}
