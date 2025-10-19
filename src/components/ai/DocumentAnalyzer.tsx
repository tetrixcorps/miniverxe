import React, { useState, useCallback } from 'react';
import { openWebUIService } from '../../services/openwebui';
import type { DocumentAnalysis } from '../../services/openwebui';

interface DocumentAnalyzerProps {
  industry: string;
  onAnalysisComplete?: (analysis: DocumentAnalysis) => void;
  onError?: (error: string) => void;
  className?: string;
}

const DocumentAnalyzer: React.FC<DocumentAnalyzerProps> = ({
  industry,
  onAnalysisComplete,
  onError,
  className = ''
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      onError?.('Please upload a valid document (PDF, Word, Excel, or text file)');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      onError?.('File size must be less than 10MB');
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const result = await openWebUIService.analyzeDocument(file, industry);
      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (error) {
      console.error('Error analyzing document:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to analyze document');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getIndustryIcon = () => {
    const icons = {
      healthcare: '🏥',
      legal: '⚖️',
      retail: '🛒',
      construction: '🏗️',
      education: '🎓',
      government: '🏛️',
      hospitality: '🏨',
      logistics: '🚚',
      wellness: '🏥',
      beauty: '🎨'
    };
    return icons[industry as keyof typeof icons] || '📄';
  };

  const getIndustryColor = () => {
    const colors = {
      healthcare: 'blue',
      legal: 'purple',
      retail: 'green',
      construction: 'orange',
      education: 'indigo',
      government: 'gray',
      hospitality: 'pink',
      logistics: 'yellow',
      wellness: 'teal',
      beauty: 'rose'
    };
    return colors[industry as keyof typeof colors] || 'blue';
  };

  const colorClass = getIndustryColor();

  return (
    <div className={`document-analyzer ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? `border-${colorClass}-400 bg-${colorClass}-50`
            : `border-gray-300 hover:border-${colorClass}-400`
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInput}
          accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
          className="hidden"
        />

        {isAnalyzing ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Analyzing document for {industry}...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-4xl">{getIndustryIcon()}</div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Upload a {industry} document for AI analysis
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Supports PDF, Word, Excel, and text files up to 10MB
              </p>
            </div>
            <button
              onClick={triggerFileInput}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-${colorClass}-600 hover:bg-${colorClass}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${colorClass}-500`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Choose File
            </button>
            <p className="text-xs text-gray-400">
              or drag and drop your file here
            </p>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="mt-6 space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Analysis Results</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Confidence:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  analysis.confidence > 0.8 ? 'bg-green-100 text-green-800' :
                  analysis.confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {Math.round(analysis.confidence * 100)}%
                </span>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-900 mb-2">Summary</h4>
              <p className="text-gray-700 text-sm leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Key Points */}
            {analysis.keyPoints.length > 0 && (
              <div className="mb-4">
                <h4 className="text-md font-medium text-gray-900 mb-2">Key Points</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.keyPoints.map((point, index) => (
                    <li key={index} className="text-gray-700 text-sm">{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detailed Analysis */}
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-900 mb-2">Detailed Analysis</h4>
              <div className="bg-gray-50 rounded-md p-3">
                <p className="text-gray-700 text-sm leading-relaxed">{analysis.analysis}</p>
              </div>
            </div>

            {/* File Info */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
              <span>File: {analysis.filename}</span>
              <span>Analyzed: {analysis.timestamp.toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => navigator.clipboard.writeText(analysis.summary)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Copy Summary
            </button>
            <button
              onClick={() => {
                const blob = new Blob([analysis.analysis], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${analysis.filename}_analysis.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Download Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentAnalyzer;
