const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        API_URL: 'https://coach.kportals.net/api/v1',
        WEBSITE_URL: 'https://coach.kportals.net'
    },
    images: {
        domains: ['kportals.net', 'coach.kportals.net', 'api.easydietkw.com', 'localhost']
    }
};

module.exports = withNextIntl(nextConfig);
