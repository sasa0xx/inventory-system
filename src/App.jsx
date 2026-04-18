import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import './App.css'

// Some fake data so the app doesn't look like a ghost town. 
// If this isn't enough, we might need a bigger monitor.
const initialProducts = [
  { id: 1, name: 'Laptop Dell XPS 15', category: 'Electronics', quantity: 12, price: 1299.99, costPrice: 1000.00, expiryDate: '2026-12-31', minStock: 5 },
  { id: 2, name: 'Office Chair', category: 'Furniture', quantity: 8, price: 299.99, costPrice: 200.00, expiryDate: null, minStock: 3 },
  { id: 3, name: 'Printer Paper A4', category: 'Office Supplies', quantity: 45, price: 8.99, costPrice: 5.00, expiryDate: '2025-06-30', minStock: 20 },
  { id: 4, name: 'USB-C Cable', category: 'Accessories', quantity: 23, price: 12.99, costPrice: 7.00, expiryDate: null, minStock: 10 },
  { id: 5, name: 'Wireless Mouse Logitech', category: 'Electronics', quantity: 15, price: 29.99, costPrice: 20.00, expiryDate: '2027-03-15', minStock: 8 },
  { id: 6, name: 'Notebook 100 pages', category: 'Office Supplies', quantity: 67, price: 3.49, costPrice: 1.50, expiryDate: null, minStock: 30 },
  { id: 7, name: 'LED Monitor 24"', category: 'Electronics', quantity: 5, price: 189.99, costPrice: 140.00, expiryDate: '2026-08-20', minStock: 4 },
  { id: 8, name: 'Desk Lamp', category: 'Furniture', quantity: 11, price: 45.99, costPrice: 30.00, expiryDate: null, minStock: 5 }
];

const initialWorkers = [
  { id: 1, name: 'John Smith', totalSales: 0, salesCount: 0 },
  { id: 2, name: 'Sarah Johnson', totalSales: 0, salesCount: 0 },
  { id: 3, name: 'Mike Chen', totalSales: 0, salesCount: 0 },
  { id: 4, name: 'Emma Davis', totalSales: 0, salesCount: 0 },
  { id: 5, name: 'Easter Egg', totalSales: 2, salesCount: 2},
];

function App() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [workers, setWorkers] = useState(() => {
    const saved = localStorage.getItem('workers');
    return saved ? JSON.parse(saved) : initialWorkers;
  });

  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem('sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [purchases, setPurchases] = useState(() => {
    const saved = localStorage.getItem('purchases');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('ui-settings');
    return saved ? JSON.parse(saved) : {
      accentColor: '#8b5cf6',
      theme: 'dark',
      language: 'en',
      dashboardVisibility: {
        ai: true,
        stats: true,
        charts: true,
        workers: true,
        recentSales: true,
        lowStock: true
      }
    };
  });

  const [alarms, setAlarms] = useState(() => {
    const saved = localStorage.getItem('alarms');
    return saved ? JSON.parse(saved) : [];
  });

  const playAlarmSound = () => {
    // Generate a clean beep sound using the Web Audio API. 
    // No external files = No broken links or loading delays.
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // High A note
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.log("Audio Context blocked by browser");
    }
  };

  const addAlarm = (message, type = 'info') => {
    const newAlarm = {
      id: Date.now(),
      message,
      type,
      date: new Date().toISOString(),
      read: false
    };
    setAlarms(prev => [newAlarm, ...prev].slice(0, 20)); // Keep last 20
    playAlarmSound();
  };

  useEffect(() => {
    localStorage.setItem('alarms', JSON.stringify(alarms));
  }, [alarms]);

  useEffect(() => {
    // Paint the walls with the user's favorite theme.
    // Darkness is my ally.
    document.body.className = settings.theme + '-theme';
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = settings.language;

    // Math for colors. Don't ask me how this works, I'm just a dev.
    // If it breaks, I'm becoming a gardener.
    const adjustColor = (hex, amount) => {
        let usePound = false;
        if (hex[0] === "#") { hex = hex.slice(1); usePound = true; }
        const num = parseInt(hex, 16);
        let r = (num >> 16) + amount; if (r > 255) r = 255; else if (r < 0) r = 0;
        let g = ((num >> 8) & 0x00FF) + amount; if (g > 255) g = 255; else if (g < 0) g = 0;
        let b = (num & 0x0000FF) + amount; if (b > 255) b = 255; else if (b < 0) b = 0;
        return (usePound ? "#" : "") + (b | (g << 8) | (r << 16)).toString(16).padStart(6, '0');
    }

    const hexToRgb = (hex) => {
        if (hex[0] === "#") hex = hex.slice(1);
        const num = parseInt(hex, 16);
        return `${(num >> 16)}, ${((num >> 8) & 0x00FF)}, ${(num & 0x0000FF)}`;
    }

    document.documentElement.style.setProperty('--accent-primary', settings.accentColor);
    document.documentElement.style.setProperty('--accent-primary-rgb', hexToRgb(settings.accentColor));
    document.documentElement.style.setProperty('--accent-primary-hover', adjustColor(settings.accentColor, -20));
    document.documentElement.style.setProperty('--accent-primary-light', adjustColor(settings.accentColor, 40));
    localStorage.setItem('ui-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('workers', JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem('sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('purchases', JSON.stringify(purchases));
  }, [purchases]);

  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now(),
      quantity: parseInt(product.quantity),
      price: parseFloat(product.price),
      costPrice: parseFloat(product.costPrice || product.price * 0.7),
      minStock: parseInt(product.minStock)
    };
    setProducts([...products, newProduct]);
    addAlarm(`Product Added: ${newProduct.name}`, 'success');
  };

  const updateProduct = (updatedProduct) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    addAlarm(`Product Updated: ${updatedProduct.name}`, 'info');
  };

  const deleteProduct = (id) => {
    const product = products.find(p => p.id === id);
    setProducts(products.filter(p => p.id !== id));
    if (product) addAlarm(`Product Deleted: ${product.name}`, 'warning');
  };

  const recordSale = (productId, quantity, workerId, discount = { value: 0, type: 'amount', total: 0 }) => {
    const product = products.find(p => p.id === productId);
    if (!product || product.quantity < quantity) return false;

    // Update product quantity
    setProducts(products.map(p => {
      if (p.id === productId) {
        const newQty = p.quantity - quantity;
        if (newQty <= p.minStock) {
          addAlarm(`Low Stock: ${p.name} (${newQty} left)`, 'warning');
        }
        return { ...p, quantity: newQty };
      }
      return p;
    }));

    // Update worker stats
    const saleAmount = discount.total || (product.price * quantity);
    const workerName = workers.find(w => w.id === workerId).name;
    addAlarm(`New Sale: ${product.name} x${quantity} by ${workerName} (Total: $${saleAmount.toFixed(2)})`, 'success');

    setWorkers(workers.map(w => 
      w.id === workerId 
        ? { ...w, totalSales: w.totalSales + saleAmount, salesCount: w.salesCount + 1 }
        : w
    ));

    // Record sale
    const sale = {
      id: Date.now(),
      productId,
      productName: product.name,
      quantity,
      price: product.price,
      total: saleAmount,
      discount: discount.value > 0 ? { value: discount.value, type: discount.type } : null,
      workerId,
      workerName,
      date: new Date().toISOString()
    };
    setSales([...sales, sale]);

    return true;
  };

  const recordPurchase = (productId, quantity) => {
    const product = products.find(p => p.id === productId);
    if (!product) return false;

    // Update product quantity
    setProducts(products.map(p => 
      p.id === productId ? { ...p, quantity: p.quantity + quantity } : p
    ));

    addAlarm(`Stock Replenished: ${product.name} (+${quantity})`, 'info');

    // Record purchase
    const purchase = {
      id: Date.now(),
      productId,
      productName: product.name,
      quantity,
      price: product.price,
      total: product.price * quantity,
      date: new Date().toISOString()
    };
    setPurchases([...purchases, purchase]);

    return true;
  };

  return (
    <div className="app">
      <Navbar settings={settings} setSettings={setSettings} alarms={alarms} setAlarms={setAlarms} />
      <Routes>
        <Route path="/" element={
          <Home 
            products={products}
            addProduct={addProduct}
            updateProduct={updateProduct}
            deleteProduct={deleteProduct}
            recordSale={recordSale}
            recordPurchase={recordPurchase}
            workers={workers}
            settings={settings}
          />
        } />
        <Route path="/dashboard" element={
          <Dashboard 
            products={products}
            workers={workers}
            sales={sales}
            purchases={purchases}
            settings={settings}
            addAlarm={addAlarm}
          />
        } />
      </Routes>
    </div>
  )
}

export default App
