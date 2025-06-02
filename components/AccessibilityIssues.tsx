import React, { useState } from 'react';
import { AccessibilityIssue } from '@/lib/types';

interface AccessibilityIssuesProps {
  issues: AccessibilityIssue[];
  onMarkFix: (issueId: string) => void;
}

export function AccessibilityIssues({ issues, onMarkFix }: AccessibilityIssuesProps) {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'serious':
        return 'bg-orange-100 text-orange-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🔴';
      case 'serious':
        return '🟠';
      case 'moderate':
        return '🟡';
      default:
        return '⚪';
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Accessibility Issues</h2>
      
      {issues.length === 0 ? (
        <div className="text-center py-8 bg-green-50 rounded-lg">
          <p className="text-green-600">No accessibility issues found! 🎉</p>
        </div>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={getSeverityColor(issue.severity) + " px-2 py-1 rounded-full text-sm"}>
                      {getSeverityIcon(issue.severity)} {issue.severity}
                    </span>
                    <h3 className="text-lg font-semibold">{issue.type}</h3>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {issue.impact === "critical" && (
                      <span className="text-red-600">Critical</span>
                    )}
                    {issue.impact === "serious" && (
                      <span className="text-orange-600">Serious</span>
                    )}
                    {issue.impact === "moderate" && (
                      <span className="text-yellow-600">Moderate</span>
                    )}
                    {issue.impact === "minor" && (
                      <span className="text-blue-600">Minor</span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {expandedIssue === issue.id ? "Hide Details" : "Show Details"}
                  </button>
                  
                  {expandedIssue === issue.id && (
                    <div className="mt-4 space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Current Code:</h4>
                        <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                          <code>{issue.element}</code>
                        </pre>
                      </div>
                      
                      {issue.fix && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">Suggested Fix:</h4>
                          <pre className="bg-green-100 p-2 rounded overflow-x-auto">
                            <code>{issue.fix}</code>
                          </pre>
                        </div>
                      )}
                      
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">How to Fix:</h4>
                        <ol className="list-decimal list-inside space-y-2">
                          <li>Copy the suggested fix code</li>
                          <li>Locate the element in your website&apos;s code</li>
                          <li>Replace the current code with the suggested fix</li>
                          <li>Test the change to ensure it works as expected</li>
                          <li>Click &quot;Mark as Fixed&quot; once you&apos;ve implemented the fix</li>
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => onMarkFix(issue.id)}
                  className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Mark as Fixed
                </button>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  {issue.message}
                </p>
                {issue.selector && (
                  <p className="text-sm text-gray-500 mt-1">
                    Element: <code className="bg-gray-100 px-1 py-0.5 rounded">{issue.selector}</code>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 