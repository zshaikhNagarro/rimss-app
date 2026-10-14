import { Link } from 'react-router-dom';
import type { ModulePlugin } from '../../plugins/PluginRegistry';
import { useCart } from '../../modules/cart';
import { NotificationToggle } from '../NotificationToggle';
import { Button } from '../ui';
import './Header.scss';

export function Header({
  modules,
  onCartClick,
}: {
  modules: ModulePlugin[];
  onCartClick: () => void;
}) {
  const { itemCount } = useCart();

  return (
    <header className="header">
      <Link to="/" className="header__brand">
        RIMSS <span>YCompany</span>
      </Link>

      <nav className="header__nav">
        {modules
          .filter((m) => !m.hideFromNav)
          .map((m) => (
            <Link key={m.id} to={m.route}>
              {m.navLabel}
            </Link>
          ))}
      </nav>

      <NotificationToggle />

      <Button variant="outline" onClick={onCartClick} aria-label="Open cart">
        Cart ({itemCount})
      </Button>
    </header>
  );
}
