"use client";

import { RxGithubLogo } from "react-icons/rx";

export default function Footer(){
    return (
        <footer className="pb-2 px-8 lg:px-16 w-full">
          <div className="flex justify-between items-center">
            <div className="hidden sm:flex items-center gap-2">
              <p className="text-sm lg:text-base">hello</p>
            </div>
            <div className="flex space-x-10 items-center">
              <div className="flex items-center gap-4">
              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                <RxGithubLogo className="w-6 h-6" />
              </a>
              </div>
            </div>
          </div>
        </footer>
    );
}