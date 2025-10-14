import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  Loader, 
  ChevronDown, 
  ChevronUp,
  Copy,
  RefreshCw,
  Zap
} from 'lucide-react';
import { updatedAIService, CodeAnalysis, CodeSuggestion, CodeError } from '../services/updatedAIService';

interface AICodingAssistantProps {
  code: string;
  onCodeChange: (code: string) => void;
  language: string;
  exerciseId?: string;
  onAnalysisComplete?: (analysis: CodeAnalysis) => void;
}

interface AnalysisState {
  isAnalyzing: boolean;
  analysis: CodeAnalysis | null;
  error: string | null;
  lastAnalyzed: Date | null;
}

const AICodingAssistant: React.FC<AICodingAssistantProps> = ({
  code,
  onCodeChange,
  language,
  exerciseId,
  onAnalysisComplete
}) => {
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isAnalyzing: false,
    analysis: null,
    error: null,
    lastAnalyzed: null
  });
  const [expandedSections, setExpandedSections] = useState<{
    suggestions: boolean;
    errors: boolean;
    performance: boolean;
    bestPractices: boolean;
  }>({
    suggestions: true,
    errors: true,
    performance: false,
    bestPractices: false
  });
  const [selectedSuggestion, setSelectedSuggestion] = useState<CodeSuggestion | null>(null);

  // Auto-analyze code when it changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (code.trim().length > 10) {
        analyzeCode();
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [code]);

  const analyzeCode = async () => {
    setAnalysisState(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      const analysis = await updatedAIService.analyzeCode(code, language);
      setAnalysisState({
        isAnalyzing: false,
        analysis,
        error: null,
        lastAnalyzed: new Date()
      });
      onAnalysisComplete?.(analysis);
    } catch (error) {
      setAnalysisState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: error instanceof Error ? error.message : 'Analysis failed'
      }));
    }
  };

  const applySuggestion = (suggestion: CodeSuggestion) => {
    // This is a simplified implementation
    // In a real scenario, you'd need more sophisticated code replacement logic
    const newCode = code + '\n\n// AI Suggestion Applied:\n' + suggestion.code;
    onCodeChange(newCode);
    setSelectedSuggestion(null);
  };

  const copySuggestion = (suggestion: CodeSuggestion) => {
    navigator.clipboard.writeText(suggestion.code);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="h-6 w-6 text-white" />
            <div>
              <h3 className="text-lg font-semibold text-white">AI Coding Assistant</h3>
              <p className="text-blue-100 text-sm">Real-time code analysis and suggestions</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {analysisState.lastAnalyzed && (
              <span className="text-blue-100 text-sm">
                Last analyzed: {analysisState.lastAnalyzed.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={analyzeCode}
              disabled={analysisState.isAnalyzing}
              className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-lg hover:bg-opacity-30 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {analysisState.isAnalyzing ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span>Analyze</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      <div className="p-4">
        {analysisState.isAnalyzing && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-600">Analyzing your code...</p>
            </div>
          </div>
        )}

        {analysisState.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{analysisState.error}</p>
            </div>
          </div>
        )}

        {analysisState.analysis && (
          <div className="space-y-4">
            {/* Overall Score */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Overall Score</h4>
                <div className={`px-3 py-1 rounded-full ${getScoreBgColor(analysisState.analysis.score)}`}>
                  <span className={`font-bold ${getScoreColor(analysisState.analysis.score)}`}>
                    {analysisState.analysis.score}/100
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    analysisState.analysis.score >= 80 ? 'bg-green-500' :
                    analysisState.analysis.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${analysisState.analysis.score}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>Complexity: {analysisState.analysis.complexity}</span>
                <span>Readability: {analysisState.analysis.readability}</span>
              </div>
            </div>

            {/* Errors */}
            {analysisState.analysis.errors.length > 0 && (
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('errors')}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-gray-900">
                      Errors ({analysisState.analysis.errors.length})
                    </span>
                  </div>
                  {expandedSections.errors ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedSections.errors && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-200"
                    >
                      <div className="p-4 space-y-3">
                        {analysisState.analysis.errors.map((error, index) => (
                          <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(error.severity)}`}>
                                    {error.severity.toUpperCase()}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    Line {error.line}, Column {error.column}
                                  </span>
                                </div>
                                <p className="text-red-800 font-medium mb-1">{error.message}</p>
                                <p className="text-red-700 text-sm mb-2">{error.explanation}</p>
                                <div className="bg-white border border-red-200 rounded p-2">
                                  <code className="text-sm text-gray-800">{error.fix}</code>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Suggestions */}
            {analysisState.analysis.suggestions.length > 0 && (
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('suggestions')}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <span className="font-semibold text-gray-900">
                      Suggestions ({analysisState.analysis.suggestions.length})
                    </span>
                  </div>
                  {expandedSections.suggestions ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedSections.suggestions && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-200"
                    >
                      <div className="p-4 space-y-3">
                        {analysisState.analysis.suggestions.map((suggestion, index) => (
                          <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(suggestion.difficulty)}`}>
                                    {suggestion.difficulty}
                                  </span>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    suggestion.impact === 'high' ? 'bg-red-100 text-red-800' :
                                    suggestion.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {suggestion.impact} impact
                                  </span>
                                </div>
                                <p className="text-yellow-800 font-medium mb-2">{suggestion.message}</p>
                                <p className="text-yellow-700 text-sm mb-3">{suggestion.explanation}</p>
                                <div className="bg-white border border-yellow-200 rounded p-2 mb-3">
                                  <code className="text-sm text-gray-800">{suggestion.code}</code>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => applySuggestion(suggestion)}
                                    className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors flex items-center space-x-1"
                                  >
                                    <Zap className="h-3 w-3" />
                                    <span>Apply</span>
                                  </button>
                                  <button
                                    onClick={() => copySuggestion(suggestion)}
                                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors flex items-center space-x-1"
                                  >
                                    <Copy className="h-3 w-3" />
                                    <span>Copy</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Performance Analysis */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('performance')}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Performance Analysis</span>
                </div>
                {expandedSections.performance ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              <AnimatePresence>
                {expandedSections.performance && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-200"
                  >
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Time Complexity</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {analysisState.analysis.performance.timeComplexity}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Space Complexity</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {analysisState.analysis.performance.spaceComplexity}
                          </p>
                        </div>
                      </div>
                      {analysisState.analysis.performance.bottlenecks.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Bottlenecks</p>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {analysisState.analysis.performance.bottlenecks.map((bottleneck, index) => (
                              <li key={index}>{bottleneck}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {analysisState.analysis.performance.optimizations.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Optimization Suggestions</p>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {analysisState.analysis.performance.optimizations.map((optimization, index) => (
                              <li key={index}>{optimization}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Best Practices */}
            {analysisState.analysis.bestPractices.length > 0 && (
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('bestPractices')}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-gray-900">
                      Best Practices ({analysisState.analysis.bestPractices.length})
                    </span>
                  </div>
                  {expandedSections.bestPractices ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedSections.bestPractices && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-200"
                    >
                      <div className="p-4 space-y-3">
                        {analysisState.analysis.bestPractices.map((practice, index) => (
                          <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                    {practice.category}
                                  </span>
                                </div>
                                <p className="text-green-800 font-medium mb-2">{practice.message}</p>
                                <p className="text-green-700 text-sm mb-3">{practice.explanation}</p>
                                <div className="bg-white border border-green-200 rounded p-2">
                                  <code className="text-sm text-gray-800">{practice.example}</code>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AICodingAssistant;
