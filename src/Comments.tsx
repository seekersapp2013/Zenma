export function Comments() {
  return (
    <div className="row">
      {/* comments */}
      <div className="col-12">
        <div className="comments">
          <ul className="comments__list">
            <li className="comments__item">
              <div className="comments__autor">
                <img className="comments__avatar" src="img/user.svg" alt="" />
                <span className="comments__name">John Doe</span>
                <span className="comments__time">30.08.2018, 17:53</span>
              </div>
              <p className="comments__text">There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.</p>
              <div className="comments__actions">
                <div className="comments__rate">
                  <button type="button"><i className="ti ti-thumb-up"></i>12</button>
                  <button type="button">7<i className="ti ti-thumb-down"></i></button>
                </div>
                <button type="button"><i className="ti ti-arrow-forward-up"></i>Reply</button>
                <button type="button"><i className="ti ti-quote"></i>Quote</button>
              </div>
            </li>

            <li className="comments__item comments__item--answer">
              <div className="comments__autor">
                <img className="comments__avatar" src="img/user.svg" alt="" />
                <span className="comments__name">John Doe</span>
                <span className="comments__time">24.08.2018, 16:41</span>
              </div>
              <p className="comments__text">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
              <div className="comments__actions">
                <div className="comments__rate">
                  <button type="button"><i className="ti ti-thumb-up"></i>8</button>
                  <button type="button">3<i className="ti ti-thumb-down"></i></button>
                </div>
                <button type="button"><i className="ti ti-arrow-forward-up"></i>Reply</button>
                <button type="button"><i className="ti ti-quote"></i>Quote</button>
              </div>
            </li>

            <li className="comments__item comments__item--quote">
              <div className="comments__autor">
                <img className="comments__avatar" src="img/user.svg" alt="" />
                <span className="comments__name">John Doe</span>
                <span className="comments__time">11.08.2018, 11:11</span>
              </div>
              <p className="comments__text"><span>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.</span>It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
              <div className="comments__actions">
                <div className="comments__rate">
                  <button type="button"><i className="ti ti-thumb-up"></i>11</button>
                  <button type="button">1<i className="ti ti-thumb-down"></i></button>
                </div>
                <button type="button"><i className="ti ti-arrow-forward-up"></i>Reply</button>
                <button type="button"><i className="ti ti-quote"></i>Quote</button>
              </div>
            </li>

            <li className="comments__item">
              <div className="comments__autor">
                <img className="comments__avatar" src="img/user.svg" alt="" />
                <span className="comments__name">John Doe</span>
                <span className="comments__time">07.08.2018, 14:33</span>
              </div>
              <p className="comments__text">There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.</p>
              <div className="comments__actions">
                <div className="comments__rate">
                  <button type="button"><i className="ti ti-thumb-up"></i>99</button>
                  <button type="button">35<i className="ti ti-thumb-down"></i></button>
                </div>
                <button type="button"><i className="ti ti-arrow-forward-up"></i>Reply</button>
                <button type="button"><i className="ti ti-quote"></i>Quote</button>
              </div>
            </li>

            <li className="comments__item">
              <div className="comments__autor">
                <img className="comments__avatar" src="img/user.svg" alt="" />
                <span className="comments__name">John Doe</span>
                <span className="comments__time">02.08.2018, 15:24</span>
              </div>
              <p className="comments__text">Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).</p>
              <div className="comments__actions">
                <div className="comments__rate">
                  <button type="button"><i className="ti ti-thumb-up"></i>74</button>
                  <button type="button">13<i className="ti ti-thumb-down"></i></button>
                </div>
                <button type="button"><i className="ti ti-arrow-forward-up"></i>Reply</button>
                <button type="button"><i className="ti ti-quote"></i>Quote</button>
              </div>
            </li>
          </ul>

          {/* paginator mobile */}
          <div className="paginator-mob paginator-mob--comments">
            <span className="paginator-mob__pages">5 of 628</span>

            <ul className="paginator-mob__nav">
              <li>
                <a href="#">
                  <i className="ti ti-chevron-left"></i>
                  <span>Prev</span>
                </a>
              </li>
              <li>
                <a href="#">
                  <span>Next</span>
                  <i className="ti ti-chevron-right"></i>
                </a>
              </li>
            </ul>
          </div>
          {/* end paginator mobile */}

          {/* paginator desktop */}
          <ul className="paginator paginator--comments">
            <li className="paginator__item paginator__item--prev">
              <a href="#"><i className="ti ti-chevron-left"></i></a>
            </li>
            <li className="paginator__item"><a href="#">1</a></li>
            <li className="paginator__item paginator__item--active"><a href="#">2</a></li>
            <li className="paginator__item"><a href="#">3</a></li>
            <li className="paginator__item"><a href="#">4</a></li>
            <li className="paginator__item"><span>...</span></li>
            <li className="paginator__item"><a href="#">36</a></li>
            <li className="paginator__item paginator__item--next">
              <a href="#"><i className="ti ti-chevron-right"></i></a>
            </li>
          </ul>
          {/* end paginator desktop */}

          <form action="#" className="sign__form sign__form--comments">
            <div className="sign__group">
              <textarea id="text" name="text" className="sign__textarea" placeholder="Add comment"></textarea>
            </div>

            <button type="button" className="sign__btn sign__btn--small">Send</button>
          </form>
        </div>
      </div>
      {/* end comments */}
    </div>
  );
}