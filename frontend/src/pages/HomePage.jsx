import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import FilterSidebar from "../components/FilterSidebar";
import HouseCard from "../components/HouseCard";
import HowItWorks from "../components/HowItWorks";
import Footer from "../components/Footer";
import HouseDetailsModal from "../components/HouseDetailsModal";
import EnquiryModal from "../components/EnquiryModal";
import ListHouseModal from "../components/ListHouseModal";
import Toast from "../components/Toast";
import { defaultHouses } from "../data/houses";

const STORAGE_SAVED_KEY = "kejaku_saved_houses_v2";

export default function HomePage() {
  // Houses state
  const [houses, setHouses] = useState(() => {
    return defaultHouses;
  });

  // Filter state
  const [filters, setFilters] = useState({
    keyword: "",
    area: "",
    type: "",
    minRent: 0,
    maxRent: 15000,
    verifiedOnly: false,
    savedOnly: false,
    sortBy: "recommended",
  });

  // Saved bookmark IDs state
  const [savedIds, setSavedIds] = useState(() => {
    try {
      return new Set(
        JSON.parse(localStorage.getItem(STORAGE_SAVED_KEY) || "[]"),
      );
    } catch {
      return new Set();
    }
  });

  // Modals state
  const [selectedHouseForDetails, setSelectedHouseForDetails] = useState(null);
  const [selectedHouseForEnquiry, setSelectedHouseForEnquiry] = useState(null);
  const [isListHouseOpen, setIsListHouseOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ message: "", type: "info" });

  // Sync saved set with localStorage
  const triggerToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: "", type: "info" });
    }, 3200);
  };

  const handleToggleSave = (house) => {
    setSavedIds((prev) => {
      const updated = new Set(prev);
      const numId = Number(house.id);
      if (updated.has(numId)) {
        updated.delete(numId);
        triggerToast(`Removed "${house.title}" from saved houses.`);
      } else {
        updated.add(numId);
        triggerToast(`Saved "${house.title}" to your list!`);
      }
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify([...updated]));
      return updated;
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      keyword: "",
      area: "",
      type: "",
      minRent: 0,
      maxRent: 15000,
      verifiedOnly: false,
      savedOnly: false,
      sortBy: "recommended",
    });
  };

  const handleOpenSavedOnly = () => {
    setFilters((prev) => ({ ...prev, savedOnly: !prev.savedOnly }));
  };

  // Fetch houses from backend API on mount with fallback to local houses
  useEffect(() => {
    fetch("/api/houses")
      .then((res) => {
        if (!res.ok) throw new Error("API failed");
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.data) && data.data.length > 0) {
          setHouses(data.data);
        }
      })
      .catch(() => {
        // Fallback default houses already set
      });
  }, []);

  // Filtered and sorted listings
  const filteredHouses = useMemo(() => {
    const rawSearch = filters.keyword.trim().toLowerCase();
    const searchTokens = rawSearch ? rawSearch.split(/\s+/).filter(Boolean) : [];

    return houses.filter((house) => {
      if (searchTokens.length > 0) {
        // Collect all searchable text from house
        const houseCorpus = [
          house.title || "",
          house.area || "",
          house.landmark || "",
          house.description || "",
          house.type || "",
          house.water || "",
          house.electricity || "",
          house.wifi || "",
          ...(house.features || [])
        ].join(" ").toLowerCase();

        // Every token must match somewhere in the house data
        const matchesAllTokens = searchTokens.every((token) =>
          houseCorpus.includes(token)
        );

        if (!matchesAllTokens) return false;
      }

      if (filters.area && house.area !== filters.area) return false;
      if (filters.type && house.type !== filters.type) return false;
      if (house.rent > filters.maxRent || house.rent < filters.minRent)
        return false;
      if (filters.verifiedOnly && house.status !== "visited") return false;
      if (filters.savedOnly && !savedIds.has(Number(house.id))) return false;

      return true;
    });
  }, [houses, filters, savedIds]);

  return (
    <>
      <Navbar
        savedCount={savedIds.size}
        onOpenSaved={handleOpenSavedOnly}
        onOpenListHouse={() => setIsListHouseOpen(true)}
        searchTerm={filters.keyword}
        onSearchChange={(val) => handleFilterChange("keyword", val)}
      />

      <main className="container">
        <div className="content-layout">
          <FilterSidebar
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            isOpenMobile={isMobileFiltersOpen}
            onToggleMobile={() => setIsMobileFiltersOpen((prev) => !prev)}
          />

          <section id="listingsSection">
            <div className="results-header">
              <div className="results-meta">
                <h2 className="results-count-title" id="resultsSectionTitle">
                  {filters.savedOnly
                    ? `Your Saved Houses (${filteredHouses.length})`
                    : filters.keyword
                    ? `Results for "${filters.keyword}" (${filteredHouses.length})`
                    : `Available Student Rentals (${filteredHouses.length})`}
                </h2>
              </div>
            </div>

            <div className="listings-grid" id="listingsGrid">
              {filteredHouses.length === 0 ? (
                <div className="no-results-card">
                  <div className="no-results-icon">🔍</div>
                  <h3 className="no-results-title">No houses match "{filters.keyword || 'your filters'}"</h3>
                  <p className="no-results-subtitle">
                    Try searching for different spots around KU or click a popular area below:
                  </p>
                  
                  <div className="no-results-suggestions">
                    {['Transformer (KM)', 'Kwa Symo', 'Magunas', 'Quickmart', 'Bedsitter', 'Single room'].map((tag) => {
                      const cleanKeyword = tag.replace(/\s*\(KM\)/, '');
                      return (
                        <button
                          key={tag}
                          type="button"
                          className="suggestion-chip"
                          onClick={() => handleFilterChange("keyword", cleanKeyword)}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ marginTop: "20px" }}
                    onClick={handleResetFilters}
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                filteredHouses.map((house) => (
                  <HouseCard
                    key={house.id}
                    house={house}
                    isSaved={savedIds.has(Number(house.id))}
                    onToggleSave={handleToggleSave}
                    onViewDetails={(h) => setSelectedHouseForDetails(h)}
                    onEnquire={(h) => setSelectedHouseForEnquiry(h)}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </main>

      <HowItWorks />
      <Footer />

      {/* Modals */}
      {selectedHouseForDetails && (
        <HouseDetailsModal
          house={selectedHouseForDetails}
          onClose={() => setSelectedHouseForDetails(null)}
          onOpenEnquiry={(h) => setSelectedHouseForEnquiry(h)}
        />
      )}

      {selectedHouseForEnquiry && (
        <EnquiryModal
          house={selectedHouseForEnquiry}
          onClose={() => setSelectedHouseForEnquiry(null)}
          onSubmitSuccess={(msg) => triggerToast(msg, "info")}
        />
      )}

      {isListHouseOpen && (
        <ListHouseModal
          onClose={() => setIsListHouseOpen(false)}
          onHouseCreated={(newH) => {
            setHouses((prev) => [newH, ...prev]);
            triggerToast("Property listing published successfully!");
          }}
        />
      )}

      {/* Toast Notification */}
      <Toast message={toast.message} type={toast.type} />

      {/* Smart Mobile Bottom Navigation */}
      <BottomNav
        savedCount={savedIds.size}
        isSavedActive={filters.savedOnly}
        onOpenSaved={handleOpenSavedOnly}
        searchTerm={filters.keyword}
        onSearchChange={(val) => handleFilterChange("keyword", val)}
        onOpenFilters={() => setIsMobileFiltersOpen((prev) => !prev)}
      />
    </>
  );
}
