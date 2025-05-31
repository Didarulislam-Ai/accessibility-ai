interface AccessibilityIssue {
  id: string;
  type: string;
  element: string;
  description: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  fix?: string;
}

// Add this interface before the class definition
interface Window {
  AccessibilityDashboard: typeof AccessibilityDashboard;
}

class AccessibilityDashboard {
  private apiKey: string;
  private baseUrl: string;
  private issues: AccessibilityIssue[] = [];
  private isInitialized: boolean = false;

  constructor(apiKey: string, baseUrl: string = 'https://api.accessibility-dashboard.com') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Check subscription status
      const response = await fetch(`${this.baseUrl}/api/check-subscription`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Invalid API key or subscription expired');
      }

      this.isInitialized = true;
      this.startMonitoring();
    } catch (error) {
      console.error('Failed to initialize accessibility dashboard:', error);
    }
  }

  private async startMonitoring() {
    // Run initial scan
    await this.scanPage();
    
    // Set up mutation observer to detect DOM changes
    const observer = new MutationObserver(() => {
      this.scanPage();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });
  }

  private async scanPage() {
    try {
      const response = await fetch(`${this.baseUrl}/api/scan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: window.location.href,
          html: document.documentElement.outerHTML
        })
      });

      if (!response.ok) {
        throw new Error('Failed to scan page');
      }

      const data = await response.json();
      this.issues = data.issues;
      this.updateDashboard();
    } catch (error) {
      console.error('Failed to scan page:', error);
    }
  }

  private updateDashboard() {
    // Update the dashboard UI with new issues
    const dashboard = document.getElementById('accessibility-dashboard');
    if (!dashboard) return;

    // Update dashboard content
    dashboard.innerHTML = `
      <div class="accessibility-dashboard">
        <h2>Accessibility Issues (${this.issues.length})</h2>
        <div class="issues-list">
          ${this.issues.map(issue => `
            <div class="issue-item ${issue.severity}">
              <h3>${issue.type}</h3>
              <p>${issue.description}</p>
              ${issue.fix ? `
                <button onclick="window.accessibilityDashboard.fixIssue('${issue.id}')">
                  Fix Issue
                </button>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  async fixIssue(issueId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/fix-issue`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          issueId,
          url: window.location.href
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fix issue');
      }

      const data = await response.json();
      // Apply the fix to the page
      if (data.fix) {
        const element = document.querySelector(data.element);
        if (element) {
          element.outerHTML = data.fix;
        }
      }

      // Remove the fixed issue from the list
      this.issues = this.issues.filter(issue => issue.id !== issueId);
      this.updateDashboard();
    } catch (error) {
      console.error('Failed to fix issue:', error);
    }
  }
}

// At the bottom of the file, replace the any type
(window as Window).AccessibilityDashboard = AccessibilityDashboard; 