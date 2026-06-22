import { Link } from 'wouter';
import { Mail } from 'lucide-react';
import { s } from './Footer.styles';

const FOOTER_STYLE = {
  backgroundColor: '#5d0016',
  backgroundImage: 'repeating-linear-gradient(90deg, #5d0016 0%, #800020 5%, #5d0016 10%)',
};

export function Footer() {
  return (
    <footer className={s.footer} style={FOOTER_STYLE}>
      <div className={s.texture1} />
      <div className={s.texture2} />

      <div className={s.inner}>
        <div className={s.content}>
          <div className={s.logoWrapper}>
            <img src="/img/krkLOGO.png" alt="Kraków Logo" className={s.logo} />
          </div>

          <nav className={s.nav}>
            <Link href="/" className={s.navLink}>Repertuar</Link>
            <span className={s.navSeparator}>|</span>
            <Link href="/calendar" className={s.navLink}>Kalendarz</Link>
            <span className={s.navSeparator}>|</span>
            <Link href="/account" className={s.navLink}>Konto</Link>
          </nav>

          <div className={s.contactCol}>
            <div className={s.contactLabel}>Kontakt</div>
            <a href="mailto:maryia.babinskaya@student.uj.edu.pl" className={s.contactLink}>
              <Mail className={s.contactIcon} />
              <span className={s.contactEmail}>maryia.babinskaya@student.uj.edu.pl</span>
            </a>
          </div>
        </div>

        <div className={s.bottom}>
          <p className={s.copyright}>
            &copy; {new Date().getFullYear()} Krakowska Lornetka — Wszelkie prawa zastrzeżone
          </p>
          <p className={s.dedication}>Pamięci dr. inż. Jarosława Hryszko</p>
        </div>
      </div>
    </footer>
  );
}
