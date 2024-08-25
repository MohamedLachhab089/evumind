import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcrypt";
import User from "./Schema/User.js";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from "cors";

const server = express();
const PORT = 3000;

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

server.use(express.json());
server.use(cors());

mongoose.connect(process.env.DB_LOCATION, {
  autoIndex: true,
});

const FormatDataToSend = (user) => {
  const accessToken = jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY);
  return {
    accessToken,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
  };
};

const generateUsername = async (email) => {
  let username = email.split("@")[0];

  let usernameExists = await User.exists({
    "personal_info.username": username,
  }).then((result) => result);

  usernameExists ? (username += nanoid().substring(0, 5)) : "";

  return username;
};

server.post("/signup", (req, res) => {
  const { fullname, email, password } = req.body;

  // Validate data from frontend
  if (fullname.length < 3) {
    return res
      .status(403)
      .json({ message: "Full name must be at least 3 characters long" });
  }
  if (!email.length) {
    return res.status(403).json({ message: "Enter Email" });
  }
  if (!emailRegex.test(email)) {
    return res.status(403).json({ message: "Invalid Email" });
  }
  if (!password.length) {
    return res.status(403).json({ message: "Enter Password" });
  }
  if (!passwordRegex.test(password)) {
    return res.status(403).json({
      message:
        "Password must be between 6 and 20 characters long and contain at least one uppercase, one lowercase, and one number",
    });
  }

  // Bcrypt password
  bcrypt.hash(password, 10, async (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ message: "Error hashing password" });
    }

    const username = await generateUsername(email);

    const user = new User({
      personal_info: {
        fullname,
        email,
        password: hashedPassword,
        username,
      },
    });

    user
      .save()
      .then((u) => {
        return res.status(200).json(FormatDataToSend(u));
      })
      .catch((err) => {
        if (err.code == 11000) {
          return res.status(500).json({ error: "Email already exists" });
        }
        return res.status(500).json({ message: "Error saving user" });
      });
  });
});

server.post("/signin", (req, res) => {
  const { email, password } = req.body;

  User.findOne({
    "personal_info.email": email,
  })
    .then((user) => {
      if (!user) {
        return res.status(403).json({ "error": "Email not found" });
      }

      bcrypt.compare(password, user.personal_info.password, (err, result) => {
        if (err) {
          return res
            .status(403)
            .json({ message: "Invalid credentials please try again" });
        }
        if (!result) {
          return res.status(403).json({ "error": "Invalid password" });
        } else {
          return res.status(200).json(FormatDataToSend(user));
        }
      });
    })
    .catch((err) => {
      console.error("Error document", err);
      return res.status(500).json({ error: err.message });
    });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
