import { Link } from "react-router-dom";
import ContactDialog from "./ContactDialog";

export default function Topbar() {
  return (
    <header className="fixed top-0 w-screen h-15 flex items-center justify-between bg-gray-900 px-4 py-3 z-50 text-white border-b border-gray-700">
        <Link to="/" className="text-xl font-bold">CONNexus</Link>
        <ContactDialog></ContactDialog>
    </header>
  );
}