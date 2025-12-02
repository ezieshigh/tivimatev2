
import React, { useState } from 'react';
import { Phone, Mail, MessageSquare, Trash2, CreditCard, Lock } from 'lucide-react';
import { CartItem } from '../types';

interface CheckoutSectionProps {
  cart: CartItem[];
  removeFromCart: (id: string) => void;
}

const CheckoutSection: React.FC<CheckoutSectionProps> = ({ cart, removeFromCart }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    device: 'Smart TV',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    // Simulate Order Logic
    console.log('Order Submitted:', { customer: formData, cart });
    setSubmitted(true);
    // setTimeout(() => setSubmitted(false), 5000);
  };

  // Calculations
  const totalSetup = cart.reduce((sum, item) => sum + item.setupFee, 0);
  const totalMonthly = cart.reduce((sum, item) => item.period === 'month' ? sum + item.recurringPrice : sum, 0);
  const totalYearly = cart.reduce((sum, item) => item.period === 'year' ? sum + item.recurringPrice : sum, 0);
  const dueToday = totalSetup + totalMonthly + totalYearly; // Assuming first month/year paid upfront

  return (
    <section id="checkout" className="section" style={{ background: 'linear-gradient(to top, #000, #0a0a0a)' }}>
      <div className="container">
        <h2 className="section-title">Checkout & Setup</h2>
        <p className="section-subtitle">Complete your order to start the installation process.</p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '4rem', 
          maxWidth: '1200px', 
          margin: '0 auto' 
        }}>
          
          {/* LEFT: Billing Form */}
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>1. Customer Details</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input required type="text" name="name" className="form-input" onChange={handleChange} value={formData.name} placeholder="John Doe" />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input required type="email" name="email" className="form-input" onChange={handleChange} value={formData.email} placeholder="john@example.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone (WhatsApp preferred)</label>
                  <input required type="tel" name="phone" className="form-input" onChange={handleChange} value={formData.phone} placeholder="+44 7000..." />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address (For Billing or Shipping)</label>
                <input type="text" name="address" className="form-input" onChange={handleChange} value={formData.address} placeholder="Street, City, Postcode" />
              </div>

              <div className="form-group">
                <label className="form-label">Device You Own</label>
                <select name="device" className="form-select" onChange={handleChange} value={formData.device}>
                  <option>Amazon Fire Stick</option>
                  <option>Android TV</option>
                  <option>None (Need Device Shipped)</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Order Notes</label>
                <textarea name="notes" className="form-textarea" rows={3} onChange={handleChange} value={formData.notes} placeholder="Any specific requirements?" />
              </div>

              {submitted ? (
                 <div style={{ padding: '2rem', background: 'rgba(79, 183, 180, 0.1)', color: '#4fb7b3', border: '1px solid #4fb7b3', textAlign:'center' }}>
                    <h4 style={{fontSize:'1.5rem', marginBottom:'1rem'}}>Order Received!</h4>
                    <p>Order #{Math.floor(Math.random() * 9000) + 1000}</p>
                    <p>A technician will contact you shortly via WhatsApp/Email to begin the setup.</p>
                 </div>
              ) : (
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                  Proceed to Payment
                </button>
              )}
              
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '0.8rem', justifyContent: 'center' }}>
                <Lock size={12} /> Secure 256-bit SSL Encrypted
              </div>
            </form>
          </div>

          {/* RIGHT: Order Summary */}
          <div>
             <div className="checkout-summary" style={{ 
               backgroundColor: '#111', 
               border: '1px solid var(--accent-red)', 
               padding: '2rem',
               position: 'sticky',
               top: '100px'
             }}>
               <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}>Order Summary</h3>
               
               {cart.length === 0 ? (
                 <div style={{ padding: '2rem 0', textAlign: 'center', color: '#666', borderBottom: '1px solid #333' }}>
                   Your cart is empty. <br/> <a href="#plans" style={{color:'white', textDecoration:'underline'}}>Browse Plans</a>
                 </div>
               ) : (
                 <div style={{ marginBottom: '2rem' }}>
                    {cart.map((item) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #222' }}>
                        <div style={{flex: 1}}>
                          <div style={{ fontWeight: 'bold', color: 'white' }}>{item.name}</div>
                          {item.variantName && <div style={{ fontSize: '0.8rem', color: '#888' }}>{item.variantName}</div>}
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>
                             Sub: £{item.recurringPrice}/{item.period}
                             {item.setupFee > 0 && <span> + £{item.setupFee} Setup</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                           <div style={{ fontWeight: 'bold' }}>£{item.recurringPrice + item.setupFee}</div>
                           <button onClick={() => removeFromCart(item.id)} style={{ color: '#d32f2f' }} title="Remove">
                             <Trash2 size={16} />
                           </button>
                        </div>
                      </div>
                    ))}
                 </div>
               )}

               <div style={{ marginBottom: '2rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#aaa' }}>
                   <span>Setup Fees (One-time)</span>
                   <span>£{totalSetup.toFixed(2)}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#aaa' }}>
                   <span>Monthly Subscription</span>
                   <span>£{totalMonthly.toFixed(2)}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#aaa' }}>
                   <span>Yearly Subscription</span>
                   <span>£{totalYearly.toFixed(2)}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #333', fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>
                   <span>Total Due Today</span>
                   <span>£{dueToday.toFixed(2)}</span>
                 </div>
                 <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '8px', textAlign: 'right' }}>
                   Includes setup & first payment.
                 </p>
               </div>

               <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', opacity: 0.5 }}>
                 <CreditCard size={24} />
                 {/* Placeholders for card logos */}
                 <div style={{ width: 30, height: 20, background: '#333', borderRadius: 2 }} />
                 <div style={{ width: 30, height: 20, background: '#333', borderRadius: 2 }} />
               </div>
             </div>

             {/* Support Contacts */}
             <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>Need help with your order?</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <a href="#" style={{ color: 'white', display: 'flex', gap: '5px', fontSize: '0.9rem' }}><MessageSquare size={16} /> WhatsApp</a>
                    <a href="#" style={{ color: 'white', display: 'flex', gap: '5px', fontSize: '0.9rem' }}><Mail size={16} /> Email</a>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CheckoutSection;
