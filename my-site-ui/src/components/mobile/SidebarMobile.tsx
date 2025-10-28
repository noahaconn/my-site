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
        <aside className={`fixed left-0 ${open ? 'h-full' : ''} w-full border-r bg-gray-900 border-gray-700 text-white z-60 sm:md:lg:hidden`}>
          <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-700">
            <h2 className="text-lg font-bold">Contents</h2>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6"
            >
              <ChevronLeftIcon className="cursor-pointer"></ChevronLeftIcon>
            </button>
          </div>
          <nav className="p-4 space-y-2">
            <Link to="/" onClick={() => setOpen(false)} className="block rounded px-2 py-1 hover:bg-gray-800">
              Home
            </Link>
            <Link to="/bio" onClick={() => setOpen(false)} className="block rounded px-2 py-1 hover:bg-gray-800">
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
          className="fixed top-1 p-2 w-12 h-12 left-1 my-1 z-40 rounded text-white cursor-pointer shadow sm:md:lg:hidden"
        >
          <Bars3Icon></Bars3Icon>
        </button>
      )}
    </div>
  )
}