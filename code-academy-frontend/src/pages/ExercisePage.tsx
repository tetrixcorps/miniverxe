import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Lightbulb, 
  Clock,
  Target,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Code,
  Eye,
  EyeOff,
  Download,
  Share2,
  BookOpen
} from 'lucide-react';

interface Exercise {
  id: string;
  title: string;
  description: string;
  instructions: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: string;
  points: number;
  starterCode: string;
  solution: string;
  testCases: {
    input: string;
    expectedOutput: string;
    description: string;
  }[];
  hints: string[];
  tags: string[];
  isCompleted: boolean;
  attempts: number;
  bestScore: number;
}

interface Course {
  id: string;
  title: string;
  instructor: string;
  totalExercises: number;
  completedExercises: number;
}

const ExercisePage: React.FC = () => {
  const { courseId, exerciseId } = useParams<{ courseId: string; exerciseId: string }>();
  const navigate = useNavigate();
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    const fetchExercise = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockExercise: Exercise = {
        id: exerciseId || '1',
        title: 'FizzBuzz Challenge',
        description: 'Write a function that prints numbers 1 to 100, but for multiples of 3 print "Fizz", for multiples of 5 print "Buzz", and for multiples of both print "FizzBuzz".',
        instructions: 'Create a function called fizzBuzz that takes no parameters and prints the numbers 1 to 100 with the following rules:\n\n- For numbers divisible by 3, print "Fizz"\n- For numbers divisible by 5, print "Buzz"\n- For numbers divisible by both 3 and 5, print "FizzBuzz"\n- For all other numbers, print the number itself',
        difficulty: 'Easy',
        estimatedTime: '15 minutes',
        points: 100,
        starterCode: 'function fizzBuzz() {\n  // Your code here\n}',
        solution: 'function fizzBuzz() {\n  for (let i = 1; i <= 100; i++) {\n    if (i % 15 === 0) {\n      console.log("FizzBuzz");\n    } else if (i % 3 === 0) {\n      console.log("Fizz");\n    } else if (i % 5 === 0) {\n      console.log("Buzz");\n    } else {\n      console.log(i);\n    }\n  }\n}',
        testCases: [
          {
            input: 'fizzBuzz()',
            expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n...',
            description: 'Should print numbers 1-100 with FizzBuzz rules'
          }
        ],
        hints: [
          'Use a for loop to iterate from 1 to 100',
          'Use the modulo operator (%) to check divisibility',
          'Check for multiples of 15 first (both 3 and 5)',
          'Use console.log() to print the output'
        ],
        tags: ['JavaScript', 'Loops', 'Conditionals', 'Modulo'],
        isCompleted: false,
        attempts: 0,
        bestScore: 0
      };

      const mockCourse: Course = {
        id: courseId || '1',
        title: 'Complete JavaScript Course',
        instructor: 'Dr. Sarah Johnson',
        totalExercises: 25,
        completedExercises: 8
      };
      
      setExercise(mockExercise);
      setCourse(mockCourse);
      setCode(mockExercise.starterCode);
      setLoading(false);
    };

    fetchExercise();
  }, [courseId, exerciseId]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('');
    setTestResults([]);

    // Simulate code execution
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock test results
    const mockResults = exercise?.testCases.map((testCase, index) => ({
      id: index,
      passed: Math.random() > 0.3, // Random pass/fail for demo
      input: testCase.input,
      expected: testCase.expectedOutput,
      actual: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n...',
      description: testCase.description
    })) || [];

    setTestResults(mockResults);
    setOutput('Code executed successfully!');
    setIsRunning(false);

    // Check if all tests passed
    const allPassed = mockResults.every(result => result.passed);
    if (allPassed && exercise) {
      setExercise({ ...exercise, isCompleted: true, attempts: exercise.attempts + 1, bestScore: 100 });
    }
  };

  const handleReset = () => {
    if (exercise) {
      setCode(exercise.starterCode);
      setOutput('');
      setTestResults([]);
    }
  };

  const handleNextHint = () => {
    if (exercise && currentHint < exercise.hints.length - 1) {
      setCurrentHint(currentHint + 1);
    }
  };

  const handlePreviousExercise = () => {
    // In a real app, this would navigate to the previous exercise
    console.log('Navigate to previous exercise');
  };

  const handleNextExercise = () => {
    // In a real app, this would navigate to the next exercise
    console.log('Navigate to next exercise');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exercise...</p>
        </div>
      </div>
    );
  }

  if (!exercise || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Exercise not found</h1>
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
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(timeSpent)}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Target className="h-4 w-4 mr-1" />
                {exercise.attempts} attempts
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Problem Description */}
          <div className="space-y-6">
            {/* Exercise Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{exercise.title}</h2>
                  <div className="flex items-center space-x-4 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                      {exercise.difficulty}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {exercise.estimatedTime}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Trophy className="h-4 w-4 mr-1" />
                      {exercise.points} points
                    </div>
                  </div>
                </div>
                {exercise.isCompleted && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-6 w-6 mr-2" />
                    <span className="font-medium">Completed</span>
                  </div>
                )}
              </div>
              
              <p className="text-gray-700 mb-4">{exercise.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {exercise.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-gray-700 font-mono text-sm bg-gray-50 p-4 rounded-lg">
                  {exercise.instructions}
                </pre>
              </div>
            </motion.div>

            {/* Hints */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Hints</h3>
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  {showHints ? 'Hide Hints' : 'Show Hints'}
                </button>
              </div>
              
              {showHints && (
                <div className="space-y-3">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 font-medium mb-2">
                      Hint {currentHint + 1} of {exercise.hints.length}:
                    </p>
                    <p className="text-yellow-700">{exercise.hints[currentHint]}</p>
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      onClick={() => setCurrentHint(Math.max(0, currentHint - 1))}
                      disabled={currentHint === 0}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextHint}
                      disabled={currentHint === exercise.hints.length - 1}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next Hint
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Code Editor */}
          <div className="space-y-6">
            {/* Code Editor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm"
            >
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Code Editor</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowSolution(!showSolution)}
                      className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      {showSolution ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                      {showSolution ? 'Hide Solution' : 'Show Solution'}
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Reset
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <textarea
                  value={showSolution ? exercise.solution : code}
                  onChange={(e) => setCode(e.target.value)}
                  readOnly={showSolution}
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Write your code here..."
                />
              </div>
              
              <div className="border-t border-gray-200 p-4">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isRunning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Code
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Output */}
            {(output || testResults.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Output</h3>
                
                {output && (
                  <div className="mb-4">
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                      {output}
                    </pre>
                  </div>
                )}

                {testResults.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Test Results</h4>
                    {testResults.map((result, index) => (
                      <div key={index} className={`p-3 rounded-lg border ${
                        result.passed 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">
                            Test Case {index + 1}
                          </span>
                          <div className="flex items-center">
                            {result.passed ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{result.description}</p>
                        <div className="text-xs text-gray-500">
                          <div>Input: <code className="bg-gray-100 px-1 rounded">{result.input}</code></div>
                          <div>Expected: <code className="bg-gray-100 px-1 rounded">{result.expected}</code></div>
                          <div>Actual: <code className="bg-gray-100 px-1 rounded">{result.actual}</code></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex space-x-4"
            >
              <button
                onClick={handlePreviousExercise}
                className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </button>
              <button
                onClick={handleNextExercise}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExercisePage;