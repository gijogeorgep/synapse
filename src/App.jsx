import "./App.css";
import About from "./components/About";
import Contact from "./components/Contact";
import Crescent from "./components/Crescent";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";

import Program from "./components/Program";
import QuestionPaperCard from "./components/QuestionPaperCard";
import VideoCard from "./components/VideoCard";

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
      <VideoCard />
     
      <section id="contact" className="scroll-mt-24">
        <Contact />
      </section>
     <Crescent />
      <Footer />

    </>
  );
}

export default App;
