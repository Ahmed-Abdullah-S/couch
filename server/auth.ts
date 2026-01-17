import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User, insertUserSchema } from "@shared/schema";
import { comparePasswords } from "./utils";

declare global {
  namespace Express {
    interface User extends User {}
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "r3pl1t_s3cr3t_k3y",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: app.get("env") === "production",
    },
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
      },
      async (username, password, done) => {
        try {
          if (!username || !password) {
            return done(null, false, { message: "Username and password are required" });
          }

          const user = await storage.getUserByUsername(username);
          if (!user) {
            return done(null, false, { message: "Invalid username or password" });
          }

          const isPasswordValid = await comparePasswords(password, user.password);
          if (!isPasswordValid) {
            return done(null, false, { message: "Invalid username or password" });
          }

          return done(null, user);
        } catch (err: any) {
          console.error("Passport authentication error:", err);
          return done(err, false, { message: "Authentication failed. Please try again." });
        }
      }
    ),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Validate request body
      if (!req.body.username || !req.body.password) {
        return res.status(400).json({ 
          error: "Missing required fields",
          message: "Username and password are required" 
        });
      }

      // Validate username format
      if (req.body.username.length < 3) {
        return res.status(400).json({ 
          error: "Invalid username",
          message: "Username must be at least 3 characters long" 
        });
      }

      // Validate password strength
      if (req.body.password.length < 6) {
        return res.status(400).json({ 
          error: "Invalid password",
          message: "Password must be at least 6 characters long" 
        });
      }

      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ 
          error: "Username already exists",
          message: "This username is already taken. Please choose another one." 
        });
      }

      const user = await storage.createUser(req.body);
      req.login(user, (err) => {
        if (err) {
          console.error("Login error after registration:", err);
          return res.status(500).json({ 
            error: "Registration failed",
            message: "Account created but failed to log in. Please try logging in." 
          });
        }
        res.status(201).json(user);
      });
    } catch (err: any) {
      console.error("Registration error:", err);
      const errorMessage = err?.message || "Registration failed. Please try again.";
      res.status(500).json({ 
        error: "Registration failed",
        message: errorMessage 
      });
    }
  });

  app.post("/api/login", (req, res, next) => {
    // Validate request body
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({ 
        error: "Missing credentials",
        message: "Username and password are required" 
      });
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ 
          error: "Login failed",
          message: "An error occurred during login. Please try again." 
        });
      }
      if (!user) {
        return res.status(401).json({ 
          error: "Invalid credentials",
          message: info?.message || "Invalid username or password" 
        });
      }
      req.login(user, (loginErr: any) => {
        if (loginErr) {
          console.error("Session error:", loginErr);
          return res.status(500).json({ 
            error: "Login failed",
            message: "Failed to create session. Please try again." 
          });
        }
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
