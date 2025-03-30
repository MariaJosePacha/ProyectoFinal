import passport from 'passport'; 
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import { sendVerificationEmail } from '../config/nodemailer.js'; 

dotenv.config();

passport.use(
  'register',
  new LocalStrategy(
    { usernameField: 'email', passReqToCallback: true },
    async (req, email, password, done) => {
      try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
          return done(null, false, { message: 'El usuario ya existe' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email,
          password: hashedPassword,
          role: 'user', 
          isVerified: false, 
        });

        await newUser.save();

        const verificationCode = Math.floor(100000 + Math.random() * 900000); 
        await sendVerificationEmail(newUser.email, verificationCode);


        newUser.verificationCode = verificationCode;
        await newUser.save();

        return done(null, newUser);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// 📌 Estrategia de Login
passport.use(
  'login',
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });

        if (!user) {
          return done(null, false, { message: 'Usuario no encontrado' });
        }

        // ✅ Verificación de cuenta
        if (!user.isVerified) {
          return done(null, false, { message: 'Usuario no verificado. Revisa tu email.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Contraseña incorrecta' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);


passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'default_secret',
    },
    async (jwt_payload, done) => {
      try {
        const user = await User.findById(jwt_payload.id); 
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) return done(null, false);
    done(null, user);
  } catch (error) {
    done(error, false);
  }
});

export default passport;
