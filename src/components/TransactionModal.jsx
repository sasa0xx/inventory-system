import { useState } from 'react'
import './TransactionModal.css'

function TransactionModal({ type, product, workers, onConfirm, onCancel, settings }) {
  const currentLanguage = settings?.language || 'en';
  
  const t = {
    en: {
      sale: 'Record Sale',
      purchase: 'Record Purchase',
      product: 'Product',
      price: 'Price',
      available: 'Available',
      units: 'units',
      quantity: 'Quantity',
      worker: 'Worker',
      total: 'Total',
      cancel: 'Cancel',
      confirmSale: 'Confirm Sale',
      confirmPurchase: 'Confirm Purchase',
      receipt: 'Receipt Preview',
      discount: 'Discount',
      discountType: 'Type',
      store: 'My Smart Shop',
      owner: 'John Doe',
      phone: '+1 234 567 890',
      qty: 'Qty',
      unit: 'Unit',
      subtotal: 'Subtotal',
      thankYou: 'Thank you for your business!',
      date: 'Date'
    },
    ar: {
      sale: 'تسجيل بيع',
      purchase: 'تسجيل شراء',
      product: 'المنتج',
      price: 'السعر',
      available: 'المتاح',
      units: 'وحدات',
      quantity: 'الكمية',
      worker: 'الموظف',
      total: 'الإجمالي',
      cancel: 'إلغاء',
      confirmSale: 'تأكيد البيع',
      confirmPurchase: 'تأكيد الشراء',
      receipt: 'معاينة الإيصال',
      discount: 'خصم',
      discountType: 'النوع',
      store: 'متجري الذكي',
      owner: 'جون دو',
      phone: '+1 234 567 890',
      qty: 'الكمية',
      unit: 'الوحدة',
      subtotal: 'المجموع',
      thankYou: 'شكراً لتعاملكم معنا!',
      date: 'التاريخ'
    }
  }[currentLanguage];

  // Who is selling what? Let's find out.
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('amount'); // 'amount' or 'percent'
  const [selectedWorker, setSelectedWorker] = useState(workers[0]?.id || '');

  const calculateTotal = () => {
    const baseTotal = product.price * quantity;
    if (type === 'purchase') return baseTotal;
    
    if (discountType === 'percent') {
      return baseTotal * (1 - (discount / 100));
    } else {
      return Math.max(0, baseTotal - discount);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalTotal = calculateTotal();
    if (type === 'sale') {
      onConfirm(product.id, parseInt(quantity), parseInt(selectedWorker), {
        value: parseFloat(discount),
        type: discountType,
        total: finalTotal
      });
    } else {
      onConfirm(product.id, parseInt(quantity));
    }
  };

  const total = calculateTotal();

  return (
    <div className="modal-overlay">
      <div className="modal-content transaction-modal">
        <h3>{type === 'sale' ? t.sale : t.purchase}</h3>
        
        <div className="product-info">
          <p><strong>{t.product}:</strong> {product.name}</p>
          <p><strong>{t.price}:</strong> ${product.price.toFixed(2)}</p>
          <p><strong>{t.available}:</strong> {product.quantity} {t.units}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t.quantity}</label>
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
            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label>{t.discount}</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>{t.discountType}</label>
                <select 
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                >
                  <option value="amount">$</option>
                  <option value="percent">%</option>
                </select>
              </div>
            </div>
          )}

          {type === 'sale' && (
            <div className="form-group">
              <label>{t.worker}</label>
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
            <strong>{t.total}: ${total.toFixed(2)}</strong>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              {t.cancel}
            </button>
            <button type="submit" className="btn-submit">
              {type === 'sale' ? t.confirmSale : t.confirmPurchase}
            </button>
          </div>
        </form>

        {type === 'sale' && (
          <div className="receipt-preview">
            <h4>{t.receipt}:</h4>
            <div className="receipt">
              <div className="receipt-header">
                <h2>{t.store}</h2>
                <p>{t.owner}</p>
                <p>{t.phone}</p>
                <p style={{marginTop: '0.5rem', fontSize: '0.65rem'}}>
                  {t.date}: {new Date().toLocaleString(currentLanguage === 'ar' ? 'ar-EG' : undefined)}
                </p>
              </div>

              <table className="receipt-table">
                <thead>
                  <tr>
                    <th>{t.product}</th>
                    <th style={{textAlign: 'center'}}>{t.qty}</th>
                    <th style={{textAlign: 'right'}}>{t.unit}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{product.name}</td>
                    <td style={{textAlign: 'center'}}>{quantity}</td>
                    <td style={{textAlign: 'right'}}>${product.price.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="receipt-row-total">
                <div className="receipt-final-row">
                  <span>{t.subtotal}:</span>
                  <span>${(product.price * quantity).toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="receipt-final-row" style={{ color: '#d32f2f' }}>
                    <span>{t.discount}:</span>
                    <span>-{discountType === 'percent' ? `${discount}%` : `$${parseFloat(discount).toFixed(2)}`}</span>
                  </div>
                )}
                <div className="receipt-final-row receipt-total-bold">
                  <span>{t.total}:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="receipt-footer">
                <p>{t.thankYou}</p>
                <p>*** {t.logo} ***</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionModal
