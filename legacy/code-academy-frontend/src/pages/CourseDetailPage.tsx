import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, 
  Star, 
  Users, 
  Clock, 
  BookOpen, 
  CheckCircle, 
  Download,
  Share2,
  Heart,
  ArrowLeft,
  Globe,
  Smartphone,
  Server,
  Database,
  Code,
  Award,
  Target,
  Zap
} from 'lucide-react';

interface Course {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  instructor: {
    name: string;
    title: string;
    avatar: string;
    bio: string;
    rating: number;
    students: number;
    courses: number;
  };
  rating: number;
  students: number;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  isFree: boolean;
  thumbnail: string;
  category: string;
  tags: string[];
  lessons: number;
  lastUpdated: string;
  language: string;
  level: string;
  prerequisites: string[];
  whatYouWillLearn: string[];
  curriculum: {
    id: string;
    title: string;
    duration: string;
    lessons: {
      id: string;
      title: string;
      duration: string;
      isPreview: boolean;
    }[];
  }[];
  requirements: string[];
  targetAudience: string[];
  certificate: boolean;
  lifetimeAccess: boolean;
  mobileAccess: boolean;
  assignments: boolean;
  projects: number;
}

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockCourse: Course = {
        id: parseInt(id || '1'),
        title: 'Complete JavaScript Course',
        description: 'Master JavaScript from basics to advanced concepts including ES6+, async programming, and modern frameworks.',
        longDescription: 'This comprehensive JavaScript course will take you from a complete beginner to an advanced JavaScript developer. You\'ll learn all the essential concepts, modern features, and best practices that are used in real-world applications. The course includes hands-on projects, coding challenges, and real-world examples to help you master JavaScript programming.',
        instructor: {
          name: 'Dr. Sarah Johnson',
          title: 'Senior Software Engineer at Google',
          avatar: '/images/instructor-avatar.jpg',
          bio: 'Sarah has over 10 years of experience in web development and has taught thousands of students. She specializes in JavaScript, React, and Node.js.',
          rating: 4.9,
          students: 25000,
          courses: 12
        },
        rating: 4.8,
        students: 15420,
        duration: '25 hours',
        difficulty: 'Beginner',
        price: 99,
        isFree: false,
        thumbnail: '/images/js-course.jpg',
        category: 'web-development',
        tags: ['JavaScript', 'ES6', 'Async', 'DOM', 'Web Development'],
        lessons: 45,
        lastUpdated: '2024-01-15',
        language: 'English',
        level: 'Beginner to Intermediate',
        prerequisites: ['Basic HTML knowledge', 'Basic CSS knowledge', 'No programming experience required'],
        whatYouWillLearn: [
          'Master JavaScript fundamentals and advanced concepts',
          'Understand ES6+ features and modern JavaScript',
          'Learn asynchronous programming with Promises and async/await',
          'Build real-world projects and applications',
          'Understand DOM manipulation and event handling',
          'Learn about closures, prototypes, and advanced JavaScript patterns'
        ],
        curriculum: [
          {
            id: '1',
            title: 'JavaScript Fundamentals',
            duration: '4 hours',
            lessons: [
              { id: '1-1', title: 'Introduction to JavaScript', duration: '15 min', isPreview: true },
              { id: '1-2', title: 'Variables and Data Types', duration: '20 min', isPreview: false },
              { id: '1-3', title: 'Functions and Scope', duration: '25 min', isPreview: false },
              { id: '1-4', title: 'Arrays and Objects', duration: '30 min', isPreview: false }
            ]
          },
          {
            id: '2',
            title: 'ES6+ Features',
            duration: '6 hours',
            lessons: [
              { id: '2-1', title: 'Arrow Functions', duration: '20 min', isPreview: true },
              { id: '2-2', title: 'Destructuring', duration: '25 min', isPreview: false },
              { id: '2-3', title: 'Template Literals', duration: '15 min', isPreview: false },
              { id: '2-4', title: 'Modules and Imports', duration: '30 min', isPreview: false }
            ]
          },
          {
            id: '3',
            title: 'Asynchronous JavaScript',
            duration: '5 hours',
            lessons: [
              { id: '3-1', title: 'Callbacks and Promises', duration: '30 min', isPreview: true },
              { id: '3-2', title: 'Async/Await', duration: '25 min', isPreview: false },
              { id: '3-3', title: 'Fetch API', duration: '20 min', isPreview: false },
              { id: '3-4', title: 'Error Handling', duration: '15 min', isPreview: false }
            ]
          }
        ],
        requirements: [
          'A computer with internet connection',
          'Basic knowledge of HTML and CSS',
          'A code editor (VS Code recommended)',
          'No prior JavaScript experience required'
        ],
        targetAudience: [
          'Complete beginners to programming',
          'Web developers wanting to learn JavaScript',
          'Students looking to start a career in web development',
          'Anyone interested in learning modern JavaScript'
        ],
        certificate: true,
        lifetimeAccess: true,
        mobileAccess: true,
        assignments: true,
        projects: 5
      };
      
      setCourse(mockCourse);
      setLoading(false);
    };

    fetchCourse();
  }, [id]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'web-development': return <Globe className="h-6 w-6" />;
      case 'mobile-development': return <Smartphone className="h-6 w-6" />;
      case 'backend-development': return <Server className="h-6 w-6" />;
      case 'data-science': return <Database className="h-6 w-6" />;
      default: return <Code className="h-6 w-6" />;
    }
  };

  const handleEnroll = () => {
    if (course?.isFree) {
      setIsEnrolled(true);
      // In a real app, this would make an API call
    } else {
      // In a real app, this would redirect to payment
      console.log('Redirect to payment');
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // In a real app, this would make an API call
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h1>
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
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Courses
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-lg shadow-sm p-8 mb-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mr-4">
                      {getCategoryIcon(course.category)}
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">{course.category.replace('-', ' ').toUpperCase()}</p>
                    </div>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
                  <p className="text-lg text-gray-600 mb-6">{course.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span>{course.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{course.students.toLocaleString()} students</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>{course.lessons} lessons</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleWishlist}
                      className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                        isWishlisted 
                          ? 'bg-red-50 border-red-200 text-red-600' 
                          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? 'fill-current' : ''}`} />
                      {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                    </button>
                    <button className="flex items-center px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm mb-8"
            >
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-8">
                  {['overview', 'curriculum', 'instructor', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                        activeTab === tab
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-8">
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What you'll learn</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {course.whatYouWillLearn.map((item, index) => (
                          <div key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Course description</h3>
                      <p className="text-gray-700 leading-relaxed">{course.longDescription}</p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {course.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Target audience</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {course.targetAudience.map((audience, index) => (
                          <li key={index}>{audience}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'curriculum' && (
                  <div className="space-y-6">
                    {course.curriculum.map((section, sectionIndex) => (
                      <div key={section.id} className="border border-gray-200 rounded-lg">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">{section.title}</h4>
                            <span className="text-sm text-gray-500">{section.duration}</span>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="space-y-3">
                            {section.lessons.map((lesson, lessonIndex) => (
                              <div key={lesson.id} className="flex items-center justify-between py-2">
                                <div className="flex items-center">
                                  <Play className="h-4 w-4 text-gray-400 mr-3" />
                                  <span className="text-gray-700">{lesson.title}</span>
                                  {lesson.isPreview && (
                                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                      Preview
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm text-gray-500">{lesson.duration}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'instructor' && (
                  <div className="space-y-6">
                    <div className="flex items-start space-x-6">
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-600">
                          {course.instructor.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.instructor.name}</h3>
                        <p className="text-gray-600 mb-4">{course.instructor.title}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span>{course.instructor.rating} instructor rating</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{course.instructor.students.toLocaleString()} students</span>
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-1" />
                            <span>{course.instructor.courses} courses</span>
                          </div>
                        </div>
                        <p className="text-gray-700">{course.instructor.bio}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
                      <p className="text-gray-600">Be the first to review this course!</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-6 sticky top-8"
            >
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {course.isFree ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `$${course.price}`
                  )}
                </div>
                {!course.isFree && (
                  <div className="text-sm text-gray-500 line-through">$199</div>
                )}
              </div>

              <button
                onClick={handleEnroll}
                disabled={isEnrolled}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors mb-4 ${
                  isEnrolled
                    ? 'bg-green-600 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isEnrolled ? 'Enrolled' : course.isFree ? 'Enroll for Free' : 'Enroll Now'}
              </button>

              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Includes:</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-gray-700">{course.duration} on-demand video</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-gray-700">{course.lessons} lessons</span>
                  </div>
                  {course.certificate && (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-gray-700">Certificate of completion</span>
                    </div>
                  )}
                  {course.lifetimeAccess && (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-gray-700">Lifetime access</span>
                    </div>
                  )}
                  {course.mobileAccess && (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-gray-700">Mobile and desktop</span>
                    </div>
                  )}
                  {course.assignments && (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-gray-700">Assignments</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-gray-700">{course.projects} coding projects</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Course tags</h4>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;