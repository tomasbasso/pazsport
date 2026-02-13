import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, keywords, image, url }) {
    const siteTitle = "PazSport - Indumentaria Deportiva";
    const defaultDescription = "Tienda de ropa deportiva en Winifreda, La Pampa. Envíos a todo el país. Calidad premium en indumentaria unisex.";
    const defaultKeywords = "ropa deportiva, indumentaria, Winifreda, La Pampa, gym, fitness, deporte, unisex";
    const siteUrl = "https://pazsport.vercel.app"; // Reemplazar con URL real si cambia
    const defaultImage = "/logo.png";

    const metaTitle = title ? `${title} | PazSport` : siteTitle;
    const metaDescription = description || defaultDescription;
    const metaKeywords = keywords || defaultKeywords;
    const metaImage = image || defaultImage;
    const metaUrl = url || siteUrl;

    // JSON-LD para Negocio Local
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "ClothingStore",
        "name": "PazSport",
        "image": [
            `${siteUrl}/logo.png`
        ],
        "description": "Venta de indumentaria deportiva de alta calidad en Winifreda, La Pampa.",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Winifreda",
            "addressRegion": "La Pampa",
            "addressCountry": "AR"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": "-36.2263", // Coordenadas aprox de Winifreda
            "longitude": "-64.2346"
        },
        "url": siteUrl,
        "telephone": "+5492333400000", // Reemplazar con el real si existe
        "priceRange": "$$"
    };

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />
            <meta name="keywords" content={metaKeywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={metaUrl} />
            <meta property="twitter:title" content={metaTitle} />
            <meta property="twitter:description" content={metaDescription} />
            <meta property="twitter:image" content={metaImage} />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
}
