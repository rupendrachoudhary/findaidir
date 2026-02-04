import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Find AI Dir - Learn how we collect, use, and protect your personal information.',
  alternates: {
    canonical: '/privacy/',
  },
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto prose prose-gray dark:prose-invert">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground">
              Welcome to Find AI Dir (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website findaidir.com (the &quot;Site&quot;).
            </p>
            <p className="text-muted-foreground mt-4">
              Please read this Privacy Policy carefully. By accessing or using our Site, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>

            <h3 className="text-lg font-medium mt-4 mb-2">2.1 Information You Provide</h3>
            <p className="text-muted-foreground">We collect information you voluntarily provide when you:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>Subscribe to our newsletter</li>
              <li>Submit a tool for listing</li>
              <li>Contact us via email or contact forms</li>
              <li>Participate in surveys or promotions</li>
            </ul>
            <p className="text-muted-foreground mt-4">This information may include:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>Email address</li>
              <li>Name or company name</li>
              <li>Website URL</li>
              <li>Tool descriptions and related information</li>
            </ul>

            <h3 className="text-lg font-medium mt-6 mb-2">2.2 Information Automatically Collected</h3>
            <p className="text-muted-foreground">When you visit our Site, we automatically collect certain information, including:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website addresses</li>
              <li>Device information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground">We use the collected information for various purposes:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>To provide and maintain our Site</li>
              <li>To process tool submissions and listings</li>
              <li>To send newsletters and marketing communications (with your consent)</li>
              <li>To respond to your inquiries and provide customer support</li>
              <li>To analyze usage patterns and improve our Site</li>
              <li>To detect and prevent fraudulent activities</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Cookies and Tracking Technologies</h2>
            <p className="text-muted-foreground">
              We use cookies and similar tracking technologies to collect and track information about your browsing activities. Cookies are small data files stored on your device.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">Types of Cookies We Use:</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li><strong>Essential Cookies:</strong> Required for the Site to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our Site (Google Analytics)</li>
              <li><strong>Advertising Cookies:</strong> Used to deliver relevant advertisements (Google AdSense)</li>
            </ul>

            <p className="text-muted-foreground mt-4">
              You can control cookies through your browser settings. However, disabling certain cookies may affect your experience on our Site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Third-Party Services</h2>
            <p className="text-muted-foreground">We may use third-party services that collect, monitor, and analyze data:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
              <li><strong>Google AdSense:</strong> For displaying advertisements</li>
              <li><strong>Email Service Providers:</strong> For newsletter delivery</li>
              <li><strong>Payment Processors:</strong> For processing payments for premium listings</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              These third parties have their own privacy policies governing the use of your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground">We do not sell your personal information. We may share your information in the following circumstances:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>With service providers who assist in operating our Site</li>
              <li>To comply with legal obligations or court orders</li>
              <li>To protect our rights, privacy, safety, or property</li>
              <li>In connection with a merger, acquisition, or sale of assets</li>
              <li>With your consent or at your direction</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Secure hosting infrastructure</li>
              <li>Regular security assessments</li>
              <li>Limited access to personal information</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Your Rights</h2>
            <p className="text-muted-foreground">Depending on your location, you may have the following rights:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              To exercise these rights, please contact us at privacy@findaidir.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground">
              Our Site is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">10. International Data Transfers</h2>
            <p className="text-muted-foreground">
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using our Site, you consent to the transfer of your information to these countries.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">12. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions or concerns about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">Find AI Dir</p>
              <p className="text-muted-foreground">Email: privacy@findaidir.com</p>
              <p className="text-muted-foreground">Website: https://findaidir.com</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
