import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({
      usernameField: 'email'
    }, async (email, password, done) => {
      const user = await storage.getUserByEmail(email);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    const { username, email, password } = req.body;
    
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).send("Email already exists");
    }

    const user = await storage.createUser({
      username,
      email,
      password: await hashPassword(password),
    });

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
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

  app.post("/api/auth/request-password-reset", async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "El correo electrónico es requerido" });
    }

    try {
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(200).json({ 
          message: "Si el correo existe, recibirás instrucciones para restablecer tu contraseña" 
        });
      }

      const token = generateResetToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await storage.createPasswordReset({
        userId: user.id,
        token,
        expiresAt,
        used: false
      });

      res.status(200).json({ 
        message: "Si el correo existe, recibirás instrucciones para restablecer tu contraseña",
        token,
        resetLink: `${req.protocol}://${req.get('host')}/reset-password/${token}`
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error al procesar la solicitud" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token y nueva contraseña son requeridos" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    try {
      const resetRecord = await storage.getPasswordResetByToken(token);

      if (!resetRecord) {
        return res.status(400).json({ message: "Token inválido o expirado" });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(resetRecord.userId, { password: hashedPassword });
      await storage.markPasswordResetAsUsed(token);

      res.status(200).json({ message: "Contraseña actualizada exitosamente" });
    } catch (error: any) {
      res.status(500).json({ message: "Error al restablecer la contraseña" });
    }
  });
}
