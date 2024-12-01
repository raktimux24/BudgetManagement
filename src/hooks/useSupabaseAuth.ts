import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export function useSupabaseAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });
      
      if (signUpError) {
        throw signUpError;
      }
      
      if (!authData.user) {
        throw new Error('No user returned from signup');
      }

      // Create a profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            full_name: name,
            email: email,
            updated_at: new Date().toISOString()
          }
        ]);

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Don't throw here, as the user is already created
      }
      
      // After signup, user needs to verify their email
      navigate('/verify-email');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    signIn,
    signUp,
    signOut
  };
}