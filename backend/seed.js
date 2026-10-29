const fs = require('fs');
const path = require('path');
const supabase = require('./supabase');

async function seed() {
  console.log('--- Starting KejaKU Supabase Data Seed ---');

  // 1. Seed Houses
  try {
    const housesPath = path.join(__dirname, 'data/houses.json');
    if (fs.existsSync(housesPath)) {
      const rawHouses = JSON.parse(fs.readFileSync(housesPath, 'utf8') || '[]');
      console.log(`Found ${rawHouses.length} houses to seed...`);

      const formattedHouses = rawHouses.map(h => ({
        id: h.id,
        title: h.title,
        area: h.area,
        landmark: h.landmark,
        type: h.type,
        floor: h.floor,
        vacant_units: h.vacantUnits ?? 1,
        rent: h.rent,
        deposit: h.deposit,
        garbage_fee: h.garbageFee ?? 0,
        distance: h.distance,
        water: h.water,
        electricity: h.electricity,
        wifi: h.wifi,
        gate_curfew: h.gateCurfew,
        status: h.status || 'visited',
        verified_date: h.verifiedDate,
        caretaker: h.caretaker,
        phone: h.phone,
        whatsapp: h.whatsapp,
        image: h.image,
        images: h.images || [],
        features: h.features || [],
        rules: h.rules || [],
        description: h.description,
      }));

      const { data, error } = await supabase
        .from('houses')
        .upsert(formattedHouses, { onConflict: 'id' });

      if (error) {
        console.error('❌ Error seeding houses:', error.message);
      } else {
        console.log(`✅ Successfully seeded ${formattedHouses.length} houses into Supabase!`);
      }
    }
  } catch (err) {
    console.error('Error reading houses data:', err);
  }

  // 2. Seed Accounts if any exist
  try {
    const accountsPath = path.join(__dirname, 'data/accounts.json');
    if (fs.existsSync(accountsPath)) {
      const rawAccounts = JSON.parse(fs.readFileSync(accountsPath, 'utf8') || '[]');
      if (rawAccounts.length > 0) {
        console.log(`Found ${rawAccounts.length} accounts to seed...`);
        const formattedAccounts = rawAccounts.map(a => ({
          id: a.id,
          name: a.name,
          email: a.email,
          password_hash: a.passwordHash,
          phone: a.phone,
          role: a.role || 'owner',
          house_ids: a.houseIds || [],
          avatar: a.avatar || null,
        }));

        const { error } = await supabase
          .from('accounts')
          .upsert(formattedAccounts, { onConflict: 'id' });

        if (error) {
          console.error('❌ Error seeding accounts:', error.message);
        } else {
          console.log(`✅ Successfully seeded ${formattedAccounts.length} accounts into Supabase!`);
        }
      }
    }
  } catch (err) {
    console.error('Error reading accounts data:', err);
  }

  console.log('--- Seed Finished ---');
}

seed();
