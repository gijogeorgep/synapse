import React, { useState } from "react";

const Contact = () => {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("https://formspree.io/f/xovnoadv", {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        setStatus("success");
        form.reset();
        setTimeout(() => setStatus(""), 4000); // auto-hide after 4s
      } else {
        const data = await response.json();
        if (data.errors) {
          setStatus(data.errors.map((err) => err.message).join(", "));
        } else {
          setStatus("error");
        }
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }

    setLoading(false);
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center px-6 py-10 overflow-hidden bg-cyan-50">
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=1172&auto=format&fit=crop"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/50 to-cyan-700/40"></div>

      {/* Decorative Circles */}
      <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-cyan-200 rounded-full opacity-30 blur-3xl animate-pulse"></div>
      <div className="absolute -top-20 -right-10 w-72 h-72 bg-cyan-300 rounded-full opacity-30 blur-3xl animate-ping"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-6 md:p-10 flex flex-col md:flex-row gap-10">
        {/* Contact Form */}
        <div className="flex-1 max-h-[90vh] overflow-auto">
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
              <label className="text-gray-100 font-medium mb-1">
                Your Name
              </label>
              <input
                type="text"
                name="name"
                aria-label="Your Name"
                className="p-3 rounded-xl border border-white/40 bg-white/10 text-white placeholder-white focus:ring-2 focus:ring-cyan-400"
                placeholder="Enter your name"
                required
              />
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="text-gray-100 font-medium mb-1">
                Your Email
              </label>
              <input
                type="email"
                name="email"
                aria-label="Your Email"
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
                aria-label="Subject"
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
                aria-label="Message"
                className="p-3 rounded-xl border border-white/40 bg-white/10 text-white placeholder-white focus:ring-2 focus:ring-cyan-400"
                placeholder="Write your message..."
                required
              ></textarea>
            </div>

            {/* Submit */}
            <div className="md:col-span-2 flex flex-col items-center mt-4">
              <button
                type="submit"
                disabled={loading}
                className={`${
                  loading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-cyan-700 hover:bg-cyan-800"
                } text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:scale-105 transition transform duration-300`}
              >
                {loading ? "Sending..." : "Send Message"}
              </button>

              {/* Status Message */}
              {status && (
                <p
                  className={`mt-3 font-medium ${
                    status === "success"
                      ? "text-green-300"
                      : status === "error"
                      ? "text-red-400"
                      : "text-yellow-300"
                  }`}
                >
                  {status === "success"
                    ? "✅ Message sent successfully!"
                    : status === "error"
                    ? "❌ Oops! Something went wrong."
                    : status}
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Social Media Section */}
        <div className="flex flex-col items-center justify-center space-y-6 w-full md:w-1/3">
          <h3 className="text-2xl font-semibold text-white mb-4">
            Connect with us
          </h3>
          <div className="flex flex-wrap justify-center gap-6">
            <a
              href="https://www.instagram.com/synapse_edu.hub?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://img.icons8.com/color/48/instagram-new--v1.png"
                alt="Instagram"
                className="hover:scale-110 transition-transform"
              />
            </a>
            <a
              href="https://www.facebook.com/share/1KBy2iguoK/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://img.icons8.com/color/48/facebook-new.png"
                alt="Facebook"
                className="hover:scale-110 transition-transform"
              />
            </a>
            <a
              href="https://www.linkedin.com/in/synapse-edu-hub-9b788b371?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://img.icons8.com/color/48/linkedin.png"
                alt="LinkedIn"
                className="hover:scale-110 transition-transform"
              />
            </a>
            <a
              href="https://wa.me/8157930567"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://img.icons8.com/color/48/whatsapp.png"
                alt="WhatsApp"
                className="hover:scale-110 transition-transform"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
