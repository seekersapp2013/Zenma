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

              <span className="footer__copyright">© ZENMA, 2019—2024 <br /> Create by <a href="https://themeforest.net/user/dmitryvolkov/portfolio" target="_blank">Dmitry Volkov</a></span>

              <nav className="footer__nav">
                <a href="/aboutus">About Us</a>
                <a href="/contacts">Contacts</a>
                <a href="/privacy">Privacy policy</a>
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