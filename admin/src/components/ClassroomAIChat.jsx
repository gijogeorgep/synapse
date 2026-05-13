import React, { useState } from "react";
import { MessageCircle, Send } from "lucide-react";

const ClassroomAIChat = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", text: "Hi! Ask the classroom AI for hints, explanations, or solved steps." },
  ]);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { role: "user", text: chatInput.trim() },
      { role: "assistant", text: "Thinking..." },
    ]);
    setChatInput("");
    setTimeout(() => {
      setChatMessages((prev) => {
        const replaced = prev.slice(0, -1);
        return [
          ...replaced,
          { role: "assistant", text: "Placeholder response until your backend routes the question to Gemini/CoT." },
        ];
      });
    }, 700);
  };

  return (
    <div className="fixed bottom-10 right-6 z-50 flex flex-col items-end gap-4">
      {chatOpen && (
        <div className="w-80 max-w-xs bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl text-slate-900 flex flex-col overflow-hidden">
          <div className="px-5 py-3 bg-cyan-500/10 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Classroom AI Tutor</p>
              <p className="text-xs text-slate-500">Visible only inside the classroom workspace</p>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-slate-500 hover:text-slate-800 focus:outline-none"
              aria-label="Close classroom chat"
            >
              ✕
            </button>
          </div>
          <div className="px-4 py-3 space-y-3 h-[230px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent flex flex-col">
            {chatMessages.map((message, idx) => (
              <div
                key={`${message.role}-${idx}`}
                className={`rounded-2xl px-3 py-2 text-sm leading-relaxed max-w-[85%] ${
                  message.role === "assistant"
                    ? "bg-slate-100 text-slate-900 self-start"
                    : "bg-sky-600 text-white self-end"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>
          <form
            className="px-4 py-3 border-t border-slate-100"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Need a hint? Ask here..."
                className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <button
                type="submit"
                className="h-10 w-10 rounded-full bg-cyan-600 text-white grid place-items-center hover:bg-cyan-500 transition"
                aria-label="Send classroom question"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] mt-2">
              Powered by Gemini/CoT (backend hookup pending)
            </p>
          </form>
        </div>
      )}
      <button
        onClick={() => setChatOpen((open) => !open)}
        className="h-14 w-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-2xl flex items-center justify-center border border-white/40"
        aria-label="Toggle classroom AI chat"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
};

export default ClassroomAIChat;
