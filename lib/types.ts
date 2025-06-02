export interface AccessibilityIssue {
  id: string;
  type: string;
  element: string;
  description: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  fix?: string;
  message?: string;
  selector?: string;
  impact?: 'critical' | 'serious' | 'moderate' | 'minor';
}

export interface Subscription {
  id: string;
  apiKey: string;
  status: 'active' | 'inactive' | 'expired';
  plan: 'basic' | 'pro' | 'enterprise';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
} 