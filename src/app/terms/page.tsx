import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Find AI Dir - Read our terms and conditions for using our AI tools directory.',
  alternates: {
    canonical: '/terms/',
  },
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto prose prose-gray dark:prose-invert">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              Welcome to Find AI Dir (&quot;Company,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). By accessing or using our website at findaidir.com (the &quot;Site&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use our Site.
            </p>
            <p className="text-muted-foreground mt-4">
              We reserve the right to modify these Terms at any time. Your continued use of the Site following any changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground">
              Find AI Dir is an online directory that provides information about artificial intelligence tools and services. Our services include:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>Browsing and searching AI tools across various categories</li>
              <li>Accessing information about AI tools, including descriptions and website links</li>
              <li>Submitting AI tools for listing in our directory</li>
              <li>Subscribing to our newsletter for updates</li>
              <li>Advertising and sponsored listing opportunities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. User Responsibilities</h2>
            <p className="text-muted-foreground">By using our Site, you agree to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>Provide accurate and complete information when submitting tools or contacting us</li>
              <li>Use the Site only for lawful purposes</li>
              <li>Not attempt to gain unauthorized access to our systems</li>
              <li>Not interfere with the proper functioning of the Site</li>
              <li>Not use automated systems to access the Site without permission</li>
              <li>Not reproduce, duplicate, or exploit any portion of the Site for commercial purposes without our consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Tool Submissions</h2>

            <h3 className="text-lg font-medium mt-4 mb-2">4.1 Submission Guidelines</h3>
            <p className="text-muted-foreground">When submitting a tool for listing, you represent and warrant that:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>You have the right to submit the tool and its information</li>
              <li>The information provided is accurate and not misleading</li>
              <li>The tool does not violate any laws or third-party rights</li>
              <li>The tool is functional and accessible</li>
            </ul>

            <h3 className="text-lg font-medium mt-6 mb-2">4.2 Listing Rights</h3>
            <p className="text-muted-foreground">
              We reserve the right to accept, reject, or remove any tool submission at our sole discretion. We may edit or modify submitted information for clarity, accuracy, or formatting purposes.
            </p>

            <h3 className="text-lg font-medium mt-6 mb-2">4.3 Paid Listings</h3>
            <p className="text-muted-foreground">
              For paid listing options (Express, Featured, Sponsored), the following terms apply:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>Payments are processed through secure third-party payment processors</li>
              <li>Listing durations and features are as described at the time of purchase</li>
              <li>Refunds may be provided at our discretion within 7 days if the listing has not been published</li>
              <li>We reserve the right to remove paid listings that violate these Terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Intellectual Property</h2>

            <h3 className="text-lg font-medium mt-4 mb-2">5.1 Our Content</h3>
            <p className="text-muted-foreground">
              The Site and its original content, features, and functionality are owned by Find AI Dir and are protected by international copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our prior written consent.
            </p>

            <h3 className="text-lg font-medium mt-6 mb-2">5.2 Third-Party Content</h3>
            <p className="text-muted-foreground">
              Tool listings, logos, descriptions, and links to external websites are the property of their respective owners. We do not claim ownership of third-party content displayed on our Site.
            </p>

            <h3 className="text-lg font-medium mt-6 mb-2">5.3 User Content</h3>
            <p className="text-muted-foreground">
              By submitting content to our Site, you grant us a non-exclusive, royalty-free, perpetual license to use, display, and distribute such content in connection with our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Third-Party Links and Tools</h2>
            <p className="text-muted-foreground">
              Our Site contains links to third-party websites and tools. These links are provided for convenience and informational purposes only. We do not:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>Endorse or guarantee any third-party tools or services</li>
              <li>Control the content, privacy policies, or practices of third-party sites</li>
              <li>Accept responsibility for any loss or damage arising from your use of third-party services</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              We encourage you to review the terms and privacy policies of any third-party sites you visit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground">
              THE SITE AND ALL CONTENT ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>The Site will be uninterrupted, secure, or error-free</li>
              <li>The information provided is accurate, complete, or current</li>
              <li>Any listed tools will meet your requirements or expectations</li>
              <li>Any defects or errors will be corrected</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Your use of the Site and any listed tools is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, FIND AI DIR AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>Loss of profits, data, or goodwill</li>
              <li>Service interruption or computer damage</li>
              <li>Damages arising from your use of third-party tools listed on our Site</li>
              <li>Any other intangible losses</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Our total liability shall not exceed the amount you paid us in the twelve months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. Indemnification</h2>
            <p className="text-muted-foreground">
              You agree to indemnify, defend, and hold harmless Find AI Dir and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>Your use of the Site</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Any content you submit to the Site</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">10. Advertising</h2>
            <p className="text-muted-foreground">
              Our Site may display advertisements from third-party advertising networks (such as Google AdSense). By using our Site, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>Advertisements are provided by third parties and not by us</li>
              <li>We do not endorse products or services advertised</li>
              <li>Clicking on advertisements may take you to external sites</li>
              <li>Third-party advertisers may use cookies to serve relevant ads</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">11. Newsletter and Communications</h2>
            <p className="text-muted-foreground">
              By subscribing to our newsletter, you consent to receive periodic emails about AI tools, industry news, and promotional content. You may unsubscribe at any time using the link provided in each email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">12. Termination</h2>
            <p className="text-muted-foreground">
              We may terminate or suspend your access to the Site immediately, without prior notice, for any reason, including breach of these Terms. Upon termination:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>Your right to use the Site will immediately cease</li>
              <li>We may remove any content you have submitted</li>
              <li>Provisions that by their nature should survive termination will remain in effect</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">13. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles. Any disputes arising from these Terms or your use of the Site shall be resolved through binding arbitration or in the courts of competent jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">14. Severability</h2>
            <p className="text-muted-foreground">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">15. Entire Agreement</h2>
            <p className="text-muted-foreground">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Find AI Dir regarding your use of the Site and supersede any prior agreements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">16. Contact Information</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">Find AI Dir</p>
              <p className="text-muted-foreground">Email: legal@findaidir.com</p>
              <p className="text-muted-foreground">Website: https://findaidir.com</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
