import { ChevronLeftIcon } from "@heroicons/react/16/solid";
import { Bars3Icon } from "@heroicons/react/16/solid";
import { Link } from "react-router-dom";

type SidebarProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Sidebar({ open, setOpen }: SidebarProps) {
	
  return (
    <div>
      {/* Sidebar */}
      {open && (
        <aside className={`fixed left-0 top-15 h-full w-64 border-r bg-gray-900 border-gray-700 text-white z-40`}>
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
          className="fixed top-15 p-2 w-12 h-12 mx-1 my-1 z-50 rounded text-white cursor-pointer shadow"
        >
          <Bars3Icon></Bars3Icon>
        </button>
      )}
    </div>
  )
}