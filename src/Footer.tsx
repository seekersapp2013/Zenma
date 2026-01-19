export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="footer__content">
              <a href="/" className="footer__logo">
               <h1><span className="logo-zen">ZEN</span><span className="logo-ma">MA</span></h1>
              </a>

              <span className="footer__copyright">© ZENMA, {new Date().getFullYear()} <br /> </span>

              <nav className="footer__nav">
                <a href="/aboutus">About Us</a>
                 <a href="/blog">Blog</a>
                <a href="/contacts">Contacts</a>

              </nav>

              <button className="footer__back" type="button">
                <i className="ti ti-arrow-narrow-up"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}