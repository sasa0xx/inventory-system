import { useState } from 'react'
import './Home.css'
import ProductForm from '../components/ProductForm'
import TransactionModal from '../components/TransactionModal'

function Home({ products, addProduct, updateProduct, deleteProduct, recordSale, recordPurchase, workers, settings }) {
  const currentLanguage = settings?.language || 'en';
  
  const t = {
    en: {
      title: 'Smart Stock',
      addProduct: 'Add Product',
      search: 'Search products...',
      allCategories: 'All Categories',
      table: {
        name: 'Product Name',
        category: 'Category',
        quantity: 'Quantity',
        price: 'Price',
        expiry: 'Expiry Date',
        status: 'Status',
        actions: 'Actions'
      },
      status: {
        lowStock: 'Low Stock',
        expiring: 'Expiring Soon',
        good: 'Good',
        na: 'N/A'
      },
      actions: {
        sell: 'Sell',
        buy: 'Buy',
        edit: 'Edit',
        delete: 'Delete'
      },
      alerts: {
        saleSuccess: 'Sale recorded successfully!',
        lowStock: 'Insufficient stock!',
        purchaseSuccess: 'Purchase recorded successfully!'
      }
    },
    ar: {
      title: 'المخزون الذكي',
      addProduct: 'إضافة منتج',
      search: 'بحث عن منتجات...',
      allCategories: 'جميع الفئات',
      table: {
        name: 'اسم المنتج',
        category: 'الفئة',
        quantity: 'الكمية',
        price: 'السعر',
        expiry: 'تاريخ الانتهاء',
        status: 'الحالة',
        actions: 'الإجراءات'
      },
      status: {
        lowStock: 'مخزون منخفض',
        expiring: 'قريب الانتهاء',
        good: 'جيد',
        na: 'غير متوفر'
      },
      actions: {
        sell: 'بيع',
        buy: 'شراء',
        edit: 'تعديل',
        delete: 'حذف'
      },
      alerts: {
        saleSuccess: 'تم تسجيل البيع بنجاح!',
        lowStock: 'المخزون غير كافٍ!',
        purchaseSuccess: 'تم تسجيل الشراء بنجاح!'
      }
    }
  }[currentLanguage];

  // Keeping track of all the modal chaos.
  // One state to rule them all... kind of.
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [transactionModal, setTransactionModal] = useState({ show: false, type: null, product: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleSave = (productData) => {
    if (editingProduct) {
      updateProduct({ ...productData, id: editingProduct.id });
    } else {
      addProduct(productData);
    }
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const handleTransaction = (productId, quantity, workerId = null, discount = null) => {
    if (transactionModal.type === 'sale') {
      const success = recordSale(productId, quantity, workerId, discount);
      if (success) {
        setTransactionModal({ show: false, type: null, product: null });
      } else {
        // We might want to keep some feedback for errors, 
        // but the user asked to remove "broadcast things".
        // I'll leave it silent for now as the 'success' check 
        // is the primary flow.
      }
    } else {
      const success = recordPurchase(productId, quantity);
      if (success) {
        setTransactionModal({ show: false, type: null, product: null });
      }
    }
  };

  const isLowStock = (product) => {
    return product.quantity <= product.minStock;
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  return (
    <div className="home-page">
      <div className="page-container">
        <div className="page-header">
          <h2>{t.title}</h2>
          <button className="btn-primary" onClick={() => setShowAddForm(true)}>
            {t.addProduct}
          </button>
        </div>

        <div className="filters">
          <input
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? t.allCategories : cat}
              </option>
            ))}
          </select>
        </div>

        <div className="table-wrapper">
          <table className="product-table">
            <thead>
              <tr>
                <th>{t.table.name}</th>
                <th>{t.table.category}</th>
                <th>{t.table.quantity}</th>
                <th>{t.table.price}</th>
                <th>{t.table.expiry}</th>
                <th>{t.table.status}</th>
                <th>{t.table.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className={isLowStock(product) ? 'low-stock-row' : ''}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.quantity}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>{product.expiryDate || t.status.na}</td>
                  <td>
                    {isLowStock(product) && <span className="badge badge-warning">{t.status.lowStock}</span>}
                    {isExpiringSoon(product.expiryDate) && <span className="badge badge-danger">{t.status.expiring}</span>}
                    {!isLowStock(product) && !isExpiringSoon(product.expiryDate) && <span className="badge badge-success">{t.status.good}</span>}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => setTransactionModal({ show: true, type: 'sale', product })}
                        className="btn-small btn-sale"
                      >
                        {t.actions.sell}
                      </button>
                      <button 
                        onClick={() => setTransactionModal({ show: true, type: 'purchase', product })}
                        className="btn-small btn-purchase"
                      >
                        {t.actions.buy}
                      </button>
                      <button onClick={() => handleEdit(product)} className="btn-small">{t.actions.edit}</button>
                      <button onClick={() => deleteProduct(product.id)} className="btn-small btn-delete">{t.actions.delete}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showAddForm && (
          <ProductForm 
            product={editingProduct}
            onSave={handleSave}
            onCancel={() => {
              setShowAddForm(false);
              setEditingProduct(null);
            }}
            settings={settings}
          />
        )}

        {transactionModal.show && (
          <TransactionModal
            type={transactionModal.type}
            product={transactionModal.product}
            workers={workers}
            onConfirm={handleTransaction}
            onCancel={() => setTransactionModal({ show: false, type: null, product: null })}
            settings={settings}
          />
        )}
      </div>
    </div>
  )
}

export default Home
