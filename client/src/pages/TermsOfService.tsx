import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeaderSection } from "./sections/HeaderSection";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService(): JSX.Element {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <HeaderSection />
      <div className="flex-1">
        <div className="container mx-auto px-6 py-8 max-w-4xl">

        {/* Terms Card */}
        <Card className="bg-card/80 backdrop-blur border border-border/50 shadow-2xl animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-3xl font-bold">
              Terms of Service
            </CardTitle>
            <p className="text-muted-foreground">Effective Date: September 4, 2025</p>
          </CardHeader>

          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <div className="space-y-6 text-sm leading-relaxed">
              
              <section>
                <h2 className="text-lg font-semibold mb-3">1. Agreement to Terms</h2>
                <p>By accessing or using KasiViral ("Service"), operated by KasiViral ("Company," "we," "us," or "our"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you do not have permission to access the Service.</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">2. Description of Service</h2>
                <p>KasiViral provides an AI-powered platform for generating social media threads, utilizing templates, engagement metrics, and a viral threads library for various social media platforms including Facebook, LinkedIn, Twitter/X, and Threads.</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">3. User Accounts</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">3.1 Account Creation</h3>
                    <p>To access certain features, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">3.2 Account Security</h3>
                    <p>You are responsible for safeguarding your account password and for any activities or actions under your account. You must notify us immediately of any unauthorized use of your account.</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">3.3 Account Termination</h3>
                    <p>We reserve the right to suspend or terminate your account if you violate these Terms or engage in any conduct we deem inappropriate or harmful to the Service or other users.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">4. Subscription and Payment Terms</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">4.1 Subscription Plans</h3>
                    <p>We offer various subscription plans with different features and limitations. Details of each plan are available on our pricing page.</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">4.2 Billing</h3>
                    <p>Subscriptions are billed on a recurring basis (monthly or annually) through our payment processor, Stripe. By subscribing, you authorize us to charge your payment method on a recurring basis.</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">4.3 Refunds</h3>
                    <p>Subscription fees are non-refundable except as required by law. We do not provide refunds or credits for partial subscription periods.</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">4.4 Price Changes</h3>
                    <p>We reserve the right to modify our pricing. Any price changes will be communicated to you in advance and will take effect at the start of your next billing cycle.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">5. Acceptable Use Policy</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">5.1 Permitted Use</h3>
                    <p>You may use the Service only for lawful purposes and in accordance with these Terms. You agree to use the Service solely for creating social media content for legitimate business or personal purposes.</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">5.2 Prohibited Uses</h3>
                    <p className="mb-2">You agree NOT to use the Service to:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Generate content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or invasive of privacy</li>
                      <li>Impersonate any person or entity or falsely represent your affiliation with any person or entity</li>
                      <li>Generate spam, phishing content, or malicious content</li>
                      <li>Violate any applicable laws or regulations</li>
                      <li>Infringe upon any intellectual property rights of others</li>
                      <li>Generate content that promotes discrimination, hatred, or violence</li>
                      <li>Attempt to gain unauthorized access to the Service or its related systems</li>
                      <li>Use the Service in any manner that could disable, overburden, or impair the Service</li>
                      <li>Use automated systems or software to extract data from the Service</li>
                      <li>Resell, redistribute, or sublicense access to the Service without our express written consent</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">6. Content and Intellectual Property</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">6.1 Your Content</h3>
                    <p>You retain ownership of any content you create using the Service. By using the Service, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display your content solely for the purpose of providing and improving the Service.</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">6.2 Generated Content</h3>
                    <p>Content generated by our AI is provided "as is." You are solely responsible for reviewing, editing, and ensuring the accuracy and appropriateness of any AI-generated content before publishing it on social media platforms.</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">6.3 Our Intellectual Property</h3>
                    <p>The Service, including its original content, features, and functionality, is owned by KasiViral and is protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">6.4 Template and Threads Library</h3>
                    <p>Templates and threads provided in our library are licensed for use within the Service. You may use these materials in content created through the Service, but you may not extract, download, or use them independently outside the Service.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">7. Third-Party Services</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">7.1 OpenAI Integration</h3>
                    <p>Our Service utilizes OpenAI's GPT technology. Your use of AI-generated content is also subject to OpenAI's usage policies.</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">7.2 Payment Processing</h3>
                    <p>Payment processing is handled by Stripe. Your payment information is subject to Stripe's terms of service and privacy policy.</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">7.3 Social Media Platforms</h3>
                    <p>Content created using our Service must comply with the terms of service of the social media platforms where you publish it.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">8. Privacy and Data Protection</h2>
                <p>Your use of the Service is also governed by our Privacy Policy, which describes how we collect, use, and protect your information. By using the Service, you consent to our data practices as described in the Privacy Policy.</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">9. Disclaimers and Limitations of Liability</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">9.1 Service Availability</h3>
                    <p>The Service is provided "as is" and "as available" without warranties of any kind. We do not guarantee that the Service will be uninterrupted, secure, or error-free.</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">9.2 AI-Generated Content</h3>
                    <p>We do not guarantee the accuracy, completeness, or usefulness of AI-generated content. You are responsible for reviewing and verifying all content before use.</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">9.3 Limitation of Liability</h3>
                    <p>To the maximum extent permitted by law, KasiViral shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including lost profits, data, or goodwill, arising from your use of the Service.</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">9.4 Total Liability</h3>
                    <p>Our total liability to you for any claims arising from or related to these Terms or the Service shall not exceed the amount you paid to us in the twelve (12) months preceding the claim.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">10. Indemnification</h2>
                <p className="mb-2">You agree to indemnify, defend, and hold harmless KasiViral, its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses, including reasonable attorney's fees, arising from:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Your use of the Service</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any rights of another party</li>
                  <li>Content you create, publish, or distribute using the Service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">11. Modifications to Service and Terms</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">11.1 Service Modifications</h3>
                    <p>We reserve the right to modify, suspend, or discontinue the Service at any time without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">11.2 Terms Modifications</h3>
                    <p>We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the new Terms on this page and updating the "Effective Date." Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">12. Governing Law and Dispute Resolution</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">12.1 Governing Law</h3>
                    <p>These Terms shall be governed by and construed in accordance with the laws of the United States and the State of Delaware, without regard to its conflict of law provisions.</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">12.2 Dispute Resolution</h3>
                    <p>Any disputes arising from these Terms or your use of the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. The arbitration shall be conducted in Delaware, and judgment on the award may be entered in any court having jurisdiction.</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">12.3 Class Action Waiver</h3>
                    <p>You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">13. General Provisions</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">13.1 Entire Agreement</h3>
                    <p>These Terms constitute the entire agreement between you and KasiViral regarding the use of the Service.</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">13.2 Severability</h3>
                    <p>If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">13.3 Waiver</h3>
                    <p>Our failure to enforce any right or provision of these Terms shall not be considered a waiver of those rights.</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">13.4 Assignment</h3>
                    <p>You may not assign or transfer these Terms or your rights under them without our prior written consent. We may assign our rights and obligations without restriction.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">14. Contact Information</h2>
                <p className="mb-2">For questions about these Terms of Service, please contact us at:</p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p><strong>KasiViral</strong></p>
                  <p>Email: <a href="mailto:legal@kasiviral.ai" className="text-primary hover:underline">legal@kasiviral.ai</a></p>
                  <p>Website: <a href="https://kasiviral.ai" className="text-primary hover:underline">https://kasiviral.ai</a></p>
                </div>
              </section>

            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}