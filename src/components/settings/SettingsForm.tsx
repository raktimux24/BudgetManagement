import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Camera } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { Profile } from '../../types/profile';

type SettingsFormData = Omit<Profile, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

type NotificationType = 'success' | 'error';

interface Notification {
  type: NotificationType;
  message: string;
}

export function SettingsForm() {
  const { profile, loading, error, updateProfile, uploadProfilePicture } = useSettings();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<Notification | null>(null);

  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<SettingsFormData>({
    defaultValues: {
      name: profile?.name ?? null,
      email: profile?.email ?? null,
      phone: profile?.phone ?? null,
      address: profile?.address ?? null,
      city: profile?.city ?? null,
      state: profile?.state ?? null,
      zip_code: profile?.zip_code ?? null,
      country: profile?.country ?? null,
      bio: profile?.bio ?? null,
      profile_picture: profile?.profile_picture ?? null
    }
  });

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Profile image load error:', e.currentTarget.src);
    setUploadError('Error loading image');
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    console.log('Profile image loaded successfully');
    setIsLoading(false);
    setUploadError(null);
  };

  // Update form values when profile changes
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        zip_code: profile.zip_code,
        country: profile.country,
        bio: profile.bio,
        profile_picture: profile.profile_picture
      });
      
      // Reset upload states
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadError(null);
      setIsLoading(!!profile.profile_picture);
    }
  }, [profile, reset]);

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const isValidImageUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.pathname.includes('/profile-pictures/') && !parsedUrl.pathname.includes('/profile-pictures/profile-pictures/');
    } catch {
      return false;
    }
  };

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const onSubmit = async (data: SettingsFormData) => {
    try {
      setIsUploading(true);
      setUploadError(null);

      // First upload the profile picture if one is selected
      let uploadedImageUrl = profile?.profile_picture;
      if (selectedFile) {
        try {
          console.log('Uploading new profile picture...');
          uploadedImageUrl = await uploadProfilePicture(selectedFile);
          console.log('Upload successful, new URL:', uploadedImageUrl);
          
          // Clear the selected file and preview after successful upload
          setSelectedFile(null);
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }
        } catch (err) {
          console.error('Upload failed:', err);
          setUploadError(err instanceof Error ? err.message : 'Error uploading image');
          showNotification('error', err instanceof Error ? err.message : 'Error uploading image');
          return;
        }
      }

      // Then update the profile with all changes including the new image URL
      await updateProfile({
        ...data,
        profile_picture: uploadedImageUrl
      });

      showNotification('success', 'Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error updating profile';
      setUploadError(errorMessage);
      showNotification('error', errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError(null);

      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      setSelectedFile(file);

      // Upload the file
      const publicUrl = await uploadProfilePicture(file);
      console.log('Profile picture uploaded successfully:', publicUrl);

      // Show success notification
      showNotification('success', 'Profile picture updated successfully');
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setUploadError(err instanceof Error ? err.message : 'Failed to upload profile picture');
      showNotification('error', err instanceof Error ? err.message : 'Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#00A6B2] border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500 bg-opacity-10 text-red-500 p-4 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] p-6">
      {notification && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            notification.type === 'success'
              ? 'bg-green-500 bg-opacity-10 text-green-500'
              : 'bg-red-500 bg-opacity-10 text-red-500'
          }`}
        >
          {notification.message}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-32 h-32">
            {isUploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                <div className="w-8 h-8 border-2 border-[#00A6B2] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {(profile?.profile_picture || previewUrl) && !uploadError ? (
                  <img
                    src={previewUrl || profile?.profile_picture}
                    alt="Profile"
                    className={`w-32 h-32 rounded-full object-cover ${
                      isLoading ? 'opacity-0' : 'opacity-100'
                    } transition-opacity duration-200`}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-[#2A2A2A] flex items-center justify-center text-white text-4xl font-medium">
                    {profile?.name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <div className="w-8 h-8 border-2 border-[#00A6B2] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col items-center space-y-2">
            <label
              htmlFor="profile-picture"
              className="flex items-center space-x-2 px-4 py-2 border border-[#2A2A2A] rounded-md bg-[#1A1A1A] text-[#C0C0C0] hover:bg-[#2A2A2A] transition-colors cursor-pointer"
            >
              <Camera className="w-5 h-5" />
              <span>Change Picture</span>
            </label>
            <input
              id="profile-picture"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
            {uploadError && (
              <p className="text-red-500 text-sm">{uploadError}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              {...register('name', { required: 'Name is required' })}
              className="w-full px-4 py-2 bg-[#121212] border border-[#2A2A2A] rounded-lg text-[#EAEAEA] focus:outline-none focus:border-[#00A6B2]"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full px-4 py-2 bg-[#121212] border border-[#2A2A2A] rounded-lg text-[#EAEAEA] focus:outline-none focus:border-[#00A6B2]"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              {...register('phone')}
              className="w-full px-4 py-2 bg-[#121212] border border-[#2A2A2A] rounded-lg text-[#EAEAEA] focus:outline-none focus:border-[#00A6B2]"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              id="address"
              {...register('address')}
              className="w-full px-4 py-2 bg-[#121212] border border-[#2A2A2A] rounded-lg text-[#EAEAEA] focus:outline-none focus:border-[#00A6B2]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                id="city"
                {...register('city')}
                className="w-full px-4 py-2 bg-[#121212] border border-[#2A2A2A] rounded-lg text-[#EAEAEA] focus:outline-none focus:border-[#00A6B2]"
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State/Province
              </label>
              <input
                type="text"
                id="state"
                {...register('state')}
                className="w-full px-4 py-2 bg-[#121212] border border-[#2A2A2A] rounded-lg text-[#EAEAEA] focus:outline-none focus:border-[#00A6B2]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700">
                ZIP/Postal Code
              </label>
              <input
                type="text"
                id="zip_code"
                {...register('zip_code')}
                className="w-full px-4 py-2 bg-[#121212] border border-[#2A2A2A] rounded-lg text-[#EAEAEA] focus:outline-none focus:border-[#00A6B2]"
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <input
                type="text"
                id="country"
                {...register('country')}
                className="w-full px-4 py-2 bg-[#121212] border border-[#2A2A2A] rounded-lg text-[#EAEAEA] focus:outline-none focus:border-[#00A6B2]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              id="bio"
              {...register('bio')}
              rows={4}
              className="w-full px-4 py-2 bg-[#121212] border border-[#2A2A2A] rounded-lg text-[#EAEAEA] focus:outline-none focus:border-[#00A6B2]"
              placeholder="Tell us a little about yourself..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            disabled={isUploading}
            className="px-4 py-2 bg-[#00A6B2] text-white rounded-lg hover:bg-[#008A94] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}