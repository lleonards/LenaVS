
import React from 'react';
import { SaveIcon, ShareIcon, Logo } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Logo />
            </div>
            <nav className="hidden md:flex items-center space-x-4">
              {['Editor', 'Projetos', 'Biblioteca', 'Ajuda'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    item === 'Editor'
                      ? 'text-white bg-slate-700'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors">
              <ShareIcon />
              Compartilhar
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;