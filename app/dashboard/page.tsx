"use client";

import { useState, useEffect } from 'react';
import { AccessibilityIssues } from '@/components/AccessibilityIssues';
import { AccessibilityIssue } from '@/lib/types';

export default function Dashboard() {
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/issues');
      if (!response.ok) {
        throw new Error('Failed to fetch issues');
      }
      const data = await response.json();
      setIssues(data.issues);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkFix = async (issueId: string) => {
    try {
      const response = await fetch(`/api/issues/${issueId}/fix`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to mark issue as fixed');
      }

      // Update the local state to remove the fixed issue
      setIssues(issues.filter(issue => issue.id !== issueId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Accessibility Dashboard</h1>
        <p className="text-gray-600">
          Review and fix accessibility issues found on your website. Click "Show Details" to see how to fix each issue.
        </p>
      </div>

      <div className="mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">How to Fix Issues</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Click "Show Details" on any issue to see the current code and suggested fix</li>
            <li>Copy the suggested fix code</li>
            <li>Make the changes on your website</li>
            <li>Test the changes to ensure they work correctly</li>
            <li>Click "Mark as Fixed" once you've implemented the fix</li>
          </ol>
        </div>
      </div>

      <AccessibilityIssues issues={issues} onMarkFix={handleMarkFix} />
    </div>
  );
}