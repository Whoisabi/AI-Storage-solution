import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import type { Express, RequestHandler } from 'express';
import { storage } from './storage';
import { signupSchema, loginSchema } from '@shared/schema';
import { ZodError } from 'zod';

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-here',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  });
}

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy for email/password authentication
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });
      } catch (error) {
        return done(error);
      }
    }
  ));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (user) {
        done(null, { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName });
      } else {
        done(null, false);
      }
    } catch (error) {
      done(error);
    }
  });

  // Signup endpoint
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = signupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const userId = nanoid();
      
      const newUser = await storage.createUser({
        id: userId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });

      // Log the user in automatically after signup
      req.login({ id: newUser.id, email: newUser.email, firstName: newUser.firstName, lastName: newUser.lastName }, (err) => {
        if (err) {
          console.error('Login error after signup:', err);
          return res.status(500).json({ message: 'Account created but login failed' });
        }
        res.json({ 
          success: true, 
          message: 'Account created successfully',
          user: { id: newUser.id, email: newUser.email, firstName: newUser.firstName, lastName: newUser.lastName }
        });
      });
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      passport.authenticate('local', (err: any, user: any, info: any) => {
        if (err) {
          console.error('Authentication error:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }
        
        if (!user) {
          return res.status(401).json({ message: info?.message || 'Invalid email or password' });
        }

        req.login(user, (loginErr) => {
          if (loginErr) {
            console.error('Login error:', loginErr);
            return res.status(500).json({ message: 'Login failed' });
          }
          
          res.json({ 
            success: true, 
            message: 'Login successful',
            user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }
          });
        });
      })(req, res);
    } catch (error) {
      console.error('Login validation error:', error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      req.session.destroy((sessionErr) => {
        if (sessionErr) {
          console.error('Session destroy error:', sessionErr);
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Logout successful' });
      });
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};