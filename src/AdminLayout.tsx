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
    
    // Add custom CSS for sidebar counts
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