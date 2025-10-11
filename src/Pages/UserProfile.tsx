import React, { useState } from 'react';
import { CompleteProfile } from '../backend/authUtil';
import { useNavigate } from 'react-router-dom';

function UserProfile() {
    const [profileImg, setProfileImg] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [username, setUserName] = useState('');
    const [about, setAbout] = useState('');
    const [location, setLocation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const navigate = useNavigate();

    if(isLoading) { 
        console.log("Loading is on");
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === "string") {
                setImagePreview(reader.result);
                setError('');
            }
        };
        reader.onerror = () => {
            setError('Failed to read image file');
        }
        reader.readAsDataURL(file);
    };

    const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("proccess started");
        
        try {
            setIsLoading(true);
            setError('');
            console.log("The process is here");

            await CompleteProfile(
                imagePreview || null,
                username.trim(),
                about.trim(),
                location.trim()
            )

            console.log("Process passed through Complete Profile function");
            
            navigate('/chats', { replace: true });
        } catch (error) {
            console.error("Error updating profile:", error);
            setError('Failed to save changes. Please try again.')
            console.log("Failed to update profile ");
            
        }
        finally {
            setIsLoading(false)
            console.log("profile updated");
            
        }
    }

    const handleSkip = () => {
        if (window.confirm('Are you sure you want to skip profile setup? You can complete it later from settings.')) {
            navigate('/chats', { replace: true });
        }
    };

    return (
        <div className='flex justify-center items-center bg-gray-950 min-h-screen p-4'>
            <div className='bg-gray-900 border-2 border-gray-800 rounded-2xl sm:rounded-3xl w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto text-center p-4 sm:p-6 lg:p-8'>

                {/* Header */}
                <div className='mb-8 sm:mb-12'>
                    <h1 className='text-white font-bold text-2xl sm:text-3xl lg:text-4xl mb-2'>
                        Complete Your Profile
                    </h1>
                    <p className='text-gray-400 text-sm sm:text-base'>
                        Tell us more about yourself to get started
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className='bg-red-900/20 border border-red-500 text-red-400 p-3 rounded-lg mb-6 text-sm'>
                        {error}
                    </div>
                )}

                <form className='space-y-6' onSubmit={handleProfileUpdate}>
                    {/* Profile Image Upload */}
                    <div className='relative w-20 sm:w-24 lg:w-28 mx-auto mb-8'>
                        <div className='relative group'>
                            <img
                                src={imagePreview || "profile-icon.png"}
                                alt="Profile"
                                className='w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 mx-auto rounded-full object-cover border-4 border-gray-700 group-hover:brightness-90 transition-all duration-200'
                            />

                            {/* Upload Overlay */}
                            <label className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer'>
                                <div className='bg-white text-black rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-bold text-lg sm:text-xl'>
                                    <svg className='w-4 h-4 sm:w-5 sm:h-5' fill='currentColor' viewBox='0 0 20 20'>
                                        <path fillRule='evenodd' d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z' clipRule='evenodd' />
                                    </svg>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className='absolute inset-0 opacity-0 cursor-pointer'
                                />
                            </label>
                        </div>

                        <p className='text-xs text-gray-500 mt-2'>Click to upload photo</p>
                        {profileImg && (
                            <p className='text-xs text-green-400 mt-1'>Image selected: {profileImg.name}</p>
                        )}
                    </div>

                    {/* Form Fields */}
                    <div className='space-y-4'>
                        {/* Username */}
                        <div className='bg-gray-950 text-gray-300 flex items-center p-3 sm:p-4 rounded-lg w-full focus-within:ring-2 focus-within:ring-blue-500 transition-all'>
                            <svg className='w-5 h-5 sm:w-6 sm:h-6 mr-3 flex-shrink-0 text-gray-400' fill='currentColor' viewBox='0 0 20 20'>
                                <path fillRule='evenodd' d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' clipRule='evenodd' />
                            </svg>
                            <input
                                name="username"
                                value={username}
                                onChange={(e) => setUserName(e.target.value)}
                                className='outline-none w-full bg-transparent text-white placeholder-gray-400 text-sm sm:text-base'
                                type="text"
                                placeholder='Create a unique username'
                                required
                                minLength={3}
                                maxLength={20}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Bio */}
                        <div className='bg-gray-950 text-gray-300 flex items-start p-3 sm:p-4 rounded-lg w-full focus-within:ring-2 focus-within:ring-blue-500 transition-all'>
                            <svg className='w-5 h-5 sm:w-6 sm:h-6 mr-3 flex-shrink-0 text-gray-400 mt-1' fill='currentColor' viewBox='0 0 20 20'>
                                <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clipRule='evenodd' />
                            </svg>
                            <textarea
                                name="bio"
                                value={about}
                                onChange={(e) => setAbout(e.target.value)}
                                className='outline-none w-full bg-transparent text-white placeholder-gray-400 text-sm sm:text-base resize-none'
                                rows={3}
                                placeholder='Write something about yourself...'
                                maxLength={150}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {/* Character Counter */}
                        {about && (
                            <div className='text-right'>
                                <span className={`text-xs ${about.length > 140 ? 'text-red-400' : 'text-gray-400'}`}>
                                    {about.length}/150
                                </span>
                            </div>
                        )}

                        {/* Location */}
                        <div className='bg-gray-950 text-gray-300 flex items-center p-3 sm:p-4 rounded-lg w-full focus-within:ring-2 focus-within:ring-blue-500 transition-all'>
                            <svg className='w-5 h-5 sm:w-6 sm:h-6 mr-3 flex-shrink-0 text-gray-400' fill='currentColor' viewBox='0 0 20 20'>
                                <path fillRule='evenodd' d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z' clipRule='evenodd' />
                            </svg>
                            <input
                                name="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className='outline-none w-full bg-transparent text-white placeholder-gray-400 text-sm sm:text-base'
                                type="text"
                                placeholder='Where do you live?'
                                maxLength={50}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading || !username.trim() || !about.trim()}
                        className={`w-full p-3 sm:p-4 font-semibold rounded-xl transition-all duration-200 text-sm sm:text-base 
                            ${isLoading || !username.trim() || !about.trim()
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-black hover:bg-gray-100 active:bg-gray-200 transform hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                    >
                        {isLoading ? (
                            <div className='flex items-center justify-center'>
                                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2'></div>
                                Completing Profile...
                            </div>
                        ) : (
                            'Complete Profile'
                        )}
                    </button>

                    {/* Skip Option */}
                    <button
                        type="button"
                        className='w-full p-2 text-gray-400 hover:text-white text-sm transition-colors duration-200'
                        onClick={handleSkip}
                        disabled={isLoading}
                    >
                        Skip for now
                    </button>
                </form>
            </div>
        </div>
    );
}

export default UserProfile;