import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckCircle,
  Clock,
  Download,
  Share2,
  Settings,
  Menu,
  X
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  transcript: string;
  resources: {
    name: string;
    url: string;
    type: 'pdf' | 'code' | 'image' | 'other';
  }[];
  notes: string;
  isCompleted: boolean;
  isLocked: boolean;
}

interface Course {
  id: string;
  title: string;
  instructor: string;
  totalLessons: number;
  completedLessons: number;
  progress: number;
}

const LessonPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockLesson: Lesson = {
        id: lessonId || '1',
        title: 'Introduction to JavaScript',
        description: 'Learn the basics of JavaScript programming language and its core concepts.',
        duration: '15:30',
        videoUrl: '/videos/js-intro.mp4',
        transcript: 'Welcome to this JavaScript course. In this lesson, we will cover the fundamental concepts of JavaScript programming...',
        resources: [
          { name: 'JavaScript Basics Cheat Sheet', url: '/resources/js-cheatsheet.pdf', type: 'pdf' },
          { name: 'Code Examples', url: '/resources/js-examples.zip', type: 'code' },
          { name: 'JavaScript Reference', url: '/resources/js-reference.pdf', type: 'pdf' }
        ],
        notes: 'This is a foundational lesson. Make sure to understand the basic concepts before moving on.',
        isCompleted: false,
        isLocked: false
      };

      const mockCourse: Course = {
        id: courseId || '1',
        title: 'Complete JavaScript Course',
        instructor: 'Dr. Sarah Johnson',
        totalLessons: 45,
        completedLessons: 12,
        progress: 27
      };
      
      setLesson(mockLesson);
      setCourse(mockCourse);
      setLoading(false);
    };

    fetchLesson();
  }, [courseId, lessonId]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handlePreviousLesson = () => {
    // In a real app, this would navigate to the previous lesson
    console.log('Navigate to previous lesson');
  };

  const handleNextLesson = () => {
    // In a real app, this would navigate to the next lesson
    console.log('Navigate to next lesson');
  };

  const handleCompleteLesson = () => {
    if (lesson) {
      setLesson({ ...lesson, isCompleted: true });
      // In a real app, this would update the lesson completion status
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Lesson not found</h1>
          <button
            onClick={() => navigate('/courses')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(`/courses/${courseId}`)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-6"
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                Back to Course
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{course.title}</h1>
                <p className="text-sm text-gray-600">by {course.instructor}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                {showSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${showSidebar ? 'lg:mr-80' : ''}`}>
          {/* Video Player */}
          <div className="bg-black relative">
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              {/* Video Player Placeholder */}
              <div className="text-center text-white">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="h-8 w-8" />
                </div>
                <p className="text-lg font-semibold mb-2">{lesson.title}</p>
                <p className="text-sm opacity-75">Click to play video</p>
              </div>
            </div>

            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePlayPause}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </button>
                
                <div className="flex-1">
                  <div className="w-full bg-gray-600 rounded-full h-1">
                    <div className="bg-white h-1 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
                
                <span className="text-white text-sm">{formatTime(currentTime)} / {lesson.duration}</span>
                
                <button
                  onClick={handleMute}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                
                <button
                  onClick={handleFullscreen}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Lesson Content */}
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h2>
                  <p className="text-gray-600">{lesson.description}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {lesson.duration}
                  </div>
                  <button
                    onClick={handleCompleteLesson}
                    disabled={lesson.isCompleted}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      lesson.isCompleted
                        ? 'bg-green-100 text-green-800 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {lesson.isCompleted ? (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Completed
                      </div>
                    ) : (
                      'Mark as Complete'
                    )}
                  </button>
                </div>
              </div>

              {/* Transcript */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transcript</h3>
                <p className="text-gray-700 leading-relaxed">{lesson.transcript}</p>
              </div>

              {/* Resources */}
              {lesson.resources.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
                  <div className="space-y-3">
                    {lesson.resources.map((resource, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <BookOpen className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-gray-700">{resource.name}</span>
                        </div>
                        <button className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {lesson.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Notes</h3>
                  <p className="text-yellow-700">{lesson.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg z-50 overflow-y-auto"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Course Content</h3>
              
              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{course.completedLessons} / {course.totalLessons} lessons</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Course Outline */}
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-blue-900">Introduction to JavaScript</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-blue-600">15:30</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                </div>
                
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Variables and Data Types</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">20:00</span>
                      <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Functions and Scope</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">25:00</span>
                      <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="mt-8 flex space-x-3">
                <button
                  onClick={handlePreviousLesson}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </button>
                <button
                  onClick={handleNextLesson}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LessonPage;