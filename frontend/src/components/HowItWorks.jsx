import React from 'react';

export default function HowItWorks() {
  return (
    <section className="how-it-works-section">
      <div className="container">
        <div className="section-title-wrap">
          <h2>House Hunting Around KU Made Honest</h2>
          <p>Three straightforward steps to secure clean accommodation.</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <h3>Verify True Total Cost</h3>
            <p>
              Check the exact monthly rent, security deposit, garbage
              collection, water supply source, and prepaid KPLC token setup
              before booking the house.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <h3>Know the Gate Walking Time</h3>
            <p>
              Find out the exact minutes to KU Main Gate, Nyayo Gate or KM Small
              Gate so you aren't stuck commuting.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <h3>Inspect Keys Before Paying</h3>
            <p>
              Always meet the caretaker at the property, confirm water
              availability, inspect the property security and always obtain an
              official receipt for any deposit/payment.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
