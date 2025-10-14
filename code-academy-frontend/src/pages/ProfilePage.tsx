import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X,
  Camera,
  Award,
  BookOpen,
  Clock,
  Target,
  Trophy,
  Star,
  Download,
  Share2,
  Settings,
  Bell,
  Shield,
  Globe,
  Github,
  Linkedin,
  Twitter
} from 'lucide-react';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio: string;
  location?: string;
  joinDate: string;
  avatar: string;
  coverImage: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    publicProfile: boolean;
    showEmail: boolean;
    showPhone: boolean;
  };
  stats: {
    coursesCompleted: number;
    totalHours: number;
    certificates: number;
    currentStreak: number;
    longestStreak: number;
    points: number;
    level: number;
  };
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedDate: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  }[];
  recentActivity: {
    id: string;
    type: 'course_completed' | 'lesson_completed' | 'exercise_completed' | 'certificate_earned';
    title: string;
    description: string;
    timestamp: string;
    courseId?: string;
  }[];
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    github: '',
    linkedin: '',
    twitter: '',
    website: ''
  });

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockProfile: UserProfile = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        bio: 'Passionate software developer with 5+ years of experience in web development. Love learning new technologies and sharing knowledge with others.',
        location: 'San Francisco, CA',
        joinDate: '2023-01-15',
        avatar: '/images/avatar.jpg',
        coverImage: '/images/cover.jpg',
        socialLinks: {
          github: 'https://github.com/johndoe',
          linkedin: 'https://linkedin.com/in/johndoe',
          twitter: 'https://twitter.com/johndoe',
          website: 'https://johndoe.dev'
        },
        preferences: {
          emailNotifications: true,
          pushNotifications: true,
          publicProfile: true,
          showEmail: false,
          showPhone: false
        },
        stats: {
          coursesCompleted: 12,
          totalHours: 156,
          certificates: 8,
          currentStreak: 7,
          longestStreak: 21,
          points: 2450,
          level: 5
        },
        achievements: [
          {
            id: '1',
            title: 'First Course',
            description: 'Completed your first course',
            icon: '🎓',
            earnedDate: '2023-01-20',
            rarity: 'common'
          },
          {
            id: '2',
            title: 'Week Warrior',
            description: '7-day learning streak',
            icon: '🔥',
            earnedDate: '2023-02-15',
            rarity: 'rare'
          },
          {
            id: '3',
            title: 'Code Master',
            description: 'Completed 10 coding exercises',
            icon: '💻',
            earnedDate: '2023-03-10',
            rarity: 'epic'
          }
        ],
        recentActivity: [
          {
            id: '1',
            type: 'course_completed',
            title: 'Complete JavaScript Course',
            description: 'You completed the Complete JavaScript Course',
            timestamp: '2024-01-15T10:30:00Z',
            courseId: '1'
          },
          {
            id: '2',
            type: 'certificate_earned',
            title: 'JavaScript Fundamentals Certificate',
            description: 'You earned a certificate for JavaScript Fundamentals',
            timestamp: '2024-01-14T15:45:00Z',
            courseId: '1'
          },
          {
            id: '3',
            type: 'lesson_completed',
            title: 'React Hooks Deep Dive',
            description: 'You completed the React Hooks Deep Dive lesson',
            timestamp: '2024-01-13T09:20:00Z',
            courseId: '2'
          }
        ]
      };
      
      setProfile(mockProfile);
      setEditForm({
        firstName: mockProfile.firstName,
        lastName: mockProfile.lastName,
        email: mockProfile.email,
        phone: mockProfile.phone || '',
        bio: mockProfile.bio,
        location: mockProfile.location || '',
        github: mockProfile.socialLinks.github || '',
        linkedin: mockProfile.socialLinks.linkedin || '',
        twitter: mockProfile.socialLinks.twitter || '',
        website: mockProfile.socialLinks.website || ''
      });
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setEditForm({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone || '',
        bio: profile.bio,
        location: profile.location || '',
        github: profile.socialLinks.github || '',
        linkedin: profile.socialLinks.linkedin || '',
        twitter: profile.socialLinks.twitter || '',
        website: profile.socialLinks.website || ''
      });
    }
  };

  const handleSave = () => {
    if (profile) {
      setProfile({
        ...profile,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone,
        bio: editForm.bio,
        location: editForm.location,
        socialLinks: {
          github: editForm.github,
          linkedin: editForm.linkedin,
          twitter: editForm.twitter,
          website: editForm.website
        }
      });
      setIsEditing(false);
      // In a real app, this would make an API call to save the profile
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'course_completed': return <BookOpen className="h-5 w-5 text-green-500" />;
      case 'lesson_completed': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'exercise_completed': return <Target className="h-5 w-5 text-purple-500" />;
      case 'certificate_earned': return <Award className="h-5 w-5 text-yellow-500" />;
      default: return <BookOpen className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile not found</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end space-x-6">
              <div className="relative">
                <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
                <button className="absolute bottom-2 right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 text-white">
                <h1 className="text-3xl font-bold mb-2">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-lg opacity-90 mb-2">{profile.bio}</p>
                <div className="flex items-center space-x-4 text-sm opacity-75">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {profile.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {new Date(profile.joinDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleEdit}
                  className="bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
                <button className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors flex items-center">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={editForm.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={editForm.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={editForm.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      name="bio"
                      value={editForm.bio}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">{profile.email}</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-700">{profile.phone}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-700">{profile.location}</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h3>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                    <input
                      type="url"
                      name="github"
                      value={editForm.github}
                      onChange={handleInputChange}
                      placeholder="https://github.com/username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                    <input
                      type="url"
                      name="linkedin"
                      value={editForm.linkedin}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                    <input
                      type="url"
                      name="twitter"
                      value={editForm.twitter}
                      onChange={handleInputChange}
                      placeholder="https://twitter.com/username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={editForm.website}
                      onChange={handleInputChange}
                      placeholder="https://yourwebsite.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.socialLinks.github && (
                    <a
                      href={profile.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Github className="h-5 w-5 mr-3" />
                      GitHub
                    </a>
                  )}
                  {profile.socialLinks.linkedin && (
                    <a
                      href={profile.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Linkedin className="h-5 w-5 mr-3" />
                      LinkedIn
                    </a>
                  )}
                  {profile.socialLinks.twitter && (
                    <a
                      href={profile.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Twitter className="h-5 w-5 mr-3" />
                      Twitter
                    </a>
                  )}
                  {profile.socialLinks.website && (
                    <a
                      href={profile.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Globe className="h-5 w-5 mr-3" />
                      Website
                    </a>
                  )}
                </div>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Courses Completed</span>
                  <span className="font-semibold text-gray-900">{profile.stats.coursesCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Hours</span>
                  <span className="font-semibold text-gray-900">{profile.stats.totalHours}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Certificates</span>
                  <span className="font-semibold text-gray-900">{profile.stats.certificates}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Streak</span>
                  <span className="font-semibold text-gray-900">{profile.stats.currentStreak} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Points</span>
                  <span className="font-semibold text-gray-900">{profile.stats.points}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Level</span>
                  <span className="font-semibold text-gray-900">{profile.stats.level}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Achievements and Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.achievements.map((achievement, index) => (
                  <div key={achievement.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="text-2xl mb-2">{achievement.icon}</div>
                    <h4 className="font-medium text-gray-900 mb-1">{achievement.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(achievement.earnedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {profile.recentActivity.map((activity, index) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{activity.title}</h4>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;