import { useState, useEffect } from 'react'
import './ProductForm.css'

function ProductForm({ product, onSave, onCancel, settings }) {
  const currentLanguage = settings?.language || 'en';
  
  const t = {
    en: {
      edit: 'Edit Product',
      add: 'Add New Product',
      name: 'Product Name',
      category: 'Category',
      quantity: 'Quantity',
      minStock: 'Min Stock',
      price: 'Selling Price',
      costPrice: 'Cost Price',
      expiry: 'Expiry Date (Optional)',
      cancel: 'Cancel',
      updateBtn: 'Update Product',
      addBtn: 'Add Product'
    },
    ar: {
      edit: 'تعديل المنتج',
      add: 'إضافة منتج جديد',
      name: 'اسم المنتج',
      category: 'الفئة',
      quantity: 'الكمية',
      minStock: 'الحد الأدنى للمخزون',
      price: 'سعر البيع',
      costPrice: 'سعر التكلفة',
      expiry: 'تاريخ الانتهاء (اختياري)',
      cancel: 'إلغاء',
      updateBtn: 'تحديث المنتج',
      addBtn: 'إضافة المنتج'
    }
  }[currentLanguage];

  // Syncing the form with the product... if we're in edit mode.
  // This feels like magic when it works.
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    price: '',
    costPrice: '',
    expiryDate: '',
    minStock: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        quantity: product.quantity,
        price: product.price,
        costPrice: product.costPrice || (product.price * 0.7).toFixed(2),
        expiryDate: product.expiryDate || '',
        minStock: product.minStock
      });
    }
  }, [product]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{product ? t.edit : t.add}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t.name}</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>{t.category}</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t.quantity}</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>{t.minStock}</label>
              <input
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t.price}</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>{t.costPrice}</label>
              <input
                type="number"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>{t.expiry}</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              {t.cancel}
            </button>
            <button type="submit" className="btn-submit">
              {product ? t.updateBtn : t.addBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductForm
