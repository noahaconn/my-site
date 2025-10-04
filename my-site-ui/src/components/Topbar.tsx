export default function Topbar() {
  return (
    <header className="fixed top-0 w-screen h-15 flex items-center justify-between bg-gray-900 px-4 py-3 z-50 text-white border-b border-gray-700">
        <h1 className="text-xl font-bold">CONNexus</h1>
        <button className="rounded-lg bg-amber-600 hover:bg-amber-700 px-3 py-1">Contact Me</button>
    </header>
  );
}