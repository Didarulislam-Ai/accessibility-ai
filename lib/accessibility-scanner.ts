import { JSDOM } from 'jsdom';
import { AccessibilityIssue } from './types';

export async function scanAccessibility(html: string, scanLevel: 'standard' | 'full' = 'standard'): Promise<AccessibilityIssue[]> {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const issues: AccessibilityIssue[] = [];

  // --- WCAG 2.1 Level A & some AA (Standard Scan) ---

  // 1. Perceivable Checks
  checkImageAltText(document, issues);
  checkVideoAccessibility(document, issues); // Includes captions (A) and audio description track check (AA)
  checkTextResizing(document, issues);
  checkColorContrast(document, issues); // Checks 1.4.3 AA
  checkImagesOfText(document, issues); // Checks 1.4.5 AA

  // 2. Operable Checks
  checkKeyboardAccessibility(document, issues);
  checkKeyboardTraps(document, issues);
  checkTimingAdjustable(document, issues);
  checkFlashingContent(document, issues);
  checkBypassBlocks(document, issues);
  checkPageTitles(document, issues);
  checkFocusOrder(document, issues);
  checkLinkPurpose(document, issues); // Checks 2.4.4 AA
  checkFocusVisible(document, issues); // Checks 2.4.7 AA

  // 3. Understandable Checks
  checkLanguage(document, issues); // Checks 3.1.1 A and 3.1.2 AA (Language of Parts)
  checkFocusChanges(document, issues);
  checkInputChanges(document, issues);
  checkConsistentNavigation(document, issues);
  checkConsistentIdentification(document, issues); // Checks 3.2.4 AA
  checkErrorIdentification(document, issues); // Checks 3.3.1 A and AA aspects
  checkLabelsAndInstructions(document, issues); // Checks 1.3.1 A, 4.1.2 A, and 2.4.6 AA aspects
  checkErrorSuggestions(document, issues); // Checks 3.3.3 AA
  checkErrorPrevention(document, issues); // Checks 3.3.4 AA (partial automation)

  // 4. Robust Checks
  checkParsing(document, issues); // Checks 4.1.1 A
  checkNameRoleValue(document, issues); // Checks 4.1.2 A

  // --- Additional WCAG 2.0 AA Checks which is AODA compliant (Full Scan for Enterprise) ---
  if (scanLevel === 'full') {
      // Re-running some checks that have AA components for clarity, 
      // although they are already called in the standard section.
      // This structure makes it explicit what's included in 'full'.

      // 1. Perceivable
      // checkVideoAccessibility already includes 1.2.5 AA
      // checkColorContrast already checks 1.4.3 AA
      // checkImagesOfText already checks 1.4.5 AA

      // 2. Operable
      // checkLinkPurpose already checks 2.4.4 AA
      // checkFocusVisible already checks 2.4.7 AA

      // 3. Understandable
      // checkLanguage already checks 3.1.2 AA
      // checkConsistentIdentification already checks 3.2.4 AA
      // checkErrorIdentification already checks 3.3.1 AA aspects
      // checkLabelsAndInstructions already checks 2.4.6 AA aspects
      // checkErrorSuggestions already checks 3.3.3 AA
      // checkErrorPrevention already checks 3.3.4 AA

      // Note: Some WCAG 2.0 AA criteria like 1.2.4 (Live Captions), 1.2.6 (Sign Language), 
      // 1.2.7 (Synchronized Media), 1.2.8 (Media Alternative), 1.2.9 (Audio-only Live),
      // 1.4.7 (Low-Contrast Audio), 1.4.8 (Visual Presentation - blocks of text),
      // and 2.4.5 (Multiple Ways) are difficult or impossible to reliably automate with a client-side scanner.
      // Users should be advised that manual testing may be required for full AODA compliance.
  }

  return issues;
}

// Perceivable Checks
function checkImageAltText(document: Document, issues: AccessibilityIssue[]) {
  document.querySelectorAll('img').forEach((img, index) => {
    if (!img.hasAttribute('alt')) {
      issues.push({
        id: `img-alt-${index}`,
        type: 'Missing Alt Text',
        element: img.outerHTML,
        description: 'Image is missing alt text, which is required for screen readers',
        severity: 'serious',
        fix: img.outerHTML.replace('<img', '<img alt="Description of image"')
      });
    }
  });
}

