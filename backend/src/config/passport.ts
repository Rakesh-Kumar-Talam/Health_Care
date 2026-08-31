import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';
import Patient from '../models/Patient';

export const configurePassport = () => {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_ID !== 'mock_google_client_id') {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error('No email found in Google profile'), undefined);
            }

            let user = await User.findOne({ email });
            if (!user) {
              user = await User.create({
                name: profile.displayName || 'User',
                email,
                googleId: profile.id,
                avatar: profile.photos?.[0]?.value || '',
                role: 'patient',
              });

              await Patient.create({
                userId: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
              });
            }
            return done(null, user);
          } catch (error) {
            return done(error, undefined);
          }
        }
      )
    );
  }
};
