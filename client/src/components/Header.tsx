import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useCurtainNavigation } from '@/components/CurtainTransition';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { s } from './Header.styles';

export function Header() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { navigateWithCurtain } = useCurtainNavigation();

  const leftNavItems = [
    { label: 'Repertuar', href: '/' },
    { label: 'Kalendarz', href: '/calendar' },
  ];

  const rightNavItems = [
    { label: 'Teatralna Plotka', href: '/plotka' },
    { label: 'Rekomendacje', href: '/recommendations' },
  ];

  const currentPath = location.split('?')[0];
  const navLinkClass = (href: string) =>
    cn(
      s.navLinkBase,
      (href === '/' ? currentPath === '/' : currentPath.startsWith(href))
        ? s.navLinkActive
        : s.navLinkInactive,
    );

  return (
    <header className={s.header}>
      <div className={s.inner}>
        <nav className={s.leftNav}>
          {leftNavItems.map((item) => (
            <button
              key={item.href}
              onClick={() => navigateWithCurtain(item.href)}
              className={navLinkClass(item.href)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={() => navigateWithCurtain('/')}
          className={s.logoBtn}
        >
          <img
            src="/img/logo.png"
            alt="Krakowskie Teatry"
            className={s.logoImg}
          />
        </button>

        <nav className={s.rightNav}>
          {rightNavItems.map((item) => (
            <button
              key={item.href}
              onClick={() => navigateWithCurtain(item.href)}
              className={navLinkClass(item.href)}
            >
              {item.label}
            </button>
          ))}

          <div className={s.userSection}>
            {user ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateWithCurtain('/account')}
                className={cn(
                  s.avatarBtn,
                  location === '/account' && s.avatarBtnActive,
                )}
              >
                <div className={s.avatarInner}>
                  <img
                    src={user.avatarUrl || '/img/logoUSER.png'}
                    alt="Avatar"
                    className={cn(s.avatarImg, !user.avatarUrl && s.avatarImgDefault)}
                  />
                </div>
              </Button>
            ) : (
              <a href="/api/login">
                <Button variant="ghost" size="icon" className={s.guestBtn}>
                  <div className={s.guestAvatarInner}>
                    <img
                      src="/img/unloginAccount.png"
                      alt="Login"
                      className={s.guestAvatarImg}
                    />
                  </div>
                </Button>
              </a>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
