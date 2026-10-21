import './modules'; // registers all pluggable functional modules
import { CartProvider } from './modules/cart';
import { HomeContainer } from './containers/HomeContainer';
import './App.scss';

function App() {
  return (
    <CartProvider>
      <HomeContainer />
    </CartProvider>
  );
}

export default App;
