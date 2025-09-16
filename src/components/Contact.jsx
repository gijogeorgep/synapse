import React, { useState } from "react";

const Contact = () => {
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: new FormData(form),
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setStatus("Message sent successfully ✅");
        form.reset();
      } else {
        setStatus("Oops! Something went wrong ❌");
      }
    } catch (error) {
      console.log(error);

      setStatus("Error sending message ❌");
    }
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center px-6 py-10 overflow-hidden bg-cyan-50">
      {/* Background Image */}
      <img
        src="https://t4.ftcdn.net/jpg/05/28/18/33/240_F_528183362_LNnsGIjwej14jMc2GbOC8VFj9WmqjQ4g.webp"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/50 to-cyan-700/40"></div>

      {/* Decorative Circles */}
      <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-cyan-200 rounded-full opacity-30 blur-3xl animate-pulse"></div>
      <div className="absolute -top-20 -right-10 w-72 h-72 bg-cyan-300 rounded-full opacity-30 blur-3xl animate-ping"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-auto bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-6 md:p-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
          Contact Us
        </h2>
        <p className="text-gray-100 text-center mb-6">
          Have questions or want to know more? Get in touch with us today!
        </p>

        <form
          onSubmit={handleSubmit}
          action="https://formspree.io/f/xovnoadv"
          method="POST"
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
        >
          {/* Name */}
          <div className="flex flex-col">
            <label className="text-gray-100 font-medium mb-1">Your Name</label>
            <input
              type="text"
              name="name"
              className="p-3 rounded-xl border border-white/40 bg-white/10 text-white placeholder-white focus:ring-2 focus:ring-cyan-400"
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="text-gray-100 font-medium mb-1">Your Email</label>
            <input
              type="email"
              name="email"
              className="p-3 rounded-xl border border-white/40 bg-white/10 text-white placeholder-white focus:ring-2 focus:ring-cyan-400"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Subject */}
          <div className="flex flex-col md:col-span-2">
            <label className="text-gray-100 font-medium mb-1">Subject</label>
            <input
              type="text"
              name="subject"
              className="p-3 rounded-xl border border-white/40 bg-white/10 text-white placeholder-white focus:ring-2 focus:ring-cyan-400"
              placeholder="Enter subject"
            />
          </div>

          {/* Message */}
          <div className="flex flex-col md:col-span-2">
            <label className="text-gray-100 font-medium mb-1">Message</label>
            <textarea
              rows="4"
              name="message"
              className="p-3 rounded-xl border border-white/40 bg-white/10 text-white placeholder-white focus:ring-2 focus:ring-cyan-400"
              placeholder="Write your message..."
              required
            ></textarea>
          </div>

          {/* Submit */}
          <div className="md:col-span-2 flex flex-col items-center mt-4">
            <button
              type="submit"
              className="bg-cyan-700 hover:bg-cyan-800 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:scale-105 transition transform duration-300"
            >
              Send Message
            </button>

            {/* Success / Error Message */}
            {status && <p className="mt-3 text-white font-medium">{status}</p>}
          </div>
        </form>
      </div>
    </section>
  );
};

export default Contact;
