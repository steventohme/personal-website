import { useRef, KeyboardEvent } from "react";
import { useChat } from "../hooks/useChat";

interface UIProps {
  hidden?: boolean;
}

export const UI = ({ hidden }: UIProps) => {
  const input = useRef<HTMLInputElement>(null);
  const { chat, loading, message } = useChat();

  const sendMessage = () => {
    const text = input.current?.value;
    if (!loading && !message && text) {
      chat(text);
      if (input.current) input.current.value = "";
    }
  };

  if (hidden) {
    return null;
  }

  return (
    <>
      <div className="background-text"></div>
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
        <div className="w-full flex flex-col items-end justify-center gap-4"></div>
        <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
          <input
            className="w-full placeholder:text-gray-800 placeholder:italic p-3 rounded-md bg-opacity-50 bg-white backdrop-blur-md"
            placeholder="Talk to Steven..."
            ref={input}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
          <button
            disabled={loading || !!message}
            onClick={sendMessage}
            className={`bg-stone-300 hover:bg-stone-400 text-black p-3 px-10 font-semibold uppercase rounded-md ${
              loading || message ? "cursor-not-allowed opacity-30" : ""
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
};

