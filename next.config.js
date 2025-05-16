const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        API_URL: 'https://api.your-couch.info/api/v1',
        WEBSITE_URL: 'https://api.your-couch.info'
    },
    images: {
        domains: ['kportals.net', 'coach.kportals.net', 'api.easydietkw.com', 'localhost', 'api.your-couch.info', 'your-couch.info']
    }
};

module.exports = withNextIntl(nextConfig);
