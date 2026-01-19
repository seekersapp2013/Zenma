import { useState, useEffect } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { toast } from "sonner";

export function ContactUs() {
  const contactContent = useQuery(api.contacts.getContactContent);
  const submitForm = useMutation(api.contacts.submitContactForm);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitForm(formData);
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (contactContent === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff1493]"></div>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        .sign__form {
          background: rgba(22, 21, 27, 0.6);
          padding: 40px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .sign__group {
          margin-bottom: 25px;
        }
        .sign__label {
          display: block;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 10px;
        }
        .sign__input, .sign__textarea {
          width: 100%;
          background: rgba(22, 21, 27, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 12px 16px;
          color: #fff;
          font-size: 15px;
          transition: all 0.3s ease;
        }
        .sign__textarea {
          min-height: 150px;
          resize: vertical;
        }
        .sign__input:focus, .sign__textarea:focus {
          outline: none;
          border-color: #ff1493;
          box-shadow: 0 0 0 3px rgba(255, 20, 147, 0.1);
        }
        .sign__btn {
          background: linear-gradient(135deg, #ff1493, #d91a72);
          color: #fff;
          border: none;
          padding: 14px 40px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .sign__btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 20, 147, 0.3);
        }
        .sign__btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .contacts__list {
          list-style: none;
          padding: 0;
          margin: 25px 0;
        }
        .contacts__list li {
          margin-bottom: 15px;
        }
        .contacts__list a {
          color: #ff1493;
          text-decoration: none;
          font-size: 16px;
          transition: color 0.3s ease;
        }
        .contacts__list a:hover {
          color: #fff;
        }
        .contacts__social {
          display: flex;
          gap: 15px;
          margin-top: 25px;
        }
        .contacts__social a {
          width: 45px;
          height: 45px;
          background: rgba(255, 20, 147, 0.1);
          border: 1px solid rgba(255, 20, 147, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff1493;
          font-size: 20px;
          transition: all 0.3s ease;
        }
        .contacts__social a:hover {
          background: #ff1493;
          color: #fff;
          transform: translateY(-3px);
        }
        .section__text {
          color: #c0c0c0;
          line-height: 1.8;
          font-size: 16px;
          margin-bottom: 25px;
        }
        .section__title--mt {
          margin-top: 0;
          margin-bottom: 25px;
        }
      `}</style>

      <Header />

      {/* Page Title */}
      <section className="section section--first section--bg" style={{ 
        background: 'linear-gradient(135deg, rgba(191, 26, 101, 0.8) 0%, rgba(45, 27, 61, 0.9) 100%)',
        paddingTop: '120px',
        paddingBottom: '60px'
      }}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="section__wrap" style={{ textAlign: 'center' }}>
                <h1 className="section__title section__title--head" style={{
                  fontSize: '48px',
                  fontWeight: '300',
                  color: '#fff',
                  textTransform: 'uppercase',
                  margin: 0,
                  letterSpacing: '2px'
                }}>Contacts</h1>
                <ul className="breadcrumbs" style={{
                  display: 'flex',
                  listStyle: 'none',
                  padding: 0,
                  margin: '30px 0 0',
                  justifyContent: 'center'
                }}>
                  <li className="breadcrumbs__item" style={{ color: '#c0c0c0', fontSize: '14px' }}>
                    <a href="/" style={{ color: '#c0c0c0', textDecoration: 'none' }}>Home</a>
                  </li>
                  <li className="breadcrumbs__item" style={{ color: '#c0c0c0', fontSize: '14px' }}>
                    <span style={{ margin: '0 12px', color: '#666' }}>/</span>
                  </li>
                  <li className="breadcrumbs__item breadcrumbs__item--active" style={{ color: '#ff1493', fontSize: '14px', fontWeight: '600' }}>
                    Contacts
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contacts Section */}
      <section className="section" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        <div className="container">
          <div className="row">
            <div className="col-12 col-xl-8">
              <div className="row">
                <div className="col-12">
                  <h2 className="section__title" style={{ fontSize: '32px', marginBottom: '30px' }}>Contact Form</h2>
                </div>

                <div className="col-12">
                  <form onSubmit={handleSubmit} className="sign__form sign__form--full">
                    <div className="row">
                      <div className="col-12 col-xl-6">
                        <div className="sign__group">
                          <label className="sign__label" htmlFor="firstname">Name</label>
                          <input 
                            id="firstname" 
                            type="text" 
                            name="firstname" 
                            className="sign__input" 
                            placeholder="John"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="col-12 col-xl-6">
                        <div className="sign__group">
                          <label className="sign__label" htmlFor="email">Email</label>
                          <input 
                            id="email" 
                            type="email" 
                            name="email" 
                            className="sign__input" 
                            placeholder="email@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="sign__group">
                          <label className="sign__label" htmlFor="subject">Subject</label>
                          <input 
                            id="subject" 
                            type="text" 
                            name="subject" 
                            className="sign__input" 
                            placeholder="Partnership"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="sign__group">
                          <label className="sign__label" htmlFor="message">Message</label>
                          <textarea 
                            id="message" 
                            name="message" 
                            className="sign__textarea" 
                            placeholder="Type your message..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="col-12">
                        <button 
                          type="submit" 
                          className="sign__btn sign__btn--small"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Sending...' : 'Send'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            
            <div className="col-12 col-md-6 col-xl-4">
              <div className="row">
                <div className="col-12">
                  <h2 className="section__title section__title--mt">{contactContent.heading}</h2>

                  <p className="section__text">{contactContent.description}</p>

                  <ul className="contacts__list">
                    <li><a href={`tel:${contactContent.phone}`}>{contactContent.phone}</a></li>
                    <li><a href={`mailto:${contactContent.email}`}>{contactContent.email}</a></li>
                  </ul>

                  <div className="contacts__social">
                    {contactContent.facebook !== "#" && (
                      <a href={contactContent.facebook} target="_blank" rel="noopener noreferrer">
                        <i className="ti ti-brand-facebook"></i>
                      </a>
                    )}
                    {contactContent.twitter !== "#" && (
                      <a href={contactContent.twitter} target="_blank" rel="noopener noreferrer">
                        <i className="ti ti-brand-x"></i>
                      </a>
                    )}
                    {contactContent.instagram !== "#" && (
                      <a href={contactContent.instagram} target="_blank" rel="noopener noreferrer">
                        <i className="ti ti-brand-instagram"></i>
                      </a>
                    )}
                    {contactContent.discord !== "#" && (
                      <a href={contactContent.discord} target="_blank" rel="noopener noreferrer">
                        <i className="ti ti-brand-discord"></i>
                      </a>
                    )}
                    {contactContent.telegram !== "#" && (
                      <a href={contactContent.telegram} target="_blank" rel="noopener noreferrer">
                        <i className="ti ti-brand-telegram"></i>
                      </a>
                    )}
                    {contactContent.tiktok !== "#" && (
                      <a href={contactContent.tiktok} target="_blank" rel="noopener noreferrer">
                        <i className="ti ti-brand-tiktok"></i>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
