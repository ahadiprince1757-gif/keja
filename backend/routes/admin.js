const express = require("express");
const router = express.Router();
const supabase = require("../supabase");
const { requireAuth, requireRole } = require("../middleware/auth");

// All endpoints in this router require authentication and super_admin role
router.use(requireAuth, requireRole("super_admin"));

/**
 * GET /api/admin/stats
 * Aggregated stats for the admin dashboard
 */
router.get("/stats", async (req, res) => {
  try {
    const [
      { count: totalUsers, error: errUsers },
      { count: totalHouses, error: errHouses },
      { count: verifiedHouses, error: errVer },
      { count: totalEnquiries, error: errEnq },
    ] = await Promise.all([
      supabase.from("accounts").select("*", { count: "exact", head: true }),
      supabase.from("houses").select("*", { count: "exact", head: true }),
      supabase
        .from("houses")
        .select("*", { count: "exact", head: true })
        .eq("status", "verified"),
      supabase.from("enquiries").select("*", { count: "exact", head: true }),
    ]);

    if (errUsers || errHouses || errVer || errEnq) {
      console.error(
        "Error fetching admin stats:",
        errUsers || errHouses || errVer || errEnq,
      );
      return res
        .status(500)
        .json({ success: false, error: "Database query failed" });
    }

    // Role breakdown
    const { data: owners } = await supabase
      .from("accounts")
      .select("id", { count: "exact" })
      .eq("role", "owner");
    const { data: students } = await supabase
      .from("accounts")
      .select("id", { count: "exact" })
      .eq("role", "student");

    return res.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalLandlords: owners?.length || 0,
        totalStudents: students?.length || 0,
        totalHouses: totalHouses || 0,
        verifiedHouses: verifiedHouses || 0,
        unverifiedHouses: Math.max(
          0,
          (totalHouses || 0) - (verifiedHouses || 0),
        ),
        totalEnquiries: totalEnquiries || 0,
      },
    });
  } catch (err) {
    console.error("Server error fetching admin stats:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
});

/**
 * GET /api/admin/users
 * Search and filter users
 */
router.get("/users", async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = supabase
      .from("accounts")
      .select("id, name, email, phone, role, avatar, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (role && role !== "all") {
      query = query.eq("role", role);
    }
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`,
      );
    }

    const { data, error } = await query;
    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true, users: data || [] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/admin/users/:id/role
 * Change a user's role (e.g. promote to super_admin or owner)
 */
router.patch("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["student", "owner", "super_admin"].includes(role)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid role provided" });
    }

    const { data, error } = await supabase
      .from("accounts")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .select("id, name, email, role")
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({
      success: true,
      user: data,
      message: "User role updated successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete or ban user
 */
router.delete("/users/:id", async (req, res) => {
  try {
    // Prevent admin from deleting themselves accidentally
    if (req.params.id === req.user.id) {
      return res
        .status(400)
        .json({
          success: false,
          error: "You cannot delete your own admin account.",
        });
    }

    const { error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", req.params.id);

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/houses
 * List all houses across all owners
 */
router.get("/houses", async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = supabase
      .from("houses")
      .select("*, accounts:owner_id(id, name, email, phone)")
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,area.ilike.%${search}%,type.ilike.%${search}%`,
      );
    }

    const { data, error } = await query;
    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true, houses: data || [] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/admin/houses/:id/verify
 * Toggle or set house verification status
 */
router.patch("/houses/:id/verify", async (req, res) => {
  try {
    const { status } = req.body; // e.g. 'verified' or 'visited'
    const newStatus = status === "verified" ? "verified" : "visited";
    const verifiedDate =
      newStatus === "verified" ? new Date().toISOString().split("T")[0] : null;

    const { data, error } = await supabase
      .from("houses")
      .update({
        status: newStatus,
        verified_date: verifiedDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({
      success: true,
      house: data,
      message: `House marked as ${newStatus}`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/admin/houses/:id
 * Delete a listing
 */
router.delete("/houses/:id", async (req, res) => {
  try {
    const { error } = await supabase
      .from("houses")
      .delete()
      .eq("id", req.params.id);

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({
      success: true,
      message: "House listing deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/enquiries
 * Retrieve enquiries for auditing
 */
router.get("/enquiries", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true, enquiries: data || [] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
