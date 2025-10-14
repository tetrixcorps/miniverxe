import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Star, 
  Users, 
  Clock, 
  BookOpen, 
  ChevronDown,
  Grid,
  List,
  Play,
  CheckCircle,
  Globe,
  Smartphone,
  Server,
  Database
} from 'lucide-react';

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
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
}

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { id: 'all', name: 'All Categories', icon: <BookOpen className="h-5 w-5" /> },
    { id: 'web-development', name: 'Web Development', icon: <Globe className="h-5 w-5" /> },
    { id: 'mobile-development', name: 'Mobile Development', icon: <Smartphone className="h-5 w-5" /> },
    { id: 'backend-development', name: 'Backend Development', icon: <Server className="h-5 w-5" /> },
    { id: 'data-science', name: 'Data Science', icon: <Database className="h-5 w-5" /> }
  ];

  const difficulties = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' }
  ];

  const priceFilters = [
    { id: 'all', name: 'All Prices' },
    { id: 'free', name: 'Free' },
    { id: 'paid', name: 'Paid' },
    { id: 'under-50', name: 'Under $50' },
    { id: '50-100', name: '$50 - $100' },
    { id: 'over-100', name: 'Over $100' }
  ];

  const sortOptions = [
    { id: 'popular', name: 'Most Popular' },
    { id: 'newest', name: 'Newest' },
    { id: 'rating', name: 'Highest Rated' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' }
  ];

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    const mockCourses: Course[] = [
      {
        id: 1,
        title: 'Complete JavaScript Course',
        description: 'Master JavaScript from basics to advanced concepts including ES6+, async programming, and modern frameworks.',
        instructor: 'Dr. Sarah Johnson',
        rating: 4.8,
        students: 15420,
        duration: '25 hours',
        difficulty: 'Beginner',
        price: 99,
        isFree: false,
        thumbnail: '/images/js-course.jpg',
        category: 'web-development',
        tags: ['JavaScript', 'ES6', 'Async', 'DOM'],
        lessons: 45,
        lastUpdated: '2024-01-15'
      },
      {
        id: 2,
        title: 'React Development Masterclass',
        description: 'Build modern web applications with React, including hooks, context, and state management.',
        instructor: 'Mike Chen',
        rating: 4.9,
        students: 12850,
        duration: '30 hours',
        difficulty: 'Intermediate',
        price: 149,
        isFree: false,
        thumbnail: '/images/react-course.jpg',
        category: 'web-development',
        tags: ['React', 'Hooks', 'Context', 'State Management'],
        lessons: 52,
        lastUpdated: '2024-01-10'
      },
      {
        id: 3,
        title: 'Python for Data Science',
        description: 'Data analysis, visualization, and machine learning with Python and popular libraries.',
        instructor: 'Dr. Emily Watson',
        rating: 4.9,
        students: 18750,
        duration: '35 hours',
        difficulty: 'Intermediate',
        price: 179,
        isFree: false,
        thumbnail: '/images/python-course.jpg',
        category: 'data-science',
        tags: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Scikit-learn'],
        lessons: 68,
        lastUpdated: '2024-01-08'
      },
      {
        id: 4,
        title: 'Algorithms and Data Structures',
        description: 'Master fundamental algorithms for technical interviews and competitive programming.',
        instructor: 'Prof. David Kim',
        rating: 4.8,
        students: 22100,
        duration: '40 hours',
        difficulty: 'Advanced',
        price: 0,
        isFree: true,
        thumbnail: '/images/algorithms-course.jpg',
        category: 'backend-development',
        tags: ['Algorithms', 'Data Structures', 'Big O', 'Interview Prep'],
        lessons: 75,
        lastUpdated: '2024-01-05'
      },
      {
        id: 5,
        title: 'iOS App Development with Swift',
        description: 'Create beautiful iOS applications using Swift and SwiftUI.',
        instructor: 'Alex Rodriguez',
        rating: 4.7,
        students: 9650,
        duration: '28 hours',
        difficulty: 'Intermediate',
        price: 129,
        isFree: false,
        thumbnail: '/images/ios-course.jpg',
        category: 'mobile-development',
        tags: ['Swift', 'SwiftUI', 'iOS', 'Xcode'],
        lessons: 41,
        lastUpdated: '2024-01-12'
      },
      {
        id: 6,
        title: 'Android Development with Kotlin',
        description: 'Build Android apps using Kotlin and modern Android development practices.',
        instructor: 'Maria Garcia',
        rating: 4.6,
        students: 11200,
        duration: '32 hours',
        difficulty: 'Intermediate',
        price: 139,
        isFree: false,
        thumbnail: '/images/android-course.jpg',
        category: 'mobile-development',
        tags: ['Kotlin', 'Android', 'Jetpack', 'Material Design'],
        lessons: 48,
        lastUpdated: '2024-01-09'
      }
    ];

    setCourses(mockCourses);
    setFilteredCourses(mockCourses);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = courses;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(course => 
        course.difficulty.toLowerCase() === selectedDifficulty
      );
    }

    // Price filter
    if (priceFilter !== 'all') {
      switch (priceFilter) {
        case 'free':
          filtered = filtered.filter(course => course.isFree);
          break;
        case 'paid':
          filtered = filtered.filter(course => !course.isFree);
          break;
        case 'under-50':
          filtered = filtered.filter(course => course.price > 0 && course.price < 50);
          break;
        case '50-100':
          filtered = filtered.filter(course => course.price >= 50 && course.price <= 100);
          break;
        case 'over-100':
          filtered = filtered.filter(course => course.price > 100);
          break;
      }
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.students - a.students);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedCategory, selectedDifficulty, priceFilter, sortBy]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : <BookOpen className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                All Courses
              </h1>
              <p className="text-gray-600">
                Discover courses to advance your programming skills
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search courses, instructors, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center text-gray-500 hover:text-gray-700"
                >
                  <Filter className="h-5 w-5 mr-1" />
                  <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Category Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Category</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category.id}
                          checked={selectedCategory === category.id}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <div className="ml-3 flex items-center">
                          {category.icon}
                          <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Difficulty</h4>
                  <div className="space-y-2">
                    {difficulties.map((difficulty) => (
                      <label key={difficulty.id} className="flex items-center">
                        <input
                          type="radio"
                          name="difficulty"
                          value={difficulty.id}
                          checked={selectedDifficulty === difficulty.id}
                          onChange={(e) => setSelectedDifficulty(e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-3 text-sm text-gray-700">{difficulty.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Price</h4>
                  <div className="space-y-2">
                    {priceFilters.map((filter) => (
                      <label key={filter.id} className="flex items-center">
                        <input
                          type="radio"
                          name="price"
                          value={filter.id}
                          checked={priceFilter === filter.id}
                          onChange={(e) => setPriceFilter(e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-3 text-sm text-gray-700">{filter.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="mb-4 sm:mb-0">
                <p className="text-gray-600">
                  Showing <span className="font-semibold">{filteredCourses.length}</span> of{' '}
                  <span className="font-semibold">{courses.length}</span> courses
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>

                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Courses Grid/List */}
            {filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
                {filteredCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    {/* Course Thumbnail */}
                    <div className={`bg-gradient-to-br from-blue-500 to-purple-600 ${
                      viewMode === 'list' ? 'w-48 h-32' : 'h-48'
                    } flex items-center justify-center`}>
                      <div className="text-white">
                        {getCategoryIcon(course.category)}
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {course.description}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                            {course.difficulty}
                          </span>
                        </div>
                      </div>

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
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          <span>{course.lessons} lessons</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold text-gray-900">
                          {course.isFree ? (
                            <span className="text-green-600">Free</span>
                          ) : (
                            `$${course.price}`
                          )}
                        </div>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                          <Play className="h-4 w-4 mr-1" />
                          {course.isFree ? 'Start Free' : 'Enroll Now'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;