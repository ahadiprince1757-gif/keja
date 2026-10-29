import React, { useState } from 'react';

export default function ListHouseModal({ onClose, onHouseCreated }) {
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('');
  const [type, setType] = useState('Bedsitter');
  const [floor, setFloor] = useState('1st Floor');
  const [vacantUnits, setVacantUnits] = useState(1);
  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [distance, setDistance] = useState('');
  const [landmark, setLandmark] = useState('');
  const [water, setWater] = useState('Borehole on-site 24/7 (High Pressure)');
  const [electricity, setElectricity] = useState('Individual Prepaid KPLC Token Meter');
  const [wifi, setWifi] = useState('Free Fiber WiFi Included');
  const [gateCurfew, setGateCurfew] = useState('Open 24/7 (Resident Key Provided)');
  const [caretaker, setCaretaker] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [singleUrl, setSingleUrl] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedPhotos((prev) => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddUrl = () => {
    if (singleUrl.trim()) {
      setUploadedPhotos((prev) => [...prev, singleUrl.trim()]);
      setSingleUrl('');
    }
  };

  const handleRemovePhoto = (idx) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalImages = uploadedPhotos.length > 0
      ? uploadedPhotos
      : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'];

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
      garbageFee: 150,
      distance,
      water,
      electricity,
      wifi,
      gateCurfew,
      caretaker,
      phone,
      whatsapp: phone,
      status: 'visited',
      verifiedDate: 'New Listing',
      image: finalImages[0],
      images: finalImages,
      features: ['Borehole Water', 'Token Meter', 'Tiled Floor', 'Verified Listing'],
      description
    };

    fetch('/api/houses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newHouse)
    }).catch(() => {});

    onHouseCreated(newHouse);
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-container" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <h2>List a House on Keja</h2>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '18px' }}>
            List your student property on Keja. Include accurate photos, walking time to KU gates, and true rental rates.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label className="form-label" htmlFor="newHouseTitle">Listing Headline</label>
              <input
                type="text"
                id="newHouseTitle"
                className="input-control"
                placeholder="e.g. Spacious Tiled Bedsitter with Balcony & WiFi"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-grid-2 form-field">
              <div>
                <label className="form-label" htmlFor="newHouseArea">KU Zone / Area</label>
                <select
                  id="newHouseArea"
                  className="input-control"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                >
                  <option value="">Select Zone</option>
                  <option value="Kahawa Wendani">Kahawa Wendani</option>
                  <option value="Kahawa Sukari">Kahawa Sukari</option>
                  <option value="Near KU main gate">Near KU Main Gate (KM)</option>
                  <option value="Ruiru">Ruiru Campus Route</option>
                </select>
              </div>
              <div>
                <label className="form-label" htmlFor="newHouseType">Room Category</label>
                <select
                  id="newHouseType"
                  className="input-control"
                  required
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="Bedsitter">Bedsitter</option>
                  <option value="Single room">Single room</option>
                  <option value="Shared room">Shared room</option>
                  <option value="Hostel">Hostel</option>
                  <option value="1 Bedroom">1 Bedroom</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2 form-field">
              <div>
                <label className="form-label" htmlFor="newHouseFloor">Floor Level</label>
                <input
                  type="text"
                  id="newHouseFloor"
                  className="input-control"
                  placeholder="e.g. 2nd Floor, Ground Floor"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label" htmlFor="newHouseVacant">Currently Vacant Rooms</label>
                <input
                  type="number"
                  id="newHouseVacant"
                  className="input-control"
                  min="1"
                  max="50"
                  value={vacantUnits}
                  onChange={(e) => setVacantUnits(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2 form-field">
              <div>
                <label className="form-label" htmlFor="newHouseRent">Monthly Rent (KSh)</label>
                <input
                  type="number"
                  id="newHouseRent"
                  className="input-control"
                  placeholder="e.g. 5500"
                  min="1000"
                  step="100"
                  required
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="newHouseDeposit">Security Deposit (KSh)</label>
                <input
                  type="number"
                  id="newHouseDeposit"
                  className="input-control"
                  placeholder="e.g. 5500"
                  min="0"
                  step="100"
                  required
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-2 form-field">
              <div>
                <label className="form-label" htmlFor="newHouseDistance">Walk / Commute to KU Gate</label>
                <input
                  type="text"
                  id="newHouseDistance"
                  className="input-control"
                  placeholder="e.g. 6 min walk to KU Nyayo Gate"
                  required
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="newHouseLandmark">Specific Landmark / Route</label>
                <input
                  type="text"
                  id="newHouseLandmark"
                  className="input-control"
                  placeholder="e.g. Behind Magunas Supermarket"
                  required
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-2 form-field">
              <div>
                <label className="form-label" htmlFor="newHouseWater">Water Supply</label>
                <input
                  type="text"
                  id="newHouseWater"
                  className="input-control"
                  value={water}
                  onChange={(e) => setWater(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label" htmlFor="newHouseElectricity">Electricity</label>
                <input
                  type="text"
                  id="newHouseElectricity"
                  className="input-control"
                  value={electricity}
                  onChange={(e) => setElectricity(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2 form-field">
              <div>
                <label className="form-label" htmlFor="newHouseWifi">Wi-Fi Connection</label>
                <input
                  type="text"
                  id="newHouseWifi"
                  className="input-control"
                  value={wifi}
                  onChange={(e) => setWifi(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="newHouseCurfew">Gate Hours</label>
                <input
                  type="text"
                  id="newHouseCurfew"
                  className="input-control"
                  value={gateCurfew}
                  onChange={(e) => setGateCurfew(e.target.value)}
                />
              </div>
            </div>

            {/* Multi-Image Upload */}
            <div className="form-field image-upload-section">
              <label className="form-label">Property Photos (Upload Multiple)</label>
              
              <div
                className={`file-dropzone ${isDragOver ? 'drag-over' : ''}`}
                onClick={() => document.getElementById('multiFileInput')?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  handleFiles(e.dataTransfer.files);
                }}
              >
                <input
                  type="file"
                  id="multiFileInput"
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <div>
                  <strong>Click to upload photos</strong> or drag & drop images here
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Supports PNG, JPG, WebP. First image becomes the cover photo.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <input
                  type="url"
                  className="input-control"
                  placeholder="Or paste an image URL..."
                  value={singleUrl}
                  onChange={(e) => setSingleUrl(e.target.value)}
                />
                <button
                  type="button"
                  className="btn"
                  onClick={handleAddUrl}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  + Add URL
                </button>
              </div>

              {uploadedPhotos.length > 0 && (
                <div className="upload-preview-grid">
                  {uploadedPhotos.map((imgSrc, idx) => (
                    <div key={idx} className={`upload-thumb-card ${idx === 0 ? 'is-cover' : ''}`}>
                      <img src={imgSrc} alt={`Uploaded photo ${idx + 1}`} />
                      {idx === 0 && <span className="cover-tag">Cover</span>}
                      <button
                        type="button"
                        className="thumb-remove-btn"
                        onClick={() => handleRemovePhoto(idx)}
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-grid-2 form-field">
              <div>
                <label className="form-label" htmlFor="newHouseCaretaker">Caretaker / Landlord Name</label>
                <input
                  type="text"
                  id="newHouseCaretaker"
                  className="input-control"
                  placeholder="e.g. Mr. Mwangi"
                  required
                  value={caretaker}
                  onChange={(e) => setCaretaker(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="newHousePhone">Phone / WhatsApp Number</label>
                <input
                  type="tel"
                  id="newHousePhone"
                  className="input-control"
                  placeholder="+254 712 345 678"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
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
              Publish Property Listing
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