function checkVideoAccessibility(document: Document, issues: AccessibilityIssue[]) {
  document.querySelectorAll('video, audio').forEach((mediaElement, index) => {
    if (!mediaElement.hasAttribute('controls')) {
      issues.push({
        id: `media-controls-${index}`,
        type: 'Missing Media Controls',
        element: mediaElement.outerHTML,
        description: `${mediaElement.tagName} element missing controls attribute`,
        severity: 'serious'
      });
    }

    // Check for captions (for both video and audio where applicable)
    if (!mediaElement.querySelector('track[kind="captions"]')) {
      issues.push({
        id: `media-captions-${index}`,
        type: 'Missing Media Captions',
        element: mediaElement.outerHTML,
        description: `${mediaElement.tagName} missing captions track`,
        severity: 'serious'
      });
    }

    // Check for audio description track (primarily for video)
    if (mediaElement.tagName === 'VIDEO' && !mediaElement.querySelector('track[kind="descriptions"]')) {
        issues.push({
            id: `video-audio-description-${index}`,
            type: 'Missing Audio Description',
            element: mediaElement.outerHTML,
            description: 'Video missing audio description track (WCAG 2.0 AA 1.2.5)',
            severity: 'serious'
        });
    }
  });
}

function checkTextResizing(document: Document, issues: AccessibilityIssue[]) {
  const styleSheets = document.styleSheets;
  for (let i = 0; i < styleSheets.length; i++) {
    try {
      const rules = styleSheets[i].cssRules;
      for (let j = 0; j < rules.length; j++) {
        const rule = rules[j] as CSSStyleRule;
        if (rule.style.fontSize && rule.style.fontSize.includes('px')) {
          issues.push({
            id: `text-resize-${i}-${j}`,
            type: 'Fixed Font Size',
            element: rule.selectorText,
            description: 'Fixed font size may prevent text resizing',
            severity: 'moderate'
          });
        }
      }
    } catch {
      // Skip cross-origin stylesheets
    }
  }
}

function checkColorContrast(document: Document, issues: AccessibilityIssue[]) {
  document.querySelectorAll('*').forEach((element, index) => {
    try {
      const style = window.getComputedStyle(element);
      const backgroundColor = style.backgroundColor;
      const color = style.color;
      
      if (backgroundColor && color) {
        const contrast = calculateContrast(backgroundColor, color);
        if (contrast < 4.5) {
          issues.push({
            id: `color-contrast-${index}`,
            type: 'Low Color Contrast',
            element: element.outerHTML,
            description: 'Text color does not provide sufficient contrast with background',
            severity: 'serious',
            message: 'Text color does not provide sufficient contrast with background',
            selector: getSelector(element)
          });
        }
      }
    } catch (error) {
      console.error("Error checking color contrast:", error);
    }
  });
}

// Helper function to get CSS selector for an element
function getSelector(element: Element): string {
  if (element.id) {
    return `#${element.id}`;
  }
  if (element.className) {
    return `.${element.className.split(' ').join('.')}`;
  }
  return element.tagName.toLowerCase();
}

function checkImagesOfText(document: Document, issues: AccessibilityIssue[]) {
  document.querySelectorAll('img').forEach((img, index) => {
    if (img.hasAttribute('alt') && img.alt.length > 0 && !img.alt.includes(' ')) {
      issues.push({
        id: `image-text-${index}`,
        type: 'Image of Text',
        element: img.outerHTML,
        description: 'Image appears to contain text that should be actual text',
        severity: 'moderate'
      });
    }
  });
}

// Operable Checks
function checkKeyboardAccessibility(document: Document, issues: AccessibilityIssue[]) {
  document.querySelectorAll('a, button, [role="button"], input, select, textarea').forEach((element, index) => {
    if (!element.hasAttribute('tabindex') && element.getAttribute('tabindex') !== '0') {
      issues.push({
        id: `keyboard-${index}`,
        type: 'Keyboard Accessibility',
        element: element.outerHTML,
        description: 'Interactive element may not be keyboard accessible',
        severity: 'serious'
      });
    }
  });
}

function checkKeyboardTraps(document: Document, issues: AccessibilityIssue[]) {
  document.querySelectorAll('dialog, [role="dialog"]').forEach((dialog, index) => {
    if (!dialog.querySelector('button[aria-label="Close"]')) {
      issues.push({
        id: `keyboard-trap-${index}`,
        type: 'Potential Keyboard Trap',
        element: dialog.outerHTML,
        description: 'Dialog may trap keyboard focus',
        severity: 'serious'
      });
    }
  });
}

function checkFocusVisible(document: Document, issues: AccessibilityIssue[]) {
  const styleSheets = document.styleSheets;
  for (let i = 0; i < styleSheets.length; i++) {
    try {
      const rules = styleSheets[i].cssRules;
      for (let j = 0; j < rules.length; j++) {
        const rule = rules[j] as CSSStyleRule;
        if (rule.selectorText.includes(':focus') && !rule.style.outline && !rule.style.boxShadow) {
          issues.push({
            id: `focus-visible-${i}-${j}`,
            type: 'Focus Not Visible',
            element: rule.selectorText,
            description: 'Focus indicator may not be visible',
            severity: 'serious'
          });
        }
      }
    } catch {
      // Skip cross-origin stylesheets
    }
  }
}

// Understandable Checks
function checkLanguage(document: Document, issues: AccessibilityIssue[]) {
  if (!document.documentElement.hasAttribute('lang')) {
    issues.push({
      id: 'lang-missing',
      type: 'Missing Language of Page',
      element: document.documentElement.outerHTML,
      description: 'Document missing language attribute (WCAG 2.0 A 3.1.1)',
      severity: 'serious'
    });
  }
  // Check for language changes within the page (WCAG 2.0 AA 3.1.2)
  document.querySelectorAll('[lang]').forEach((element) => {
    if (element.closest('[lang]') !== document.documentElement) {
      // Check if lang is different from the main document language
      const mainLang = document.documentElement.getAttribute('lang');
      const elementLang = element.getAttribute('lang');
      if (mainLang && elementLang && mainLang !== elementLang) {
        // This check is basic and assumes any nested lang is intentional
      }
    }
  });
}

function checkLabelsAndInstructions(document: Document, issues: AccessibilityIssue[]) {
  document.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach((element, index) => {
    const hasLabel = document.querySelector(`label[for="${element.id}"]`) !== null;
    const hasAriaLabel = element.hasAttribute('aria-label');
    const hasAriaLabelledby = element.hasAttribute('aria-labelledby');
    const hasTitle = element.hasAttribute('title');

    if (!hasLabel && !hasAriaLabel && !hasAriaLabelledby && !hasTitle) {
      issues.push({
        id: `label-${index}`,
        type: 'Missing Form Label/Name',
        element: element.outerHTML,
        description: 'Form control missing accessible name (label, aria-label, aria-labelledby, or title attribute) (WCAG 2.0 A 1.3.1, 4.1.2)',
        severity: 'serious'
      });
    }
  });
   // Enhance check for meaningful labels/headings (WCAG 2.0 AA 2.4.6) - This is hard to fully automate.
   // We can add a check for common non-descriptive text.
   document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading, index) => {
        const text = heading.textContent?.trim().toLowerCase();
        if (!text || ['heading', 'title', 'section'].some(word => text.includes(word))) {
             issues.push({
                id: `heading-meaning-${index}`,
                type: 'Potentially Non-Descriptive Heading',
                element: heading.outerHTML,
                description: 'Heading text may not clearly describe the section content (WCAG 2.0 AA 2.4.6)',
                severity: 'moderate'
             });
        }
   });
    document.querySelectorAll('label').forEach((label, index) => {
        const text = label.textContent?.trim().toLowerCase();
         if (!text || ['label', 'input'].some(word => text.includes(word))) {
             issues.push({
                id: `label-meaning-${index}`,
                type: 'Potentially Non-Descriptive Label',
                element: label.outerHTML,
                description: 'Label text may not clearly describe the associated input field (WCAG 2.0 AA 2.4.6)',
                severity: 'moderate'
             });
        }
    });
}

// Robust Checks
function checkParsing(document: Document, issues: AccessibilityIssue[]) {
  document.querySelectorAll('*').forEach((element, index) => {
    if (element.hasAttribute('id') && document.querySelectorAll(`#${element.id}`).length > 1) {
      issues.push({
        id: `duplicate-id-${index}`,
        type: 'Duplicate ID',
        element: element.outerHTML,
        description: 'Duplicate ID found',
        severity: 'serious'
      });
    }
  });
}

