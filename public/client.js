class AccessibilityDashboard {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = window.location.origin; // Automatically use the current domain
    this.isInitialized = false;
    this.issues = [];
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

  async startMonitoring() {
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

  async scanPage() {
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

  updateDashboard() {
    // Create or update the dashboard UI
    let dashboard = document.getElementById('accessibility-dashboard');
    if (!dashboard) {
      dashboard = document.createElement('div');
      dashboard.id = 'accessibility-dashboard';
      document.body.appendChild(dashboard);
    }

    // Update dashboard content
    dashboard.innerHTML = `
      <div class="accessibility-dashboard" style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        padding: 16px;
        max-width: 400px;
        max-height: 80vh;
        overflow-y: auto;
        z-index: 9999;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Accessibility Issues (${this.issues.length})</h3>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
          ">×</button>
        </div>
        <div class="issues-list" style="display: flex; flex-direction: column; gap: 8px;">
          ${this.issues.map(issue => `
            <div class="issue-item" style="
              padding: 8px;
              border-radius: 4px;
              background: ${this.getSeverityColor(issue.severity)};
            ">
              <div style="font-weight: 500; margin-bottom: 4px;">${issue.type}</div>
              <div style="font-size: 14px; color: #666;">${issue.description}</div>
              ${issue.fix ? `
                <button onclick="window.accessibilityDashboard.fixIssue('${issue.id}')" style="
                  margin-top: 8px;
                  padding: 4px 8px;
                  background: #007bff;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
                ">
                  Fix Issue
                </button>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  getSeverityColor(severity) {
    const colors = {
      critical: '#fee2e2',
      serious: '#fef3c7',
      moderate: '#dbeafe',
      minor: '#f3f4f6'
    };
    return colors[severity] || colors.minor;
  }

  async fixIssue(issueId) {
    const issue = this.issues.find(i => i.id === issueId);
    if (!issue || !issue.fix) return;

    try {
      const response = await fetch(`${this.baseUrl}/api/fix-issue`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          issueId,
          fix: issue.fix
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fix issue');
      }

      // Refresh the page to show the fix
      window.location.reload();
    } catch (error) {
      console.error('Failed to fix issue:', error);
    }
  }
}

// Make it available globally
window.AccessibilityDashboard = AccessibilityDashboard; 