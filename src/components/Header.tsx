import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone, MessageCircle } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'الرئيسية', href: '#home' },
    { name: 'من نحن', href: '#about' },
    { name: 'خدماتنا', href: '#services' },
    { name: 'المبادرات', href: '#initiatives' },
    { name: 'الموسوعة القانونية', href: '#legal-guide' },
    { name: 'تواصل معنا', href: '#contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* الشعار */}
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/7e113086-7b5a-4d72-a9ed-62d1caf0ffec.png" 
              alt="شعار جمعية وفاء للخدمات القانونية للمرأة" 
              className="h-12 w-auto"
            />
          </div>

          {/* القائمة - شاشات كبيرة */}
          <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* أزرار التواصل السريع */}
          <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a href="#contact">
                <Phone className="w-4 h-4" />
                اتصل بنا
              </a>
            </Button>
            <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary" asChild>
              <a href="/auth">
                <MessageCircle className="w-4 h-4" />
                استشارة فورية
              </a>
            </Button>
          </div>

          {/* زر القائمة - الجوال */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* القائمة المنسدلة - الجوال */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-foreground hover:text-primary transition-colors font-medium text-right py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <a href="#contact">
                    <Phone className="w-4 h-4" />
                    اتصل بنا
                  </a>
                </Button>
                <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-primary-light" asChild>
                  <a href="/auth">
                    <MessageCircle className="w-4 h-4" />
                    استشارة فورية
                  </a>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;