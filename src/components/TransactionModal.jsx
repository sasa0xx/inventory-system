import { useState } from 'react'
import './TransactionModal.css'

function TransactionModal({ type, product, workers, onConfirm, onCancel }) {
  // Who is selling what? Let's find out.
  const [quantity, setQuantity] = useState(1);
  const [selectedWorker, setSelectedWorker] = useState(workers[0]?.id || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'sale') {
      onConfirm(product.id, parseInt(quantity), parseInt(selectedWorker));
    } else {
      onConfirm(product.id, parseInt(quantity));
    }
  };

  const total = product.price * quantity;

  return (
    <div className="modal-overlay">
      <div className="modal-content transaction-modal">
        <h3>{type === 'sale' ? 'Record Sale' : 'Record Purchase'}</h3>
        
        <div className="product-info">
          <p><strong>Product:</strong> {product.name}</p>
          <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
          <p><strong>Available:</strong> {product.quantity} units</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              max={type === 'sale' ? product.quantity : undefined}
              required
            />
          </div>

          {type === 'sale' && (
            <div className="form-group">
              <label>Worker</label>
              <select 
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
                required
              >
                {workers.map(worker => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="transaction-total">
            <strong>Total: ${total.toFixed(2)}</strong>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Confirm {type === 'sale' ? 'Sale' : 'Purchase'}
            </button>
          </div>
        </form>

        {type === 'sale' && (
          <div className="receipt-preview">
            <h4>Receipt Preview:</h4>
            <div className="receipt">
              <p>Product: {product.name}</p>
              <p>Quantity: {quantity}</p>
              <p>Unit Price: ${product.price.toFixed(2)}</p>
              <p>Worker: {workers.find(w => w.id === parseInt(selectedWorker))?.name}</p>
              <p className="receipt-total">Total: ${total.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionModal
