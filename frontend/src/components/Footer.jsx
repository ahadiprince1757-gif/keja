import React from 'react';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h4>KejaKU</h4>
            <p>
              An independent student housing directory created to help Kenyatta
              University students find verified rooms, bedsitters, and hostels
              in Wendani, Sukari, and KM without broker exploitation.
            </p>
          </div>

          <div className="footer-links">
            <h5>Popular KU Zones</h5>
            <ul>
              <li><a href="#listingsSection">Kahawa Wendani Hostels</a></li>
              <li><a href="#listingsSection">Kahawa Sukari Apartments</a></li>
              <li><a href="#listingsSection">KM Gate Bedsitters</a></li>
              <li><a href="#listingsSection">Ruiru Student Rentals</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>&copy; 2026 Keja</div>
        </div>
      </div>
    </footer>
  );
}
