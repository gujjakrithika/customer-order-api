import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:8000';

export default function App() {
  const [activeTab, setActiveTab] = useState('customers');
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [alert, setAlert] = useState(null);

  const [customerForm, setCustomerForm] = useState({ name: '', email: '' });
  const [productForm, setProductForm] = useState({ name: '', price: '' });
  const [orderForm, setOrderForm] = useState({
    customer_id: '',
    product_id: '',
    quantity: 1,
  });

  const showAlert = (type, text) => {
    setAlert({ type, text });
    setTimeout(() => setAlert(null), 4000);
  };

  const formatError = (err, fallback) => {
    if (!err || !err.detail) return fallback;
    return typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
  };

  const fetchAll = async () => {
    try {
      const [custRes, prodRes, ordRes] = await Promise.all([
        fetch(`${API_URL}/customers/`),
        fetch(`${API_URL}/products/`),
        fetch(`${API_URL}/orders/`),
      ]);

      if (custRes.ok) setCustomers(await custRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
      if (ordRes.ok) setOrders(await ordRes.json());
    } catch {
      showAlert('error', `Unable to reach FastAPI backend at ${API_URL}`);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const postJson = async (path, payload) => {
    try {
      return await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      showAlert('error', `Unable to reach FastAPI backend at ${API_URL}`);
      return null;
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    const res = await postJson('/customers/', customerForm);
    if (!res) return;

    if (res.ok) {
      setCustomerForm({ name: '', email: '' });
      showAlert('success', 'New customer registered successfully.');
      fetchAll();
    } else {
      const err = await res.json().catch(() => null);
      showAlert('error', formatError(err, 'Could not create customer.'));
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    const res = await postJson('/products/', {
      name: productForm.name,
      price: parseFloat(productForm.price),
    });
    if (!res) return;

    if (res.ok) {
      setProductForm({ name: '', price: '' });
      showAlert('success', 'Product added to catalog.');
      fetchAll();
    } else {
      const err = await res.json().catch(() => null);
      showAlert('error', formatError(err, 'Could not add product.'));
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    const res = await postJson('/orders/', {
      customer_id: parseInt(orderForm.customer_id, 10),
      product_id: parseInt(orderForm.product_id, 10),
      quantity: parseInt(orderForm.quantity, 10),
    });
    if (!res) return;

    if (res.ok) {
      setOrderForm({ customer_id: '', product_id: '', quantity: 1 });
      showAlert('success', 'Order placed and recorded in database.');
      fetchAll();
    } else {
      const err = await res.json().catch(() => null);
      showAlert('error', formatError(err, 'Could not place order.'));
    }
  };

  const getCustomerName = (id) => {
    const found = customers.find((c) => c.id === id);
    return found ? `${found.name} (#${id})` : `Customer #${id}`;
  };

  const getProductInfo = (id) => {
    const found = products.find((p) => p.id === id);
    return found || null;
  };

  return (
    <div>
      <header className="navbar">
        <div className="navbar-brand">
          <span className="brand-badge">OMS</span>
          <h1>Customer &amp; Order Portal</h1>
        </div>
      </header>

      <main className="container">
        <section className="stats-grid">
          <div
            className={`stat-card ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            <div className="stat-label">Total Customers</div>
            <div className="stat-value">{customers.length}</div>
          </div>
          <div
            className={`stat-card ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <div className="stat-label">Catalog Products</div>
            <div className="stat-value">{products.length}</div>
          </div>
          <div
            className={`stat-card ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{orders.length}</div>
          </div>
        </section>

        <div className="tabs">
          {['customers', 'products', 'orders'].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {alert && (
          <div className={`alert ${alert.type}`}>
            <span>{alert.text}</span>
          </div>
        )}

        {activeTab === 'customers' && (
          <section className="card">
            <div className="card-header">
              <h2>Customer Directory</h2>
              <p>Register new customers and view active accounts.</p>
            </div>
            <form className="form-row" onSubmit={handleCreateCustomer}>
              <input
                className="input-field"
                placeholder="Full Name (e.g., Krithika)"
                value={customerForm.name}
                onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                required
              />
              <input
                className="input-field"
                type="email"
                placeholder="Email Address (e.g., krithika@example.com)"
                value={customerForm.email}
                onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                required
              />
              <button type="submit" className="btn-primary">
                + Add Customer
              </button>
            </form>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer Name</th>
                    <th>Email Address</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="empty-state">
                        No customers found yet. Add your first customer above.
                      </td>
                    </tr>
                  ) : (
                    customers.map((c) => (
                      <tr key={c.id}>
                        <td><span className="id-badge">#{c.id}</span></td>
                        <td><strong>{c.name}</strong></td>
                        <td>{c.email}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'products' && (
          <section className="card">
            <div className="card-header">
              <h2>Product Catalog</h2>
              <p>Manage available products and pricing for customer orders.</p>
            </div>
            <form className="form-row" onSubmit={handleCreateProduct}>
              <input
                className="input-field"
                placeholder="Product Name (e.g., Wireless Mouse)"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                required
              />
              <input
                className="input-field"
                type="number"
                step="0.01"
                min="0"
                placeholder="Unit Price (e.g., 29.99)"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                required
              />
              <button type="submit" className="btn-primary">
                + Add Product
              </button>
            </form>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product Name</th>
                    <th>Unit Price</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="empty-state">
                        No products in catalog yet. Add one above.
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p.id}>
                        <td><span className="id-badge">#{p.id}</span></td>
                        <td><strong>{p.name}</strong></td>
                        <td className="price-tag">Rs.{Number(p.price).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'orders' && (
          <section className="card">
            <div className="card-header">
              <h2>Order Management</h2>
              <p>Place new orders for customers and review order history.</p>
            </div>
            <form className="form-row" onSubmit={handleCreateOrder}>
              <select
                className="input-field"
                value={orderForm.customer_id}
                onChange={(e) => setOrderForm({ ...orderForm, customer_id: e.target.value })}
                required
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (#{c.id})
                  </option>
                ))}
              </select>
              <select
                className="input-field"
                value={orderForm.product_id}
                onChange={(e) => setOrderForm({ ...orderForm, product_id: e.target.value })}
                required
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Rs.{Number(p.price).toFixed(2)})
                  </option>
                ))}
              </select>
              <input
                className="input-field"
                type="number"
                min="1"
                placeholder="Quantity"
                value={orderForm.quantity}
                onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
                required
              />
              <button type="submit" className="btn-primary">
                + Place Order
              </button>
            </form>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-state">
                        No orders yet. Place your first order above.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => {
                      const product = getProductInfo(o.product_id);
                      const total = product ? Number(product.price) * o.quantity : null;
                      return (
                        <tr key={o.id}>
                          <td><span className="id-badge">#{o.id}</span></td>
                          <td>{getCustomerName(o.customer_id)}</td>
                          <td>{product ? product.name : `Product #${o.product_id}`}</td>
                          <td>{o.quantity}</td>
                          <td className="price-tag">
                            {total !== null ? `Rs.${total.toFixed(2)}` : '—'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}