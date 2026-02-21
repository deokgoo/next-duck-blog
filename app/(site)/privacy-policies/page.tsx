import React from 'react';
import Head from 'next/head';
import siteMetadata from '@/data/siteMetadata';

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy</title>
        <meta name="description" content="Our website's privacy policy" />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Privacy Policy</h1>
        <p className="mb-4">Last updated: {new Date().toDateString()}</p>

        <section className="mb-6">
          <h2 className="mb-3 text-2xl font-semibold">1. Introduction</h2>
          <p>
            Welcome to our website. This Privacy Policy explains how we handle information when you
            visit our site. We do not actively collect personal information from our visitors.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-2xl font-semibold">2. Information We Collect</h2>
          <p>
            We do not actively collect personal information. However, our website automatically
            collects some standard information, including:
          </p>
          <ul className="ml-4 list-inside list-disc">
            <li>IP address</li>
            <li>Browser type</li>
            <li>Device information</li>
            <li>Pages visited</li>
            <li>Time and date of visits</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-2xl font-semibold">3. How We Use Information</h2>
          <p>
            The automatically collected information is used solely for the purpose of analyzing
            website traffic and improving user experience. We do not use this information to
            identify individual users.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-2xl font-semibold">4. Third-Party Services</h2>
          <p>
            We use Google Analytics to analyze website traffic. Google has its own privacy policy
            which you can review on their website. We do not share any information with third
            parties for marketing purposes.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-2xl font-semibold">5. Cookies</h2>
          <p>
            Our website uses cookies to enhance user experience and analyze website traffic. You can
            control cookies through your browser settings.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-2xl font-semibold">6. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. Any changes will be posted on this
            page.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-2xl font-semibold">7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <strong>{siteMetadata.email}</strong>
          </p>
        </section>
      </div>
    </>
  );
};

export default PrivacyPolicy;
