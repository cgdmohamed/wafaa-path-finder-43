import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import About from '@/components/About';
import Initiatives from '@/components/Initiatives';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen" dir="rtl">
      <Header />
      <main>
        <Hero />
        <Services />
        <About />
        <Initiatives />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
