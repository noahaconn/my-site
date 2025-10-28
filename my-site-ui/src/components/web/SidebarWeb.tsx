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
        <aside className={`fixed left-0 sm:md:lg:top-15 ${open ? 'h-full' : ''} w-full sm:md:lg:w-64 border-r bg-gray-900 border-gray-700 text-white z-60 hidden sm:md:lg:block`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-bold">Contents</h2>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6"
            >
              <ChevronLeftIcon className="cursor-pointer"></ChevronLeftIcon>
            </button>
          </div>
          <nav className="p-4 space-y-2">
            <Link to="/" className="block rounded px-2 py-1 hover:bg-gray-800">
              Home
            </Link>
            <Link to="/bio" className="block rounded px-2 py-1 hover:bg-gray-800">
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
          className="fixed sm:md:lg:top-15 top-1 p-2 w-12 h-12 mx-1 my-1 z-10 rounded text-white cursor-pointer shadow hidden sm:md:lg:block"
        >
          <Bars3Icon></Bars3Icon>
        </button>
      )}
    </div>
  )
}