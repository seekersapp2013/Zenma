export function Reviews() {
  return (
    <div className="row">
      {/* reviews */}
      <div className="col-12">
        <div className="reviews">
          <ul className="reviews__list">
            <li className="reviews__item">
              <div className="reviews__autor">
                <img className="reviews__avatar" src="img/user.svg" alt="" />
                <span className="reviews__name">Best Marvel movie in my opinion</span>
                <span className="reviews__time">24.08.2018, 17:53 by John Doe</span>

                <span className="reviews__rating reviews__rating--yellow">6</span>
              </div>
              <p className="reviews__text">There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.</p>
            </li>

            <li className="reviews__item">
              <div className="reviews__autor">
                <img className="reviews__avatar" src="img/user.svg" alt="" />
                <span className="reviews__name">Best Marvel movie in my opinion</span>
                <span className="reviews__time">24.08.2018, 17:53 by John Doe</span>

                <span className="reviews__rating reviews__rating--green">9</span>
              </div>
              <p className="reviews__text">There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.</p>
            </li>

            <li className="reviews__item">
              <div className="reviews__autor">
                <img className="reviews__avatar" src="img/user.svg" alt="" />
                <span className="reviews__name">Best Marvel movie in my opinion</span>
                <span className="reviews__time">24.08.2018, 17:53 by John Doe</span>

                <span className="reviews__rating reviews__rating--red">5</span>
              </div>
              <p className="reviews__text">There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text.</p>
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
              <input type="text" className="sign__input" placeholder="Title" />
            </div>

            <div className="sign__group">
              <select className="sign__select" name="rating" id="rating">
                <option value="0">Rating</option>
                <option value="1">1 star</option>
                <option value="2">2 stars</option>
                <option value="3">3 stars</option>
                <option value="4">4 stars</option>
                <option value="5">5 stars</option>
                <option value="6">6 stars</option>
                <option value="7">7 stars</option>
                <option value="8">8 stars</option>
                <option value="9">9 stars</option>
                <option value="10">10 stars</option>
              </select>
            </div>

            <div className="sign__group">
              <textarea id="textreview" name="textreview" className="sign__textarea" placeholder="Add review"></textarea>
            </div>

            <button type="button" className="sign__btn sign__btn--small">Send</button>
          </form>
        </div>
      </div>
      {/* end reviews */}
    </div>
  );
}