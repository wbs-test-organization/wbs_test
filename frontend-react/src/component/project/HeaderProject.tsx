import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react'; 
import { Link } from 'react-router';

const HeaderProject: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<string>('project');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-100 dark:border-gray-700 fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 ml-[-120px]">
            <img
              src="/logo.png"
              alt="WBS Logo"
              className="h-12 w-12 object-contain rounded-lg shadow-sm"
            />

            <button
              onClick={() => setSelectedItem('project')}
              className={`flex items-center space-x-2 group cursor-pointer transition-all duration-300 hover:bg-green-50 dark:hover:bg-gray-700 rounded-xl px-4 py-2
                ${selectedItem === 'project' ? 'bg-green-500 text-white' : ''}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="h-4 w-4 text-gray-700 dark:text-gray-300 group-hover:text-green-400 transition-colors"
                fill="currentColor"
              >
                <path d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM64 160v64H0V160H64zm64 0H448V416H128V160zM0 288H64v64H0V288zm0 96H64v32c0 17.7 14.3 32 32 32H416c17.7 0 32-14.3 32-32V384H0v32z" />
              </svg>
              <h1 className="text-sm text-black dark:text-gray-200 group-hover:text-green-400 transition-colors">
                PROJECT
              </h1>
            </button>

            <button
              onClick={() => setSelectedItem('tasklist')}
              className={`flex items-center space-x-3 group cursor-pointer transition-all duration-300 hover:bg-green-50 dark:hover:bg-gray-700 rounded-xl px-4 py-2 
                ${selectedItem === 'tasklist' ? 'bg-green-500 text-white' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                className="h-4 w-4 text-gray-700 dark:text-gray-300 group-hover:text-green-400 transition-colors"
                fill="currentColor">
                <path d="M480 96C515.3 96 544 124.7 544 160L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160C96 124.7 124.7 96 160 96L480 96zM160 144C151.2 144 144 151.2 144 160L144 480C144 488.8 151.2 496 160 496L480 496C488.8 496 496 488.8 496 480L496 160C496 151.2 488.8 144 480 144L160 144zM390.7 233.9C398.5 223.2 413.5 220.8 424.2 228.6C434.9 236.4 437.3 251.4 429.5 262.1L307.4 430.1C303.3 435.8 296.9 439.4 289.9 439.9C282.9 440.4 276 437.9 271.1 433L215.2 377.1C205.8 367.7 205.8 352.5 215.2 343.2C224.6 333.9 239.8 333.8 249.1 343.2L285.1 379.2L390.7 234z" />
              </svg>
              <h1 className="text-sm text-black dark:text-gray-200 group-hover:text-green-400 transition-colors">
                TASKLIST
              </h1>
            </button>

            <button
              onClick={() => setSelectedItem('logtime')}
              className={`flex items-center space-x-3 group cursor-pointer transition-all duration-300 hover:bg-green-50 dark:hover:bg-gray-700 rounded-xl px-4 py-2 
                ${selectedItem === 'logtime' ? 'bg-green-500 text-white' : ''}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                className="h-4 w-4 text-gray-700 dark:text-gray-300 group-hover:text-green-400 transition-colors"
                fill="currentColor"
              >
                <path d="M528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112C434.9 112 528 205.1 528 320zM64 320C64 461.4 178.6 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320zM296 184L296 320C296 328 300 335.5 306.7 340L402.7 404C413.7 411.4 428.6 408.4 436 397.3C443.4 386.2 440.4 371.4 429.3 364L344 307.2L344 184C344 170.7 333.3 160 320 160C306.7 160 296 170.7 296 184z" />
              </svg>
              <h1 className="text-sm text-black dark:text-gray-200 group-hover:text-green-400 transition-colors">
                LOGTIME
              </h1>
            </button>

            <button
              onClick={() => setSelectedItem('dashboard')}
              className={`flex items-center space-x-3 group cursor-pointer transition-all duration-300 hover:bg-green-50 dark:hover:bg-gray-700 rounded-xl px-4 py-2 
                ${selectedItem === 'dashboard' ? 'bg-green-500 text-white' : ''}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                className="h-4 w-4 text-gray-700 dark:text-gray-300 group-hover:text-green-400 transition-colors"
                fill="currentColor"
              >
                <path d="M216 64C229.3 64 240 74.7 240 88L240 128L400 128L400 88C400 74.7 410.7 64 424 64C437.3 64 448 74.7 448 88L448 128L480 128C515.3 128 544 156.7 544 192L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 192C96 156.7 124.7 128 160 128L192 128L192 88C192 74.7 202.7 64 216 64zM480 496C488.8 496 496 488.8 496 480L496 416L408 416L408 496L480 496zM496 368L496 288L408 288L408 368L496 368zM360 368L360 288L280 288L280 368L360 368zM232 368L232 288L144 288L144 368L232 368zM144 416L144 480C144 488.8 151.2 496 160 496L232 496L232 416L144 416zM280 416L280 496L360 496L360 416L280 416zM216 176L160 176C151.2 176 144 183.2 144 192L144 240L496 240L496 192C496 183.2 488.8 176 480 176L216 176z" />
              </svg>
              <h1 className="text-sm text-black dark:text-gray-200 group-hover:text-green-400 transition-colors">
                DASHBOARD
              </h1>
            </button>

            <button
              onClick={() => setSelectedItem('checklist')}
              className={`flex items-center space-x-3 group cursor-pointer transition-all duration-300 hover:bg-green-50 dark:hover:bg-gray-700 rounded-xl px-4 py-2 
                ${selectedItem === 'checklist' ? 'bg-green-500 text-white' : ''}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                className="h-4 w-4 text-gray-700 dark:text-gray-300 group-hover:text-green-400 transition-colors"
                fill="currentColor"
              >
                <path d="M439.4 96L448 96C483.3 96 512 124.7 512 160L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 160C128 124.7 156.7 96 192 96L200.6 96C211.6 76.9 232.3 64 256 64L384 64C407.7 64 428.4 76.9 439.4 96zM376 176C389.3 176 400 165.3 400 152C400 138.7 389.3 128 376 128L264 128C250.7 128 240 138.7 240 152C240 165.3 250.7 176 264 176L376 176zM256 320C256 302.3 241.7 288 224 288C206.3 288 192 302.3 192 320C192 337.7 206.3 352 224 352C241.7 352 256 337.7 256 320zM288 320C288 333.3 298.7 344 312 344L424 344C437.3 344 448 333.3 448 320C448 306.7 437.3 296 424 296L312 296C298.7 296 288 306.7 288 320zM288 448C288 461.3 298.7 472 312 472L424 472C437.3 472 448 461.3 448 448C448 434.7 437.3 424 424 424L312 424C298.7 424 288 434.7 288 448zM224 480C241.7 480 256 465.7 256 448C256 430.3 241.7 416 224 416C206.3 416 192 430.3 192 448C192 465.7 206.3 480 224 480z" />
              </svg>
              <h1 className="text-sm text-black dark:text-gray-200 group-hover:text-green-400 transition-colors">
                CHECKLIST
              </h1>
            </button>
          </div>

          <div className="flex items-center space-x-6">
            <img
              src="/flag.png"
              alt="Flag"
              className="h-8 w-10 object-cover shadow-sm"
            />
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <div className="relative">
              <button className="flex items-center space-x-2 focus:outline-none" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"
                className="h-7 w-7 text-gray-700 dark:text-gray-300 transition-colors"
                fill="currentColor">
                <path d="M240 192C240 147.8 275.8 112 320 112C364.2 112 400 147.8 400 192C400 236.2 364.2 272 320 272C275.8 272 240 236.2 240 192zM448 192C448 121.3 390.7 64 320 64C249.3 64 192 121.3 192 192C192 262.7 249.3 320 320 320C390.7 320 448 262.7 448 192zM144 544C144 473.3 201.3 416 272 416L368 416C438.7 416 496 473.3 496 544L496 552C496 565.3 506.7 576 520 576C533.3 576 544 565.3 544 552L544 544C544 446.8 465.2 368 368 368L272 368C174.8 368 96 446.8 96 544L96 552C96 565.3 106.7 576 120 576C133.3 576 144 565.3 144 552L144 544z"/></svg>
                </button>
              {isUserMenuOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10">
                  <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-green-500 dark:hover:text-white">
                    Log out
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderProject;