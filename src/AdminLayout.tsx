import { useEffect, ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface AdminLayoutProps {
  children: ReactNode;
  currentPage: string;
  pageTitle: string;
  totalCount?: number;
  titleActions?: ReactNode;
}

export function AdminLayout({ children, currentPage, pageTitle, totalCount, titleActions }: AdminLayoutProps) {

  // Load admin CSS and JS
  useEffect(() => {
    // Set body styles to match admin template
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = '#1a1a1a';
    document.body.style.fontFamily = 'Inter, sans-serif';
    
    // Add custom CSS for sidebar counts and text color fixes
    const customCSS = `
      .sidebar__nav-count {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        font-size: 0.75rem;
        padding: 2px 6px;
        border-radius: 10px;
        margin-left: auto;
        min-width: 20px;
        text-align: center;
      }
      .sidebar__nav-link {
        display: flex !important;
        align-items: center;
      }
      .catalog__avatar-placeholder {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #404040;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-weight: 600;
        font-size: 1.2rem;
      }
      .catalog__row--clickable:hover {
        background-color: rgba(255, 255, 255, 0.05) !important;
        transition: background-color 0.2s ease;
      }
      .catalog__row--clickable:hover .catalog__user h3 {
        color: #007bff !important;
        transition: color 0.2s ease;
      }

      /* Fix black text on black background issues - scoped to admin template elements */
      
      /* Sign form elements */
      .sign__title {
        color: #fff !important;
      }
      .sign__label {
        color: #fff !important;
      }
      .sign__subtitle {
        color: #fff !important;
      }
      .sign__text {
        color: #fff !important;
      }
      .sign__text--small {
        color: #c0c0c0 !important;
        font-size: 0.875rem;
      }

      /* Catalog elements */
      .catalog__title {
        color: #fff !important;
      }
      .catalog__title-wrap h3 {
        color: #fff !important;
      }
      .catalog__title-wrap p {
        color: #c0c0c0 !important;
      }
      .catalog__text {
        color: #c0c0c0 !important;
      }
      .catalog__text strong {
        color: #fff !important;
      }

      /* Table elements - only for admin template tables */
      .main__table {
        color: #c0c0c0 !important;
      }
      .main__table thead th {
        color: #c0c0c0 !important;
      }
      .main__table tbody td {
        color: #c0c0c0 !important;
      }
      .main__table-text {
        color: #c0c0c0 !important;
      }
      .catalog__table {
        color: #c0c0c0 !important;
      }
      .catalog__table thead th {
        color: #c0c0c0 !important;
      }
      .catalog__table tbody td {
        color: #c0c0c0 !important;
      }

      /* Bootstrap overrides - only within admin template containers */
      .catalog .text-muted,
      .sign__wrap .text-muted,
      .main .text-muted {
        color: #9ca3af !important;
      }
      .catalog .form-text,
      .sign__wrap .form-text,
      .main .form-text {
        color: #9ca3af !important;
      }
      .catalog .form-label,
      .sign__wrap .form-label,
      .main .form-label {
        color: #fff !important;
      }

      /* Modal elements - only for admin template modals with dark backgrounds */
      .modal-content:not(.bg-white) .modal-title,
      .modal__content .modal-title,
      .bg-dark .modal-title {
        color: #fff !important;
      }
      .modal-content:not(.bg-white) .modal-body,
      .modal__content .modal-body,
      .bg-dark .modal-body {
        color: #c0c0c0 !important;
      }
      .modal-content:not(.bg-white) .modal-body p,
      .modal__content .modal-body p,
      .bg-dark .modal-body p {
        color: #c0c0c0 !important;
      }
      .modal-content:not(.bg-white) .modal-body strong,
      .modal__content .modal-body strong,
      .bg-dark .modal-body strong {
        color: #fff !important;
      }
      .modal-content:not(.bg-white) .modal-body ul,
      .modal__content .modal-body ul,
      .bg-dark .modal-body ul {
        color: #c0c0c0 !important;
      }
      .modal-content:not(.bg-white) .modal-body li,
      .modal__content .modal-body li,
      .bg-dark .modal-body li {
        color: #c0c0c0 !important;
      }

      /* Nav tabs - only for admin template tabs */
      .main__tabs .nav-link {
        color: #c0c0c0 !important;
      }
      .main__tabs .nav-link.active {
        color: #fff !important;
      }

      /* Generic elements in admin context - scoped to admin containers */
      .sign__wrap h4,
      .sign__wrap h5 {
        color: #fff !important;
      }
      .sign__wrap p {
        color: #c0c0c0 !important;
      }
      .sign__wrap strong {
        color: #fff !important;
      }

      /* Small helper text - only in admin containers */
      .catalog small.text-muted,
      .sign__wrap small.text-muted,
      .main small.text-muted,
      .catalog small.form-text,
      .sign__wrap small.form-text,
      .main small.form-text {
        color: #9ca3af !important;
      }

      /* Empty state messages - only in catalog/admin tables */
      .catalog .text-center p,
      .main__table-wrap .text-center p {
        color: #c0c0c0 !important;
      }
      .catalog .text-center h4,
      .main__table-wrap .text-center h4 {
        color: #fff !important;
      }
      .catalog .text-center small,
      .main__table-wrap .text-center small {
        color: #9ca3af !important;
      }

      /* Card elements - only for admin template cards with dark backgrounds */
      .catalog .card-title,
      [style*="backgroundColor: #2b2b2b"] .card-title,
      [style*="background-color: #2b2b2b"] .card-title {
        color: #fff !important;
      }
      .catalog .card-text,
      [style*="backgroundColor: #2b2b2b"] .card-text,
      [style*="background-color: #2b2b2b"] .card-text {
        color: #c0c0c0 !important;
      }

      /* Ensure all paragraph and heading elements have proper colors - only in catalog */
      .catalog p,
      .catalog h3,
      .catalog h4,
      .catalog h5,
      .catalog h6 {
        color: #fff !important;
      }
      
      .catalog small {
        color: #9ca3af !important;
      }

      /* Fix for strong tags - only in admin containers */
      .catalog strong,
      .sign__wrap strong,
      .main strong {
        color: #fff !important;
      }

      /* Preserve dark text on white/light backgrounds */
      .bg-white,
      .bg-white *:not(.text-white):not(.text-[#ff1493]):not(.text-[#d91a72]):not(.text-green-600):not(.text-yellow-600):not(.text-red-600):not(.text-gray-500):not(.text-gray-600):not(.text-gray-700):not(.text-gray-900) {
        color: inherit;
      }
      
      /* Ensure Tailwind utility classes work properly */
      .text-gray-700 {
        color: #374151 !important;
      }
      .text-gray-900 {
        color: #111827 !important;
      }
      .text-gray-500 {
        color: #6b7280 !important;
      }
      .text-gray-600 {
        color: #4b5563 !important;
      }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = customCSS;
    document.head.appendChild(styleElement);
    
    // Load CSS files
    const cssFiles = [
      '/admin/css/bootstrap.min.css',
      '/admin/css/slimselect.css',
      '/admin/css/admin.css',
      '/admin/webfont/tabler-icons.min.css'
    ];

    cssFiles.forEach(href => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      }
    });

    // Load JS files
    const jsFiles = [
      '/admin/js/bootstrap.bundle.min.js',
      '/admin/js/slimselect.min.js',
      '/admin/js/smooth-scrollbar.js',
      '/admin/js/admin.js'
    ];

    jsFiles.forEach(src => {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement('script');
        script.src = src;
        document.body.appendChild(script);
      }
    });

    return () => {
      // Reset body styles on cleanup
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.backgroundColor = '';
      document.body.style.fontFamily = '';
      
      // Remove custom styles
      const customStyle = document.querySelector('style');
      if (customStyle && customStyle.textContent?.includes('sidebar__nav-count')) {
        customStyle.remove();
      }
    };
  }, []);



  return (
    <div style={{ 
      margin: 0, 
      padding: 0, 
      minHeight: '100vh', 
      backgroundColor: '#1a1a1a'
    }}>
      {/* Header */}
      <header className="header">
        <div className="header__content">
          <a href="/dashboard" className="header__logo">
            <img src="/admin/img/logo.svg" alt="Logo" />
          </a>
          <button className="header__btn" type="button">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar currentPage={currentPage} />

      {/* Main Content */}
      <main className="main">
        <div className="container-fluid">
          <div className="row">
            {/* Main Title */}
            <div className="col-12">
              <div className="main__title">
                <h2>{pageTitle}</h2>
                {totalCount !== undefined && (
                  <span className="main__title-stat">{totalCount} Total</span>
                )}
                {titleActions && (
                  <div className="main__title-wrap">
                    {titleActions}
                  </div>
                )}
              </div>
            </div>
            
            {/* Page Content */}
            <div className="col-12">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}