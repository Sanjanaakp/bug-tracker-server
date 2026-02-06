const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d"
  });
};

// ================= REGISTER =================
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      name,
      email,
      password
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= LOGIN =================
const loginUser = async (req, res) => {
 try {
  const { email, password } = req.body;

  if (!email || !password)
   return res.status(400).json({ message: "Email and password required" });

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {

   res.json({
    token: generateToken(user._id),
    user: {
     _id: user._id,
     name: user.name,
     email: user.email
    }
   });

  } else {
   res.status(401).json({ message: "Invalid credentials" });
  }

 } catch (err) {
  res.status(500).json({ message: err.message });
 }
};


module.exports = {
  registerUser,
  loginUser
};
