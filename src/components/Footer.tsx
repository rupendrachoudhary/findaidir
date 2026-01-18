import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import Newsletter from './Newsletter';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <span>AI Tools Directory</span>
            </Link>
            <p className="text-muted-foreground max-w-md mb-6">
              Discover the best AI tools for your needs. Our directory features over 6,000 AI tools across 290+ categories to help you find the perfect solution.
            </p>
            {/* Newsletter */}
            <Newsletter variant="footer" />
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/tools" className="text-muted-foreground hover:text-foreground transition-colors">
                  All Tools
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-muted-foreground hover:text-foreground transition-colors">
                  Submit Tool
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h3 className="font-semibold mb-4">Popular Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/category/ai-agents" className="text-muted-foreground hover:text-foreground transition-colors">
                  AI Agents
                </Link>
              </li>
              <li>
                <Link href="/category/ai-chatbots" className="text-muted-foreground hover:text-foreground transition-colors">
                  AI Chatbots
                </Link>
              </li>
              <li>
                <Link href="/category/marketing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Marketing
                </Link>
              </li>
              <li>
                <Link href="/category/research" className="text-muted-foreground hover:text-foreground transition-colors">
                  Research
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="text-muted-foreground hover:text-foreground transition-colors">
                  Advertise
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Find AI Dir. All rights reserved.</p>
          <p>findaidir.com - Your Ultimate AI Tools Directory</p>
        </div>
      </div>
    </footer>
  );
}
