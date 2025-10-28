import { Link } from "react-router-dom";
import ContactDialog from "./ContactDialog";
import SidebarMobile from "./mobile/SidebarMobile";
import CONNrMobile from "./mobile/CONNrMobile";

type TopbarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  connrOpen: boolean;
  setConnrOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Topbar({ sidebarOpen, setSidebarOpen, connrOpen, setConnrOpen }: TopbarProps) {
  return (
    <header className="fixed top-0 w-screen h-15 flex bg-gray-900 px-4 py-3 z-80 text-white border-b border-gray-700">
        <SidebarMobile open={sidebarOpen} setOpen={setSidebarOpen}></SidebarMobile>
        <Link to="/" className="sm:md:lg:ml-0 mt-0 ml-9 text-3xl font-bold">CONNexus</Link>
        <ContactDialog></ContactDialog>
        <CONNrMobile open={connrOpen} setOpen={setConnrOpen}></CONNrMobile>
    </header>
  );
}