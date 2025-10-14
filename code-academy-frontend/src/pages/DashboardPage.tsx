import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Code, 
  Users, 
  Trophy, 
  Clock, 
  TrendingUp,
  PlayCircle,
  Calendar,
  Star,
  Target
} from 'lucide-react';

// Types
interface LearningInsights {
  totalCourses: number;
  completedCourses: number;
  currentStreak: number;
  totalHours: number;
  skillLevel: string;
  nextRecommendedCourse: string;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedHours: number;
  thumbnail: string;
}

interface StudyGroup {
  id: string;
  name: string;
  course: string;
  members: number;
  nextSession: Date;
  isHost: boolean;
}

interface VideoSession {
  id: string;
  title: string;
  startTime: Date;
  duration: number;
  participants: number;
  roomId: string;
}

const DashboardPage: React.FC = () => {
  const [insights, setInsights] = useState<LearningInsights | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<VideoSession[]>([]);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadDashboardData = async () => {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      setTimeout(() => {
        setInsights({
          totalCourses: 12,
          completedCourses: 4,
          currentStreak: 7,
          totalHours: 45,
          skillLevel: 'Intermediate',
          nextRecommendedCourse: 'Advanced React Patterns',
          achievements: [
            {
              id: '1',
              title: 'First Project',
              description: 'Completed your first coding project',
              icon: '🎉',
              unlockedAt: new Date('2025-01-10')
            },
            {
              id: '2',
              title: 'Week Warrior',
              description: '7-day learning streak',
              icon: '🔥',
              unlockedAt: new Date('2025-01-14')
            }
          ]
        });

        setCourses([
          {
            id: '1',
            title: 'JavaScript Fundamentals',
            description: 'Master the basics of JavaScript programming',
            progress: 85,
            difficulty: 'Beginner',
            estimatedHours: 20,
            thumbnail: '/images/js-course.jpg'
          },
          {
            id: '2',
            title: 'React Development',
            description: 'Build modern web applications with React',
            progress: 45,
            difficulty: 'Intermediate',
            estimatedHours: 30,
            thumbnail: '/images/react-course.jpg'
          },
          {
            id: '3',
            title: 'Node.js Backend',
            description: 'Server-side JavaScript development',
            progress: 0,
            difficulty: 'Intermediate',
            estimatedHours: 25,
            thumbnail: '/images/node-course.jpg'
          }
        ]);

        setStudyGroups([
          {
            id: '1',
            name: 'React Study Group',
            course: 'React Development',
            members: 8,
            nextSession: new Date('2025-01-16T18:00:00'),
            isHost: true
          },
          {
            id: '2',
            name: 'JavaScript Beginners',
            course: 'JavaScript Fundamentals',
            members: 12,
            nextSession: new Date('2025-01-17T19:00:00'),
            isHost: false
          }
        ]);

        setUpcomingSessions([
          {
            id: '1',
            title: 'React Hooks Deep Dive',
            startTime: new Date('2025-01-16T18:00:00'),
            duration: 60,
            participants: 8,
            roomId: 'room_123'
          }
        ]);

        setLoading(false);
      }, 1000);
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your learning dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600">
            Continue your coding journey with AI-powered learning
          </p>
        </div>

        {/* Stats Grid */}
        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Courses Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {insights.completedCourses}/{insights.totalCourses}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Learning Streak</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {insights.currentStreak} days
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Hours</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {insights.totalHours}h
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Target className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Skill Level</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {insights.skillLevel}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Continue Learning */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Continue Learning
                </h2>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Code className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded ${
                            course.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                            course.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {course.difficulty}
                          </span>
                          <span>{course.estimatedHours}h</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-1">
                          {course.progress}% Complete
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          {course.progress > 0 ? 'Continue' : 'Start'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AI Recommendations */}
            {insights && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Star className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    AI Recommendation
                  </h2>
                </div>
                <p className="text-gray-700 mb-4">
                  Based on your learning pattern, we recommend:
                </p>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {insights.nextRecommendedCourse}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    This course aligns with your current skill level and learning goals.
                  </p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Start Course
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Study Groups */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Study Groups
                </h2>
                <button 
                  onClick={() => setShowVideoModal(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create Group
                </button>
              </div>
              
              <div className="space-y-3">
                {studyGroups.map((group) => (
                  <div key={group.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{group.name}</h3>
                        <p className="text-sm text-gray-600">{group.course}</p>
                        <p className="text-xs text-gray-500">
                          {group.members} members • {group.nextSession.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {group.isHost && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            Host
                          </span>
                        )}
                        <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                          Join
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Upcoming Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Upcoming Sessions
              </h2>
              
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{session.title}</h3>
                        <p className="text-sm text-gray-600">
                          {session.startTime.toLocaleDateString()} at {session.startTime.toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {session.duration}min • {session.participants} participants
                        </p>
                      </div>
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                        Join Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Achievements */}
            {insights && insights.achievements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-center mb-4">
                  <Trophy className="h-6 w-6 text-yellow-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Achievements
                  </h2>
                </div>
                
                <div className="space-y-3">
                  {insights.achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <h3 className="font-medium text-gray-900">{achievement.title}</h3>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Video Collaboration Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Create Study Group</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., React Study Group"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Participants
                </label>
                <select className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Duration
                </label>
                <select className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowVideoModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement room creation with Telnyx Video API
                  setShowVideoModal(false);
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
