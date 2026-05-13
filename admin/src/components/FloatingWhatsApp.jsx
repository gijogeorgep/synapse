import React from "react";

const FloatingWhatsApp = () => {
  return (
    <a
      href="https://wa.me/918157930567"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Synapse Connect on WhatsApp"
      className="fixed bottom-6 right-6 z-[70] group"
    >
      <div className="absolute inset-0 rounded-full bg-emerald-500/30 blur-xl animate-pulse" />
      <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-[#25D366] text-white shadow-[0_14px_28px_rgba(37,211,102,0.28)] transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-105">
        <svg
          viewBox="0 0 32 32"
          aria-hidden="true"
          className="h-6 w-6 fill-current"
        >
          <path d="M19.11 17.21c-.29-.15-1.69-.83-1.95-.92-.26-.1-.45-.15-.64.15-.19.29-.74.92-.91 1.11-.17.2-.33.22-.62.08-.29-.15-1.22-.45-2.33-1.43-.86-.77-1.45-1.72-1.62-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.33.44-.49.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.52-.07-.15-.64-1.55-.88-2.12-.23-.55-.46-.48-.64-.49h-.54c-.2 0-.52.07-.79.37-.27.29-1.04 1.01-1.04 2.46s1.06 2.86 1.21 3.06c.15.2 2.08 3.17 5.03 4.45.7.3 1.25.48 1.67.61.7.22 1.33.19 1.83.12.56-.08 1.69-.69 1.93-1.35.24-.66.24-1.23.17-1.35-.06-.12-.25-.19-.54-.33Z" />
          <path d="M16.03 3.2c-6.99 0-12.67 5.67-12.67 12.66 0 2.22.58 4.39 1.68 6.29L3 29l7.06-1.85a12.64 12.64 0 0 0 5.97 1.52h.01c6.98 0 12.66-5.68 12.66-12.66 0-3.39-1.32-6.57-3.72-8.96A12.57 12.57 0 0 0 16.03 3.2Zm0 23.33h-.01a10.55 10.55 0 0 1-5.38-1.47l-.38-.22-4.19 1.1 1.12-4.08-.25-.41a10.53 10.53 0 0 1-1.62-5.59c0-5.84 4.76-10.59 10.61-10.59 2.82 0 5.48 1.1 7.47 3.1a10.5 10.5 0 0 1 3.1 7.48c0 5.84-4.76 10.58-10.58 10.58Z" />
        </svg>
      </div>
    </a>
  );
};

export default FloatingWhatsApp;
