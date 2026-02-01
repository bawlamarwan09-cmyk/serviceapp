import axios from "axios";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const register = async (req, res) => {
  try {
    let { name, email, password, role, city } = req.body;


    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hash,
      role,
      city,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );


    res.status(201).json({ user, token });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};



export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role, // 👈 HERE IS THE ANSWER
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🔐 Never send password
    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role, // 👈 FRONTEND READS THIS
      },
    });

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};


export const registerPrestataire = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      category,
      service,
      city,
      experience,
      profileImage,
      certificateImage,
      
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !category || !service || !city || !experience) {
      return res.status(400).json({ msg: "All required fields must be provided" });
    }

    // Check if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    // 🔥 STEP 1: Validate service belongs to category (before creating user)
    try {
      const serviceRes = await axios.get(
        `${process.env.CATALOG_SERVICE_URL}/services/${service}`
      );

      if (serviceRes.data.category._id.toString() !== category.toString()) {
        return res.status(400).json({ 
          msg: "Service does not belong to the selected category" 
        });
      }
    } catch (error) {
      console.error("Service validation error:", error.message);
      return res.status(400).json({ 
        msg: "Invalid service or category" 
      });
    }

    // 🔥 STEP 2: Create user in auth-db
    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hash,
      role: "prestataire",
      city, // ✅ Don't forget to save city in User model too
    });

    // 🔥 STEP 3: Generate token (use longer expiration for registration process)
    const token = jwt.sign(
      { id: user._id, role: "prestataire" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // ✅ Use same expiration as login
    );

    console.log("➡️ Creating prestataire profile:", {
      url: `${process.env.PRESTATAIRE_SERVICE_URL}/prestataires`,
      userId: user._id,
    });

    // 🔥 STEP 4: Create prestataire profile in prestataire-db
    try {
      const prestataireRes = await axios.post(
        `${process.env.PRESTATAIRE_SERVICE_URL}/prestataires`,
        {
          name,
          category,
          service,
          city,
          experience,
          profileImage,
          certificateImage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Prestataire created:", prestataireRes.data);

      res.status(201).json({
        msg: "Prestataire registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          city: user.city,
        },
        prestataire: prestataireRes.data,
        token,
      });

    } catch (prestataireError) {
      // 🔥 ROLLBACK: If prestataire creation fails, delete the user
      console.error("Prestataire creation failed:", prestataireError.response?.data || prestataireError.message);
      
      await User.findByIdAndDelete(user._id);
      
      return res.status(500).json({ 
        msg: "Failed to create prestataire profile. Please try again.",
        error: prestataireError.response?.data?.msg || "Prestataire service error"
      });
    }

  } catch (error) {
    console.error("REGISTER PRESTATAIRE ERROR:", error.message);
    res.status(500).json({ msg: "Server error during registration" });
  }
};