
class SeoBuilder {

    constructor() {
        this.defaultMeta = {
            title: 'Notify',
            description: 'Notify is a social media platform where you can connect with friends, share updates, photos, and stay informed. Join Notify today and be part of a growing community.',
            keywords: 'social media, connect, share, friends, updates, Notify, photos, community',
            url: 'https://notify-b60e.onrender.com/',
            image: 'https://res.cloudinary.com/dbpfdlf7z/image/upload/v1748861512/seo-logo_i8wl4z.png', // Replace with your actual image URL
            type: 'website',
            twitterCard: 'https://res.cloudinary.com/dbpfdlf7z/image/upload/v1748861512/seo-logo_i8wl4z.png', // Same image or a Twitter-specific card
            twitterCreator: '@yourtwitterhandle', // Replace with your actual Twitter handle
            schema: {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Notify",
                "url": "https://notifyapp.vercel.app/",
                "description": "Notify is a social media platform where you can connect with friends, share updates, photos, and stay informed.",
                "image": "https://res.cloudinary.com/dbpfdlf7z/image/upload/v1748861512/seo-logo_i8wl4z.png", // Same image URL
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": "",
                    "query-input": "required name=search_term"
                }
            }
        };
    };

    middleware() {
        return (req, res, next) => {
            res.locals.meta = { ...this.defaultMeta };
            res.locals.seo = this;
            next();
        };
    };

    add(res, customMeta) {
        Object.assign(res.locals.meta, customMeta); // ✅ Override per request
    };

};

module.exports = new SeoBuilder();