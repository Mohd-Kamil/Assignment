import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  otp: yup.string().length(6, 'OTP must be 6 digits'),
});

type FormData = {
  email: string;
  otp: string;
};

const SignIn: React.FC = () => {
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, getValues } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const requestOtp = async () => {
    setError('');
    setLoading(true);
    const { email } = getValues();
    try {
      await axios.post('https://assignment-jv6e.onrender.com/api/auth/request-otp', {
        email,
        signup: false,
      });
      setOtpSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('https://assignment-jv6e.onrender.com/api/auth/verify-otp', {
        email: data.email,
        otp: data.otp,
      });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('https://assignment-jv6e.onrender.com/api/auth/google-login', {
        idToken: credentialResponse.credential,
      });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign in failed');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6">Sign in</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1">Email</label>
            <input type="email" {...register('email')} className="w-full border rounded px-3 py-2" disabled={otpSent} />
            {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
          </div>
          {otpSent && (
            <div>
              <label className="block mb-1">OTP</label>
              <input type="text" {...register('otp')} className="w-full border rounded px-3 py-2" />
              {errors.otp && <span className="text-red-500 text-sm">{errors.otp.message}</span>}
            </div>
          )}
          {!otpSent ? (
            <button type="button" onClick={requestOtp} className="w-full bg-blue-600 text-white py-2 rounded" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Get OTP'}
            </button>
          ) : (
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          )}
        </form>
        <div className="my-4 flex items-center justify-center">
          <span className="text-gray-500">or</span>
        </div>
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            width="100%"
          />
        </div>
        <div className="mt-4 text-center">
          Need an account? <a href="/signup" className="text-blue-600">Sign up</a>
        </div>
      </div>
    </div>
  );
};

export default SignIn; 