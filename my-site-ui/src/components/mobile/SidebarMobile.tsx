import { ChevronLeftIcon } from "@heroicons/react/16/solid";
import { Bars3Icon } from "@heroicons/react/16/solid";
import { Link } from "react-router-dom";

type SidebarProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function SidebarMobile({ open, setOpen }: SidebarProps) {
	
  return (
    <div>
      {/* Sidebar */}
      {open && (
        <aside className={`fixed top-0 left-0 ${open ? 'h-full' : ''} w-full border-r bg-white dark:bg-gray-900 border-gray-400 text-gray-700 dark:border-gray-700 dark:text-white z-60 sm:md:lg:hidden`}>
          <div className="flex items-center justify-between px-4 p-4 border-b border-gray-400 dark:border-gray-700">
            <h2 className="text-lg font-bold">Contents</h2>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6"
            >
              <ChevronLeftIcon className="cursor-pointer text-gray-600 dark:text-white"></ChevronLeftIcon>
            </button>
          </div>
          <nav className="p-4 space-y-2">
            <Link to="/" onClick={() => setOpen(false)} className="block rounded px-2 py-1">
              Home
            </Link>
            <Link to="/bio" onClick={() => setOpen(false)} className="block rounded px-2 py-1">
              Bio
            </Link>
            <Link to="#" className="block rounded px-2 py-1">
              More Coming Soon...
            </Link>
          </nav>
        </aside>
      )}

      {/* Reopen button*/}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-1 p-2 w-12 h-12 left-1 my-1 z-40 rounded text-gray-900 dark:text-white cursor-pointer sm:md:lg:hidden"
        >
          <Bars3Icon></Bars3Icon>
        </button>
      )}
    </div>
  )
}