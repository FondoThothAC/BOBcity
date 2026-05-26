import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useScrollReveal } from './hooks';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Projects from './components/Projects';
import Propuestas from './components/Propuestas';
import Impact from './components/Impact';
import Sponsors from './components/Sponsors';
import Donations from './components/Donations';
import SocialFeed from './components/SocialFeed';
import Events from './components/Events';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';

// Componente principal del landing
function Landing() {
  useScrollReveal();
  
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <hr className="section-divider" />
        <About />
        <hr className="section-divider" />
        <Services />
        <hr className="section-divider" />
        <Projects />
        <hr className="section-divider" />
        <Propuestas />
        <hr className="section-divider" />
        <Impact />
        <hr className="section-divider" />
        <Sponsors />
        <hr className="section-divider" />
        <Donations />
        <hr className="section-divider" />
        <SocialFeed />
        <hr className="section-divider" />
        <Events />
        <hr className="section-divider" />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