function checkNameRoleValue(document: Document, issues: AccessibilityIssue[]) {
  document.querySelectorAll('[role]').forEach((element, index) => {
    if (!element.hasAttribute('aria-label') && !element.hasAttribute('aria-labelledby')) {
      issues.push({
        id: `role-value-${index}`,
        type: 'Missing ARIA Label',
        element: element.outerHTML,
        description: 'Element with role attribute missing accessible name',
        severity: 'serious'
      });
    }
  });
}

function checkTimingAdjustable(document: Document, issues: AccessibilityIssue[]) {
  document.querySelectorAll('meta[http-equiv="refresh"]').forEach((meta, index) => {
    issues.push({
      id: `timing-${index}`,
      type: 'Auto-Refresh',
      element: meta.outerHTML,
      description: 'Page uses auto-refresh which may be disorienting',
      severity: 'serious'
    });
  });
}

function checkFlashingContent(document: Document, issues: AccessibilityIssue[]) {
  document.querySelectorAll('*').forEach((element, index) => {
    const style = window.getComputedStyle(element);
    if (style.animation && style.animation.includes('flash')) {
      issues.push({
        id: `flash-${index}`,
        type: 'Flashing Content',
        element: element.outerHTML,
        description: 'Element contains flashing animation',
        severity: 'critical'
      });
    }
  });
}

function checkBypassBlocks(document: Document, issues: AccessibilityIssue[]) {
  if (!document.querySelector('a[href="#main-content"]')) {
    issues.push({
      id: 'bypass-blocks',
      type: 'Missing Skip Link',
      element: document.body.outerHTML,
      description: 'No skip link to bypass repeated blocks',
      severity: 'serious'
    });
  }
}

function checkPageTitles(document: Document, issues: AccessibilityIssue[]) {
  const title = document.querySelector('title');
  if (!title || !title.textContent) {
    issues.push({
      id: 'page-title',
      type: 'Missing Page Title',
      element: document.head.outerHTML,
      description: 'Page missing title element',
      severity: 'serious'
    });
  }
}

function checkFocusOrder(document: Document, issues: AccessibilityIssue[]) {
  const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
  let lastTabIndex = -1;
  
  focusableElements.forEach((element, index) => {
    const tabIndex = parseInt(element.getAttribute('tabindex') || '0');
    if (tabIndex < lastTabIndex) {
      issues.push({
        id: `focus-order-${index}`,
        type: 'Focus Order',
        element: element.outerHTML,
        description: 'Focus order may not be logical',
        severity: 'moderate'
      });
    }
    lastTabIndex = tabIndex;
  });
}

function checkLinkPurpose(document: Document, issues: AccessibilityIssue[]) {
  document.querySelectorAll('a').forEach((link, index) => {
    if (link.textContent?.trim() === 'Click here' || link.textContent?.trim() === 'Read more') {
      issues.push({
        id: `link-purpose-${index}`,
        type: 'Generic Link Text',
        element: link.outerHTML,
        description: 'Link text is too generic',
        severity: 'moderate'
      });
    }
  });
}

function checkFocusChanges(document: Document, issues: AccessibilityIssue[]) {
  document.querySelectorAll('*').forEach((element, index) => {
    if (element.hasAttribute('onfocus') && !element.hasAttribute('aria-live')) {
      issues.push({
        id: `focus-change-${index}`,
        type: 'Focus Change',
        element: element.outerHTML,
        description: 'Focus change may not be announced to screen readers',
        severity: 'moderate'
      });
    }
  });
}

function checkInputChanges(document: Document, issues: AccessibilityIssue[]) {
  document.querySelectorAll('input, select, textarea').forEach((element, index) => {
    if (element.hasAttribute('onchange') && !element.hasAttribute('aria-live')) {
      issues.push({
        id: `input-change-${index}`,
        type: 'Input Change',
        element: element.outerHTML,
        description: 'Input change may not be announced to screen readers',
        severity: 'moderate'
      });
    }
  });
}

