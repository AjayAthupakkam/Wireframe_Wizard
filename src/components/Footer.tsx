import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Mail, Phone, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-indigo-400">Wireframe Wizard</h3>
            <p className="text-gray-300 mb-4">
              Transform your wireframes into functional code with the power of AI.
              Streamline your development process and bring your designs to life faster.
            </p>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-indigo-400">Contact & Social</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-300">
                <Phone size={18} className="mr-2 text-indigo-400" />
                <a href="tel:+917826042995" className="hover:text-indigo-400 transition-colors">+91 7826042995</a>
              </li>
              <li className="flex items-center text-gray-300">
                <Mail size={18} className="mr-2 text-indigo-400" />
                <a href="mailto:bharathajay18@gmail.com" className="hover:text-indigo-400 transition-colors">bharathajay18@gmail.com</a>
              </li>
              <li className="flex items-center text-gray-300">
                <Linkedin size={18} className="mr-2 text-indigo-400" />
                <a 
                  href="linkedin.com/in/ajay-athupakkam-11691a249" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-indigo-400 transition-colors"
                >
                  LinkedIn
                </a>
              </li>
              <li className="flex items-center text-gray-300">
                <ExternalLink size={18} className="mr-2 text-indigo-400" />
                <a 
                  href="https://www.codechef.com/users/ajay_0116" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-indigo-400 transition-colors"
                >
                  CodeChef
                </a>
              </li>
              <li className="flex items-center text-gray-300">
                <ExternalLink size={18} className="mr-2 text-indigo-400" />
                <a 
                  href="https://www.naukri.com/mnjuser/profile?id=&altresid" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-indigo-400 transition-colors"
                >
                  Naukri
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Wireframe Wizard. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
