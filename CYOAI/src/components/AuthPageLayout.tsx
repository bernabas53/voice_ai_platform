import React from "react";
// If you want, you can copy GridShape and ThemeTogglerTwo from the template later
// import GridShape from "./GridShape";
// import ThemeTogglerTwo from "./ThemeTogglerTwo";

export default function AuthPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-blue-950 dark:bg-white/5 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            {/* Placeholder for GridShape */}
            <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-3xl" />
            <div className="flex flex-col items-center max-w-xs">
              <a href="/" className="block mb-4">
                <img
                  width={231}
                  height={48}
                  src="/images/logo/auth-logo.svg"
                  alt="Logo"
                />
              </a>
              <p className="text-center text-gray-400 dark:text-white/60">
                Welcome to Customize Your Own AI
              </p>
            </div>
          </div>
        </div>
        {/* Placeholder for ThemeTogglerTwo */}
        {/* <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div> */}
      </div>
    </div>
  );
}
