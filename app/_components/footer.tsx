import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  return (
    <footer className="w-full bg-secondary py-6 px-5 flex flex-col lg:flex-row justify-between items-center">
      <div className="flex items-center">
        <img src="/LogoBarbeariaMuniz.png" alt="Logo" className="h-8 mr-3" />
        <p className="text-gray-400 text-xs font-bold opacity-75">
          Desde 2018
        </p>
      </div>
      <nav className="mt-4 lg:mt-0">
        <ul className="flex space-x-4">
          <li>
            <a href="https://wa.me/message/DPJ5UW5L6T4GJ1" className="text-gray-400 text-xs font-bold opacity-75 hover:text-gray-300 flex items-center mr-3">
              <FontAwesomeIcon icon={faWhatsapp} className="h-8 mr-3" />
              WhatsApp
            </a>
          </li>
          <li>
            <a href="https://www.instagram.com/barbearia_munizz/" className="text-gray-400 text-xs font-bold opacity-75 hover:text-gray-300 flex items-center mr-3">
              <FontAwesomeIcon icon={faInstagram} className="h-8 mr-3" />
              Instagram
            </a>
          </li>
         
        </ul>
      </nav>
    </footer>
  );
};

export default Footer;
