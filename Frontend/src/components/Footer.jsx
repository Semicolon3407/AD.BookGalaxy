import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin,
  Book,
  Heart
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-lg">
                <Book className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  BookGalaxy
                </h3>
              </div>
            </Link>
            <p className="text-gray-600 text-sm">
              Your one-stop destination for all your literary needs. Discover, read, and explore the universe of books.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/books" className="text-gray-600 hover:text-indigo-600 text-sm transition-colors">
                  Browse Books
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-600 hover:text-indigo-600 text-sm transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/new-releases" className="text-gray-600 hover:text-indigo-600 text-sm transition-colors">
                  New Releases
                </Link>
              </li>
              <li>
                <Link to="/best-sellers" className="text-gray-600 hover:text-indigo-600 text-sm transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link to="/announcements" className="text-gray-600 hover:text-indigo-600 text-sm transition-colors">
                  Announcements
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-indigo-600 text-sm transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-indigo-600 text-sm transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-600 hover:text-indigo-600 text-sm transition-colors">
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-600 hover:text-indigo-600 text-sm transition-colors">
                  Returns Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-indigo-600 text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-gray-600 text-sm">
                <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <span>123 Book Street, Literary Lane<br />Readers City, RC 12345</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-600 text-sm">
                <Phone className="h-5 w-5 text-gray-400" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-600 text-sm">
                <Mail className="h-5 w-5 text-gray-400" />
                <span>support@bookgalaxy.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              © {currentYear} BookGalaxy. All rights reserved.
            </p>
            <div className="flex items-center space-x-1 text-gray-600 text-sm mt-4 md:mt-0">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>by BookGalaxy Team</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
