import { ClipboardIcon } from "@heroicons/react/16/solid";
import { useState, useRef, useEffect } from "react";

export default function ContactDialog() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const phone = "+1 (309) 660-4623";
  const email = "noahconn2020@gmail.org";
	const linkedIn = "https://www.linkedin.com/in/noah-conn-b943a8204/";

	useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Copy value
  const handleCopy = (value: string) => {
		navigator.clipboard.writeText(value);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};


  return (
		<div>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed rounded-lg right-13 sm:md:lg:right-3 mt-1 h-8 w-30 cursor-pointer bg-gradient-to-r text-white from-orange-300 via-orange-400 to-orange-500 hover:from-orange-400 hover:via-orange-500 hover:to-orange-600 shadow-sm px-3 py-1"
      >
        Contact Me
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center dark:text-white bg-black/50 z-100">
          <div
            ref={dialogRef}
            className="rounded-xl p-6 bg-white dark:bg-gray-800 shadow-xl w-80 text-center relative"
          >
            <h2 className="text-xl font-semibold mb-4">Contact Info</h2>

            {/* Phone */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <a
                href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                className="text-blue-600 hover:underline block"
              >
                {phone}
              </a>
							<button
                onClick={() => handleCopy(phone)}
                className="cursor-pointer text-gray-400 dark:text-gray-500 hover:text-gray-300 dark:hover:text-gray-200 w-5"
                title="Copy phone number"
              >
                <ClipboardIcon></ClipboardIcon>
              </button>
            </div>

            {/* Email */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <a
                href={`mailto:${email}`}
                className="text-blue-600 hover:underline"
              >
                {email}
              </a>
              <button
                onClick={() => handleCopy(email)}
                className="cursor-pointer text-gray-400 dark:text-gray-500 hover:text-gray-300 dark:hover:text-gray-200 w-5"
                title="Copy email"
              >
                <ClipboardIcon></ClipboardIcon>
              </button>
            </div>

						{/* LinkedIn */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <a
                href="https://www.linkedin.com/in/noah-conn-b943a8204/"
								target="_blank"
  							rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                LinkedIn
              </a>
              <button
                onClick={() => handleCopy(linkedIn)}
                className="cursor-pointer text-gray-400 dark:text-gray-500 hover:text-gray-300 dark:hover:text-gray-200 w-5"
                title="Copy LinkedIn link"
              >
                <ClipboardIcon></ClipboardIcon>
              </button>
            </div>

            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="cursor-pointer mt-2 px-4 py-1 text-sm bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Close
            </button>
          </div>

          {/* Copied toast */}
          {copied && (
            <div className="absolute bottom-8 bg-white dark:bg-gray-800 text-gray-5=700 dark:text-white text-sm px-3 py-1 rounded-lg shadow">
              Contents copied to clipboard
            </div>
          )}
        </div>
      )}
    </div>
  );
}
