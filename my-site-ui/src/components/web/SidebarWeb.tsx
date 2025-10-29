import { ChevronLeftIcon } from "@heroicons/react/16/solid";
import { Bars3Icon } from "@heroicons/react/16/solid";
import { Link } from "react-router-dom";

type SidebarProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function SidebarWeb({ open, setOpen }: SidebarProps) {
	
  return (
    <div>
      {/* Sidebar */}
      {open && (
        <aside className={`fixed left-0 pt-15 ${open ? 'h-full' : ''} w-64 border-r bg-white dark:bg-gray-900 border-gray-400 text-gray-700 dark:border-gray-700 dark:text-white z-60 hidden shadow-lg sm:md:lg:block`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-400 dark:border-gray-700">
            <h2 className="text-lg font-bold">Contents</h2>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6"
            >
              <ChevronLeftIcon className="cursor-pointer text-gray-600 dark:text-white"></ChevronLeftIcon>
            </button>
          </div>
          <nav className="p-4 space-y-2">
            <Link to="/" className="block rounded px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800">
              Home
            </Link>
            <Link to="/bio" className="block rounded px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800">
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
          className="fixed top-15 w-8 h-8 m-3 z-10 text-gray-90 hover:text-gray-500 dark:text-white cursor-pointer hidden sm:md:lg:block"
        >
          <Bars3Icon></Bars3Icon>
        </button>
      )}
    </div>
  )
}