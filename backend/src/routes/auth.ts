import { Router, Request, Response } from 'express';
import { generateOTP } from '../utils/otp';
import { sendEmail } from '../utils/email';
import jwt from 'jsonwebtoken';
import { verifyGoogleToken } from '../utils/googleAuth';
import { supabase } from '../utils/supabase';

const router = Router();

// In-memory OTP store: { [email]: { otp, expiresAt } }
const otpStore: Record<string, { otp: string; expiresAt: number }> = {};

// Request OTP endpoint
router.post('/request-otp', async (req: Request, res: Response) => {
  const { email, name, dob } = req.body;
  if (!email || (req.body.signup && (!name || !dob))) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  // For signup, check if user already exists
  if (req.body.signup) {
    const { data: existingUser, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists.' });
    }
  }

  // For login, check if user exists
  if (!req.body.signup) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    if (!user) {
      return res.status(400).json({ error: 'User not found.' });
    }
  }

  const otp = generateOTP();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore[email] = { otp, expiresAt };

  try {
    await sendEmail(
      email,
      'Your OTP Code',
      `Your OTP code is: ${otp}. It expires in 5 minutes.`
    );
    res.json({ message: 'OTP sent to email.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP email.' });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', async (req: Request, res: Response) => {
  const { email, otp, name, dob } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  const record = otpStore[email];
  if (!record || record.otp !== otp) {
    return res.status(400).json({ error: 'Invalid OTP.' });
  }
  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ error: 'OTP expired.' });
  }
  delete otpStore[email];

  // Find user by email
  let { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  // Signup flow
  if (!user && name && dob) {
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ name, email }])
      .select()
      .single();
    user = newUser;
  }
  // Login flow
  if (!user) {
    return res.status(400).json({ error: 'User not found. Please sign up.' });
  }

  // Issue JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );
  res.json({ token, user: { name: user.name, email: user.email, id: user.id } });
});

// Google OAuth login endpoint
router.post('/google-login', async (req: Request, res: Response) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: 'Missing Google ID token.' });
  }
  try {
    const payload = await verifyGoogleToken(idToken);
    if (!payload.email || !payload.name || !payload.sub) {
      return res.status(400).json({ error: 'Invalid Google token payload.' });
    }
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', payload.email)
      .single();
    if (!user) {
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{ name: payload.name, email: payload.email, google_id: payload.sub }])
        .select()
        .single();
      user = newUser;
    }
    // Issue JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { name: user.name, email: user.email, id: user.id } });
  } catch (err) {
    res.status(401).json({ error: 'Google authentication failed.' });
  }
});

export default router; 