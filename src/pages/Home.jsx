import { useState } from 'react'
import './Home.css'
import ProductForm from '../components/ProductForm'
import TransactionModal from '../components/TransactionModal'

function Home({ products, addProduct, updateProduct, deleteProduct, recordSale, recordPurchase, workers }) {
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

  const handleTransaction = (productId, quantity, workerId = null) => {
    if (transactionModal.type === 'sale') {
      const success = recordSale(productId, quantity, workerId);
      if (success) {
        alert('Sale recorded successfully!');
        setTransactionModal({ show: false, type: null, product: null });
      } else {
        alert('Insufficient stock!');
      }
    } else {
      const success = recordPurchase(productId, quantity);
      if (success) {
        alert('Purchase recorded successfully!');
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
          <h2>Smart Stock</h2>
          <button className="btn-primary" onClick={() => setShowAddForm(true)}>
            Add Product
          </button>
        </div>

        <div className="filters">
          <input
            type="text"
            placeholder="Search products..."
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
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        <div className="table-wrapper">
          <table className="product-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className={isLowStock(product) ? 'low-stock-row' : ''}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.quantity}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>{product.expiryDate || 'N/A'}</td>
                  <td>
                    {isLowStock(product) && <span className="badge badge-warning">Low Stock</span>}
                    {isExpiringSoon(product.expiryDate) && <span className="badge badge-danger">Expiring Soon</span>}
                    {!isLowStock(product) && !isExpiringSoon(product.expiryDate) && <span className="badge badge-success">Good</span>}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => setTransactionModal({ show: true, type: 'sale', product })}
                        className="btn-small btn-sale"
                      >
                        Sell
                      </button>
                      <button 
                        onClick={() => setTransactionModal({ show: true, type: 'purchase', product })}
                        className="btn-small btn-purchase"
                      >
                        Buy
                      </button>
                      <button onClick={() => handleEdit(product)} className="btn-small">Edit</button>
                      <button onClick={() => deleteProduct(product.id)} className="btn-small btn-delete">Delete</button>
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
          />
        )}

        {transactionModal.show && (
          <TransactionModal
            type={transactionModal.type}
            product={transactionModal.product}
            workers={workers}
            onConfirm={handleTransaction}
            onCancel={() => setTransactionModal({ show: false, type: null, product: null })}
          />
        )}
      </div>
    </div>
  )
}

export default Home
