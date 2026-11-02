const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const bcrypt = require("bcryptjs");
const supabase = require("./supabase");

async function seedSuperAdmin() {
  const email =
    process.argv[2] || process.env.ADMIN_EMAIL || "admin@kejaku.co.ke";
  const password =
    process.argv[3] || process.env.ADMIN_PASSWORD || "Admin@Keja2026!";
  const name = "KejaKU Super Admin";

  console.log(`Setting up super_admin for: ${email}`);

  // Check if account already exists
  const { data: existing, error: findErr } = await supabase
    .from("accounts")
    .select("id, email, role")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (existing) {
    console.log(
      `Account found (ID: ${existing.id}, Current Role: ${existing.role}). Promoting to super_admin...`,
    );
    const { error: updateErr } = await supabase
      .from("accounts")
      .update({ role: "super_admin", updated_at: new Date().toISOString() })
      .eq("id", existing.id);

    if (updateErr) {
      console.error("Failed to promote user:", updateErr.message);
      process.exit(1);
    }
    console.log(`✅ User ${email} is now a super_admin!`);
    process.exit(0);
  }

  // If not existing, create a new one
  console.log(
    `No account found with ${email}. Creating new super_admin account...`,
  );
  const passwordHash = await bcrypt.hash(password, 10);
  const adminId = "admin_" + Date.now();

  const { error: insertErr } = await supabase.from("accounts").insert([
    {
      id: adminId,
      name,
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      phone: "+254700000000",
      role: "super_admin",
      house_ids: [],
    },
  ]);

  if (insertErr) {
    console.error("Failed to create super_admin:", insertErr.message);
    process.exit(1);
  }

  console.log(`✅ Super admin created successfully!`);
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  process.exit(0);
}

seedSuperAdmin();
