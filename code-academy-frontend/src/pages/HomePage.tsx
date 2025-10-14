import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, 
  Star, 
  Users, 
  Award, 
  BookOpen, 
  Code, 
  Globe, 
  Smartphone, 
  Server, 
  Database,
  ChevronRight,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredCourse, setHoveredCourse] = useState<number | null>(null);

  const features = [
    {
      icon: <Code className="h-8 w-8" />,
      title: 'AI-Powered Learning',
      description: 'Get personalized feedback and suggestions from our AI coding assistant'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Collaborative Learning',
      description: 'Join study groups and learn together with peers from around the world'
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: 'Real Projects',
      description: 'Build real-world projects and add them to your portfolio'
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: 'Expert Instructors',
      description: 'Learn from industry experts with years of experience'
    }
  ];

  const courses = [
    {
      id: 1,
      title: 'Complete JavaScript Course',
      description: 'Master JavaScript from basics to advanced concepts',
      instructor: 'Dr. Sarah Johnson',
      rating: 4.8,
      students: 15420,
      duration: '25 hours',
      difficulty: 'Beginner',
      price: 99,
      isFree: false,
      thumbnail: '/images/js-course.jpg',
      category: 'web-development'
    },
    {
      id: 2,
      title: 'React Development Masterclass',
      description: 'Build modern web applications with React',
      instructor: 'Mike Chen',
      rating: 4.9,
      students: 12850,
      duration: '30 hours',
      difficulty: 'Intermediate',
      price: 149,
      isFree: false,
      thumbnail: '/images/react-course.jpg',
      category: 'web-development'
    },
    {
      id: 3,
      title: 'Python for Data Science',
      description: 'Data analysis, visualization, and machine learning',
      instructor: 'Dr. Emily Watson',
      rating: 4.9,
      students: 18750,
      duration: '35 hours',
      difficulty: 'Intermediate',
      price: 179,
      isFree: false,
      thumbnail: '/images/python-course.jpg',
      category: 'data-science'
    },
    {
      id: 4,
      title: 'Algorithms and Data Structures',
      description: 'Master fundamental algorithms for technical interviews',
      instructor: 'Prof. David Kim',
      rating: 4.8,
      students: 22100,
      duration: '40 hours',
      difficulty: 'Advanced',
      price: 0,
      isFree: true,
      thumbnail: '/images/algorithms-course.jpg',
      category: 'algorithms'
    }
  ];

  const categories = [
    { name: 'Web Development', icon: <Globe className="h-6 w-6" />, count: 45 },
    { name: 'Mobile Development', icon: <Smartphone className="h-6 w-6" />, count: 23 },
    { name: 'Backend Development', icon: <Server className="h-6 w-6" />, count: 31 },
    { name: 'Data Science', icon: <Database className="h-6 w-6" />, count: 18 }
  ];

  const stats = [
    { number: '50K+', label: 'Students' },
    { number: '200+', label: 'Courses' },
    { number: '95%', label: 'Success Rate' },
    { number: '4.9/5', label: 'Average Rating' }
  ];

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
      case 'web-development': return <Globe className="h-5 w-5" />;
      case 'mobile-development': return <Smartphone className="h-5 w-5" />;
      case 'backend-development': return <Server className="h-5 w-5" />;
      case 'data-science': return <Database className="h-5 w-5" />;
      default: return <Code className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Learn to Code with
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  AI-Powered
                </span>
                Education
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Master programming with personalized learning paths, real-time AI feedback, 
                and collaborative study groups. Start your coding journey today!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg flex items-center justify-center"
                >
                  Start Learning Free
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
                <button
                  onClick={() => navigate('/courses')}
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors text-lg flex items-center justify-center"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Browse Courses
                </button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Code className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">AI Coding Assistant</h3>
                  <p className="text-blue-100 mb-6">
                    Get instant feedback on your code with our advanced AI assistant
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-3" />
                      <span>Real-time code analysis</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-3" />
                      <span>Personalized suggestions</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-3" />
                      <span>Performance optimization</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Code Academy?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge AI technology with proven educational methods 
              to provide the best learning experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Explore Categories
            </h2>
            <p className="text-xl text-gray-600">
              Find courses in your area of interest
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate('/courses')}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.count} courses</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Courses
            </h2>
            <p className="text-xl text-gray-600">
              Start with these popular courses
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onMouseEnter={() => setHoveredCourse(course.id)}
                onMouseLeave={() => setHoveredCourse(null)}
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {getCategoryIcon(course.category)}
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                      {course.difficulty}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    {course.isFree ? (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        FREE
                      </span>
                    ) : (
                      <span className="bg-white bg-opacity-90 text-gray-900 px-2 py-1 rounded-full text-xs font-medium">
                        ${course.price}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span>By {course.instructor}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span>{course.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{course.students.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>{course.duration}</span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                    {course.isFree ? 'Start Free' : 'Enroll Now'}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/courses')}
              className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              View All Courses
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Coding Journey?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of students who are already learning with our AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate('/login')}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors text-lg"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Code Academy</h3>
              <p className="text-gray-400">
                Learn to code with AI-powered education and collaborative learning.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Courses</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Web Development</li>
                <li>Mobile Development</li>
                <li>Data Science</li>
                <li>Algorithms</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Community</li>
                <li>FAQ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Code Academy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
