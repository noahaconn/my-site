import { ArrowUpIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { SparklesIcon } from "@heroicons/react/16/solid";
import React, { useState } from 'react';

const initMsg = "Hi, I'm CONNr, Noah's AI Assistant. I can answer your questions about Noah. I have access to a lot more information than can be included on the site, so ask me anything!";

type CONNrProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function CONNrMobile({ open, setOpen }: CONNrProps) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([{role: "assistant", content: initMsg}]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = 'https://r3uao1cq2a.execute-api.us-east-2.amazonaws.com/chat';

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const reply = data.reply || "No response.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error contacting API." },
      ]);
      console.log(err)
    } finally {
      setLoading(false);
    }
  }
	
  return (
    <div>
      {/* Sidebar */}
      {open && (
        <aside className={`fixed right-0 h-full w-full border-l bg-gray-900 border-gray-700 text-white z-50 sm:md:lg:hidden`}>
          <div className="flex items-center p-4 border-b border-gray-700">
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6"
            >
              <ChevronRightIcon className="cursor-pointer"></ChevronRightIcon>
            </button>
            <div className="ml-3">
              <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">CONNr</h2>
              <h3 className="text-gray-400 text-sm">Noah's AI Assistant</h3>
            </div>
          </div>
          <div className="flex flex-col overflow-y-auto h-full [scrollbar-color:#4b5563_#111827] [scrollbar-width:thin] pb-50 max-w-2xl mx-auto bg-gray-900">
            <div className="px-2 py-4 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl ${
                    m.role === "user"
                      ? "bg-gray-800 self-end justify-self-end text-right"
                      : "text-gray-300 self-start text-left"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {loading && <div className="px-2 text-gray-400">Thinking...</div>}
            </div>

            <form
              onSubmit={sendMessage}
              className="px-3 flex gap-2 fixed bottom-0 py-2 sm:md:lg:w-90"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Noah Conn..."
                className="flex-1 bg-gray-800 rounded-3xl px-4 py-2 focus:outline-none "
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r cursor-pointer from-orange-400 via-orange-500 to-orange-600 text-white px-2 py-2 rounded-3xl disabled:bg-gray-400"
              >
                <ArrowUpIcon className="w-6"></ArrowUpIcon>
              </button>
            </form>
          </div>
        </aside>
      )}

      {/* Reopen button*/}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-1 p-2 w-12 h-12 mx-1 ml-0 my-1 right-0 z-40 rounded text-white shadow cursor-pointer sm:md:lg:hidden"
        >
          <SparklesIcon className="cursor-pointer bg-gradient-to-r from-orange-300 via-orange-400 to-orange-500 hover:from-orange-400 hover:via-orange-500 hover:to-orange-600 text-white rounded p-1"></SparklesIcon>
        </button>
      )}
    </div>
  )
}