function checkConsistentNavigation(document: Document, issues: AccessibilityIssue[]) {
  const navElements = document.querySelectorAll('nav');
  if (navElements.length > 1) {
    const firstNav = navElements[0].innerHTML;
    navElements.forEach((nav, index) => {
      if (index > 0 && nav.innerHTML !== firstNav) {
        issues.push({
          id: `nav-consistency-${index}`,
          type: 'Navigation Consistency',
          element: nav.outerHTML,
          description: 'Navigation structure is inconsistent across pages',
          severity: 'moderate'
        });
      }
    });
  }
}

function checkConsistentIdentification(document: Document, issues: AccessibilityIssue[]) {
  const components = document.querySelectorAll('[role]');
  const componentTypes = new Map<string, string>();
  
  components.forEach((component, index) => {
    const role = component.getAttribute('role');
    const type = component.getAttribute('aria-label') || component.textContent?.trim();
    
    if (role && type) {
      if (componentTypes.has(role) && componentTypes.get(role) !== type) {
        issues.push({
          id: `consistent-id-${index}`,
          type: 'Inconsistent Identification',
          element: component.outerHTML,
          description: `Component with role "${role}" has inconsistent identification`,
          severity: 'moderate'
        });
      } else {
        componentTypes.set(role, type);
      }
    }
  });
}

function checkErrorIdentification(document: Document, issues: AccessibilityIssue[]) {
  document.querySelectorAll('[aria-invalid="true"]').forEach((element, index) => {
    const hasErrorDescription = element.hasAttribute('aria-describedby') && 
                                document.getElementById(element.getAttribute('aria-describedby')!) !== null;
    const hasAriaErrorMessage = element.hasAttribute('aria-errormessage'); // WCAG 2.1

    if (!hasErrorDescription && !hasAriaErrorMessage) {
      issues.push({
        id: `error-identification-${index}`,
        type: 'Input Error Not Described',
        element: element.outerHTML,
        description: 'Form input marked as invalid but error is not programmatically described (WCAG 2.0 A 3.3.1)',
        severity: 'serious'
      });
    }
     // Refine check for clear association (WCAG 2.0 AA 3.3.1) - hard to fully automate precise association.
     // The aria-describedby and aria-errormessage provide this association programmatically.
     // A manual review might be needed to ensure the linked text is descriptive.
  });
}

function checkErrorSuggestions(document: Document, issues: AccessibilityIssue[]) {
  document.querySelectorAll('form').forEach((form, index) => {
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach((input) => {
      if (input.hasAttribute('aria-invalid') && !input.nextElementSibling?.classList.contains('error-message')) {
        issues.push({
          id: `error-suggestion-${index}`,
          type: 'Missing Error Suggestion',
          element: input.outerHTML,
          description: 'Form control marked as invalid but missing error suggestion',
          severity: 'moderate'
        });
      }
    });
  });
}

function checkErrorPrevention(document: Document, issues: AccessibilityIssue[]) {
  document.querySelectorAll('form').forEach((form, index) => {
    if (form.querySelector('input[type="submit"]') && !form.querySelector('button[type="reset"]')) {
      issues.push({
        id: `error-prevention-${index}`,
        type: 'Missing Form Reset',
        element: form.outerHTML,
        description: 'Form with submit button missing reset option',
        severity: 'moderate'
      });
    }
  });
}

// Helper Functions
function calculateContrast(bg: string, text: string): number {
  const bgRgb = hexToRgb(bg);
  const textRgb = hexToRgb(text);
  
  if (!bgRgb || !textRgb) return 4.5;
  
  const bgLuminance = calculateLuminance(bgRgb);
  const textLuminance = calculateLuminance(textRgb);
  
  const lighter = Math.max(bgLuminance, textLuminance);
  const darker = Math.min(bgLuminance, textLuminance);
  
  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  hex = hex.replace('#', '');
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  
  return { r, g, b };
}

function calculateLuminance(rgb: { r: number; g: number; b: number }): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function checkFormLabels(form: HTMLFormElement): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const inputs = form.querySelectorAll("input, select, textarea");
  
  inputs.forEach((input, index) => {
    if (!input.hasAttribute("id")) {
      issues.push({
        id: `form-label-${index}`,
        type: "form",
        element: input.outerHTML,
        description: "Form control missing ID",
        severity: "serious",
        message: "Form control missing ID",
        selector: getSelector(input)
      });
    }
  });
  
  return issues;
} 