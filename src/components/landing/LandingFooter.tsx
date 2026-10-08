const footerSections = [
  {
    title: 'Secciones',
    links: [
      { label: 'Inicio', href: '#' },
      { label: 'Nosotros', href: '#nosotros' },
      { label: 'Contacto', href: '#' },
      { label: 'FAQ', href: '#' },
    ],
  },
  {
    title: 'Ecosistema',
    links: [
      { label: 'Campus', href: '#campus' },
      { label: 'Avatares', href: '#avatares' },
      { label: 'Planes', href: '/clubes#planes' },
      { label: 'Blogs', href: '#' },
    ],
  },
];

const LandingFooter = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-100 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div>
            {/* Orange "N" logo */}
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
              <span className="text-white text-xl font-heading font-bold">N</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Plataforma digital diseñada para chicos de 8 a 16 años
            </p>
          </div>

          {/* Navigation columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-heading font-semibold text-[#363636] mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-secondary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Founder column */}
          <div>
            <p className="text-sm font-heading font-semibold text-[#363636] mb-1">
              Jorge Juarez,
            </p>
            <p className="text-sm text-muted-foreground">
              Founder & Director de NetiaTeam
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
