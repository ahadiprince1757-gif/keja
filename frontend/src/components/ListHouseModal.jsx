import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ListHouseModal({ onClose, onHouseCreated }) {
  const { user, authFetch, isLoggedIn } = useAuth();

  // Strict check: Only owners / caretakers can list a house
  if (!isLoggedIn || user?.role !== 'owner') {
    return (
      <div className="modal-backdrop open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="modal-container" style={{ maxWidth: '440px', textAlign: 'center', padding: '32px 24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8, color: '#ef4444' }}>
            Access Restricted
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
            Students cannot list houses. Please log in with a house owner or caretaker account.
          </p>
          <button type="button" className="btn btn-primary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>
            Close
          </button>
        </div>
      </div>
    );
  }

  const [title, setTitle] = useState('');
  const [area, setArea] = useState('');
  const [type, setType] = useState('Bedsitter');
  const [floor, setFloor] = useState('1st Floor');
  const [vacantUnits, setVacantUnits] = useState(1);
  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [garbageFee, setGarbageFee] = useState('');
  const [distance, setDistance] = useState('');
  const [landmark, setLandmark] = useState('');
  const [water, setWater] = useState('');
  const [electricity, setElectricity] = useState('Individual Prepaid KPLC Token Meter');
  const [wifi, setWifi] = useState('');
  const [gateCurfew, setGateCurfew] = useState('');
  const [caretaker, setCaretaker] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [description, setDescription] = useState('');
  
  const POPULAR_FEATURES = [
    'Borehole Water',
    'Token Meter',
    'Tiled Floor',
    'Instant Hot Shower',
    'Free High-Speed WiFi',
    'CCTV Security',
    'Perimeter Wall & Gate',
    'Balcony',
    'Kitchen Sink & Cabinets'
  ];
  const [selectedFeatures, setSelectedFeatures] = useState([
    'Borehole Water',
    'Token Meter',
    'Tiled Floor'
  ]);
  const [customFeature, setCustomFeature] = useState('');
  const [rulesText, setRulesText] = useState(
    'Quiet hours observed after 10 PM\nRent due on the 5th of every month\nClean shared areas after use'
  );

  const toggleFeature = (feat) => {
    setSelectedFeatures(prev =>
      prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat]
    );
  };

  const addCustomFeature = () => {
    if (customFeature.trim() && !selectedFeatures.includes(customFeature.trim())) {
      setSelectedFeatures(prev => [...prev, customFeature.trim()]);
      setCustomFeature('');
    }
  };

  const removeFeature = (feat) => {
    setSelectedFeatures(prev => prev.filter(f => f !== feat));
  };

  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPhotos((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (idx) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const finalImages = uploadedPhotos.length > 0
      ? uploadedPhotos
      : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'];

    const rulesArray = rulesText
      .split('\n')
      .map(r => r.trim())
      .filter(Boolean);

    const newHouse = {
      id: Date.now(),
      title,
      area,
      landmark,
      type,
      floor,
      vacantUnits: Number(vacantUnits) || 1,
      rent: Number(rent),
      deposit: Number(deposit),
      garbageFee: garbageFee.trim() === '' ? 'N/A' : (isNaN(Number(garbageFee)) ? garbageFee.trim() : Number(garbageFee)),
      distance,
      water,
      electricity,
      wifi,
      gateCurfew,
      caretaker: caretaker || user?.name || 'Resident Caretaker',
      phone: phone || user?.phone || '0712345678',
      whatsapp: phone || user?.phone || '0712345678',
      status: 'visited',
      verifiedDate: 'New Listing',
      image: finalImages[0],
      images: finalImages,
      features: selectedFeatures,
      rules: rulesArray,
      description
    };

    try {
      if (isLoggedIn) {
        const res = await authFetch('/api/accounts/me/houses', {
          method: 'POST',
          body: JSON.stringify(newHouse)
        });
        const data = await res.json();
        if (data.success && data.data) {
          onHouseCreated(data.data);
          onClose();
          return;
        }
      } else {
        await fetch('/api/houses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newHouse)
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }

    onHouseCreated(newHouse);
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-container" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <h2>Add House</h2>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: 'calc(90vh - 120px)', overflowY: 'auto', padding: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-field">
              <label className="form-label" htmlFor="newHouseTitle">Apartment / Hostel Name</label>
              <input
                id="newHouseTitle"
                type="text"
                className="input-control"
                placeholder="e.g. Sunrise Modern Residency"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label" htmlFor="newHouseArea">Location Area</label>
                <select
                  id="newHouseArea"
                  className="input-control"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                >
                  <option value="">Select location area...</option>
                  <option value="Kahawa Wendani">Kahawa Wendani</option>
                  <option value="Kahawa Sukari">Kahawa Sukari</option>
                  <option value="KM / Kenyatta Market">KM / Kenyatta Market</option>
                  <option value="Ruiru">Ruiru</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="newHouseLandmark">Specific Landmark / Stage</label>
                <input
                  id="newHouseLandmark"
                  type="text"
                  className="input-control"
                  placeholder="e.g. Near Transformer, Clean Shelf, Magunas"
                  required
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label" htmlFor="newHouseType">Housing Category</label>
                <select
                  id="newHouseType"
                  className="input-control"
                  required
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="Bedsitter">Bedsitter</option>
                  <option value="Single room">Single room</option>
                  <option value="1 Bedroom">1 Bedroom</option>
                  <option value="Hostel">Hostel</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="newHouseFloor">Floor Level</label>
                <select
                  id="newHouseFloor"
                  className="input-control"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                >
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="1st Floor">1st Floor</option>
                  <option value="2nd Floor">2nd Floor</option>
                  <option value="3rd Floor">3rd Floor</option>
                  <option value="4th Floor">4th Floor</option>
                  <option value="5th Floor+">5th Floor+</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="newHouseVacant">Vacant Rooms</label>
                <input
                  id="newHouseVacant"
                  type="number"
                  min="1"
                  max="50"
                  className="input-control"
                  value={vacantUnits}
                  onChange={(e) => setVacantUnits(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label" htmlFor="newHouseRent">Monthly Rent (KSh)</label>
                <input
                  id="newHouseRent"
                  type="number"
                  className="input-control"
                  placeholder="e.g. 7500"
                  required
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="newHouseDeposit">Deposit Amount (KSh)</label>
                <input
                  id="newHouseDeposit"
                  type="number"
                  className="input-control"
                  placeholder="e.g. 7500"
                  required
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="newHouseGarbage">Garbage Collection Fee</label>
                <input
                  id="newHouseGarbage"
                  type="text"
                  className="input-control"
                  placeholder="e.g. 150 or N/A"
                  value={garbageFee}
                  onChange={(e) => setGarbageFee(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="newHouseDistance">Distance from KU Gate</label>
                <input
                  id="newHouseDistance"
                  type="text"
                  className="input-control"
                  placeholder="e.g. 4 mins walk"
                  required
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label" htmlFor="newHouseWater">Water Supply</label>
                <input
                  id="newHouseWater"
                  type="text"
                  className="input-control"
                  placeholder="e.g. Borehole on-site 24/7"
                  value={water}
                  onChange={(e) => setWater(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="newHouseElectricity">Electricity Setup</label>
                <select
                  id="newHouseElectricity"
                  className="input-control"
                  value={electricity}
                  onChange={(e) => setElectricity(e.target.value)}
                >
                  <option value="Individual Prepaid KPLC Token Meter">Individual Prepaid Token Meter</option>
                  <option value="Shared Sub-meter (Billed by usage)">Shared Sub-meter</option>
                  <option value="Fixed Monthly Electricity Fee">Fixed Monthly Fee</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label" htmlFor="newHouseWifi">WiFi Internet</label>
                <input
                  id="newHouseWifi"
                  type="text"
                  className="input-control"
                  placeholder="e.g. Free Fiber WiFi Included"
                  value={wifi}
                  onChange={(e) => setWifi(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="newHouseCurfew">Gate Curfew Policy</label>
                <input
                  id="newHouseCurfew"
                  type="text"
                  className="input-control"
                  placeholder="e.g. Open 24/7 (Resident Key Provided)"
                  value={gateCurfew}
                  onChange={(e) => setGateCurfew(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label" htmlFor="newHouseCaretaker">Caretaker / Contact Person Name</label>
                <input
                  id="newHouseCaretaker"
                  type="text"
                  className="input-control"
                  placeholder="e.g. John Mwangi"
                  required
                  value={caretaker}
                  onChange={(e) => setCaretaker(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="newHousePhone">Direct Phone / WhatsApp Number</label>
                <input
                  id="newHousePhone"
                  type="tel"
                  className="input-control"
                  placeholder="e.g. 0712345678"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Photo Upload Section */}
            <div className="form-field">
              <label className="form-label">Property Photos</label>
              <div
                style={{
                  border: '2px dashed var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'center',
                  background: 'var(--bg-page)',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Click to browse</span> or drag and drop photos here
                  <div style={{ fontSize: '0.75rem', marginTop: 4, color: 'var(--text-muted)' }}>
                    Add clear photos of the room interior, washroom, and building entrance.
                  </div>
                </div>
              </div>

              {/* Photo Previews */}
              {uploadedPhotos.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                  {uploadedPhotos.map((photo, idx) => (
                    <div key={idx} style={{ position: 'relative', width: 72, height: 72, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                      <img src={photo} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        style={{
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          background: 'rgba(0,0,0,0.6)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: 18,
                          height: 18,
                          fontSize: 10,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Popular Amenities / Features Checkboxes */}
            <div className="form-field">
              <label className="form-label">Available Amenities</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px', marginTop: '6px' }}>
                {POPULAR_FEATURES.map((feat) => {
                  const isChecked = selectedFeatures.includes(feat);
                  return (
                    <label
                      key={feat}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        background: isChecked ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg-page)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: isChecked ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleFeature(feat)}
                        style={{ accentColor: 'var(--primary)' }}
                      />
                      <span>{feat}</span>
                    </label>
                  );
                })}
              </div>

              {/* Custom features chips */}
              {selectedFeatures.filter(f => !POPULAR_FEATURES.includes(f)).length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                  {selectedFeatures.filter(f => !POPULAR_FEATURES.includes(f)).map((cf) => (
                    <span
                      key={cf}
                      style={{
                        background: 'var(--accent)',
                        color: '#000',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '16px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {cf}
                      <button
                        type="button"
                        onClick={() => removeFeature(cf)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', padding: 0 }}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add custom feature input */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <input
                  type="text"
                  className="input-control"
                  placeholder="Add custom amenity (e.g. Wardrobe, Study desk)..."
                  value={customFeature}
                  onChange={(e) => setCustomFeature(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomFeature();
                    }
                  }}
                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.88rem' }}
                />
                <button
                  type="button"
                  className="btn"
                  onClick={addCustomFeature}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  + Add Feature
                </button>
              </div>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="newHouseRules">
                Building Regulations (One rule per line)
              </label>
              <textarea
                id="newHouseRules"
                rows="3"
                className="input-control"
                placeholder="e.g. Quiet study hours after 10 PM&#10;Rent due by the 5th of each month&#10;Guests allowed with notification"
                value={rulesText}
                onChange={(e) => setRulesText(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="newHouseDescription">Detailed Description</label>
              <textarea
                id="newHouseDescription"
                rows="3"
                className="input-control"
                placeholder="Describe the room size, ventilation, security features, student community..."
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontWeight: 700 }}>
              Add House
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
