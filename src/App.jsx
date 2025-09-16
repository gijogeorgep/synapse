import "./App.css";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";

import Program from "./components/Program";

function App() {
  return (
    <>
      <Navbar />
      <section id="home" className="scroll-mt-24">
        <Hero />
      </section>
      <section id="programs" className="scroll-mt-24">
        <Program />
      </section>
      <section id="about" className="scroll-mt-24">
        <About />
      </section>
      <section id="contact" className="scroll-mt-24">
        <Contact />
      </section>
      <Footer />
    </>
  );
}

export default App;
