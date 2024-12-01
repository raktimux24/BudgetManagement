import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/profile';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to get the public URL for a profile picture
  const getProfilePictureUrl = useCallback(async (filePath: string): Promise<string | null> => {
    try {
      if (!filePath) {
        return null;
      }

      // If the path is already a full URL, extract just the file path
      let cleanPath = filePath;
      if (filePath.startsWith('http')) {
        const match = filePath.match(/profile-pictures\/([^?]+)/);
        if (match) {
          cleanPath = match[1];
        }
      }

      // First check if the file exists
      const { data: files, error: listError } = await supabase
        .storage
        .from('profile-pictures')
        .list(cleanPath.split('/')[0], {
          limit: 1,
          search: 'profile-picture.png'
        });

      if (listError) {
        console.error('Error checking file existence:', listError);
        return null;
      }

      if (!files || files.length === 0) {
        console.log('Profile picture file not found');
        return null;
      }

      // Get the public URL with download token
      const { data: downloadData } = await supabase
        .storage
        .from('profile-pictures')
        .createSignedUrl(cleanPath, 3600); // 1 hour expiry

      if (!downloadData?.signedUrl) {
        console.error('Failed to generate signed URL');
        return null;
      }

      return downloadData.signedUrl;
    } catch (error) {
      console.error('Error getting profile picture URL:', error);
      return null;
    }
  }, [supabase]);

  // Subscribe to profile changes
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchProfile = async () => {
      try {
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            // No profile found, create one
            const newProfile = {
              user_id: user.id,
              email: user.email,
              updated_at: new Date().toISOString()
            };

            const { data: createdProfile, error: createError } = await supabase
              .from('profiles')
              .upsert([newProfile])
              .select()
              .single();

            if (createError) throw createError;
            setProfile(createdProfile);
            return;
          }
          throw fetchError;
        }

        if (existingProfile) {
          // Update profile picture URL if needed
          if (existingProfile.profile_picture) {
            const publicUrl = await getProfilePictureUrl(existingProfile.profile_picture);
            if (publicUrl) {
              existingProfile.profile_picture = publicUrl;
            }
          }
          setProfile(existingProfile);
        } else {
          // Create new profile if it doesn't exist
          const newProfile = {
            user_id: user.id,
            email: user.email,
            updated_at: new Date().toISOString()
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .upsert([newProfile])
            .select()
            .single();

          if (createError) throw createError;
          setProfile(createdProfile);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching your profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Subscribe to realtime profile changes
    const subscription = supabase
      .channel('profile_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `user_id=eq.${user.id}`
      }, async (payload) => {
        console.log('Profile change received:', payload);
        const { data, eventType } = payload;
        
        if (eventType === 'DELETE') {
          setProfile(null);
          return;
        }

        // Update profile picture URL if needed
        if (data && data.profile_picture) {
          const publicUrl = await getProfilePictureUrl(data.profile_picture);
          if (publicUrl) {
            data.profile_picture = publicUrl;
          }
        }

        setProfile(data as Profile);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, getProfilePictureUrl]);

  async function loadProfile() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No profile found, create one
          const newProfile = {
            user_id: user.id,
            email: user.email,
            updated_at: new Date().toISOString()
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .upsert([newProfile])
            .select()
            .single();

          if (createError) throw createError;
          setProfile(createdProfile);
          return;
        }
        throw fetchError;
      }

      if (existingProfile) {
        // Update profile picture URL if needed
        if (existingProfile.profile_picture) {
          const publicUrl = await getProfilePictureUrl(existingProfile.profile_picture);
          if (publicUrl) {
            existingProfile.profile_picture = publicUrl;
          }
        }
        setProfile(existingProfile);
        return;
      }

      // If no profile exists, create one
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || null,
          phone: null,
          address: null,
          city: null,
          state: null,
          zip_code: null,
          country: null,
          bio: null,
          profile_picture: null
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setProfile(newProfile);
    } catch (err) {
      console.error('Error in profile management:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while managing your profile');
    } finally {
      setLoading(false);
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Update profile picture URL if it exists
      if (data && data.profile_picture) {
        const publicUrl = await getProfilePictureUrl(data.profile_picture);
        if (publicUrl) {
          data.profile_picture = publicUrl;
        }
      }

      setProfile(data);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while updating your profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadProfilePicture = async (file: File) => {
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      setLoading(true);
      setError(null);

      // Validate file type
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
      
      if (!fileExt || !allowedTypes.includes(fileExt)) {
        throw new Error('Invalid file type. Please upload a JPG, PNG, or GIF image.');
      }

      // Validate file size (5MB limit)
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > MAX_SIZE) {
        throw new Error('File size too large. Please upload an image smaller than 5MB.');
      }

      // Always save as PNG to ensure consistency
      const filePath = `${user.id}/profile-picture.png`;
      console.log('Uploading profile picture to:', filePath);

      // Delete existing file if it exists (ignore errors)
      await supabase.storage
        .from('profile-pictures')
        .remove([filePath])
        .then(({ error }) => {
          if (error) {
            console.warn('Error deleting existing profile picture:', error);
          }
        });

      // Upload the new file with retries
      const MAX_RETRIES = 3;
      let lastError = null;
      let uploadedData = null;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const { error: uploadError, data } = await supabase.storage
            .from('profile-pictures')
            .upload(filePath, file, { 
              contentType: 'image/png',
              cacheControl: '3600',
              upsert: true
            });

          if (uploadError) {
            lastError = uploadError;
            console.error(`Upload attempt ${attempt} failed:`, uploadError);
            if (attempt < MAX_RETRIES) {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
              continue;
            }
          } else {
            uploadedData = data;
            break;
          }
        } catch (err) {
          lastError = err;
          console.error(`Upload attempt ${attempt} failed with exception:`, err);
          if (attempt < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
        }
      }

      if (!uploadedData) {
        throw new Error(`Upload failed after ${MAX_RETRIES} attempts: ${lastError?.message || 'Unknown error'}`);
      }

      // Update profile with new file path
      await updateProfile({ 
        profile_picture: filePath,
        updated_at: new Date().toISOString()
      });

      // Get signed URL for immediate use
      const signedUrl = await getProfilePictureUrl(filePath);
      if (!signedUrl) {
        throw new Error('Failed to get signed URL for uploaded file');
      }

      return signedUrl;
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while uploading your profile picture';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const reloadProfile = () => {
    if (user) {
      loadProfile();
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadProfilePicture,
    reloadProfile
  };
}