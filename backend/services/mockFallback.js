/**
 * mockFallback.js
 * Realistic fallback data returned when the Granite 3.0 API is unavailable
 * (rate-limited, auth error, network timeout, etc.)
 * The frontend never sees an error — it receives valid structured data.
 */

const INTEREST_ROADMAPS = {
  frontend: {
    title: 'Frontend Development Roadmap',
    summary: 'A structured pathway to becoming a proficient Frontend Developer. You will progress from core web fundamentals through modern React development, building real-world projects at every stage.',
    totalWeeks: 14,
    careerOutcome: 'Junior Frontend Developer, UI Engineer, React Developer',
    modules: [
      { id: 1, title: 'Web Fundamentals & HTML', description: 'Master semantic HTML5, accessibility, and page structure.', weeks: 2, difficulty: 'Beginner', topics: ['HTML5 semantics', 'Forms & inputs', 'Accessibility', 'SEO basics'], ibmCourse: { name: 'Web Development Fundamentals', url: 'https://skillsbuild.org', duration: '4 hours' }, milestoneProject: 'Build a responsive personal portfolio page with semantic HTML.', completed: false },
      { id: 2, title: 'CSS & Responsive Design', description: 'Style beautiful interfaces and create mobile-first responsive layouts.', weeks: 2, difficulty: 'Beginner', topics: ['CSS Grid', 'Flexbox', 'Media queries', 'CSS variables', 'Animations'], ibmCourse: { name: 'CSS for Web Design', url: 'https://skillsbuild.org', duration: '5 hours' }, milestoneProject: 'Recreate a real-world landing page using CSS Grid and Flexbox.', completed: false },
      { id: 3, title: 'JavaScript Essentials', description: 'Learn core JavaScript: variables, functions, DOM manipulation, and async patterns.', weeks: 3, difficulty: 'Beginner', topics: ['ES6+ syntax', 'DOM API', 'Promises & async/await', 'Fetch API', 'Event handling'], ibmCourse: { name: 'JavaScript Programming', url: 'https://skillsbuild.org', duration: '8 hours' }, milestoneProject: 'Build an interactive to-do app with local storage persistence.', completed: false },
      { id: 4, title: 'React.js Core Concepts', description: 'Build component-based UIs with React, hooks, and state management.', weeks: 3, difficulty: 'Intermediate', topics: ['Components & props', 'useState / useEffect', 'React Router', 'Context API', 'Custom hooks'], ibmCourse: { name: 'React Development', url: 'https://skillsbuild.org', duration: '10 hours' }, milestoneProject: 'Build a multi-page React app with routing and global state.', completed: false },
      { id: 5, title: 'APIs & Data Fetching', description: 'Connect frontends to REST APIs, handle loading states, and manage errors.', weeks: 2, difficulty: 'Intermediate', topics: ['REST APIs', 'Axios / Fetch', 'Error boundaries', 'Loading states', 'Authentication tokens'], ibmCourse: { name: 'API Integration for Frontend', url: 'https://skillsbuild.org', duration: '6 hours' }, milestoneProject: 'Build a weather dashboard consuming a public REST API.', completed: false },
      { id: 6, title: 'Testing & Deployment', description: 'Write tests, optimize performance, and deploy your app to production.', weeks: 2, difficulty: 'Intermediate', topics: ['Jest & React Testing Library', 'Performance optimization', 'Lighthouse audits', 'CI/CD basics', 'Vercel deployment'], ibmCourse: { name: 'Frontend Testing & DevOps', url: 'https://skillsbuild.org', duration: '5 hours' }, milestoneProject: 'Add unit + integration tests to your React app and deploy to Vercel.', completed: false },
    ]
  },
  cybersecurity: {
    title: 'Cybersecurity Professional Roadmap',
    summary: 'A comprehensive pathway from security fundamentals to hands-on ethical hacking. Build practical skills in network security, penetration testing, and incident response used in real SOC environments.',
    totalWeeks: 16,
    careerOutcome: 'Security Analyst, Penetration Tester, SOC Engineer',
    modules: [
      { id: 1, title: 'Security Fundamentals', description: 'Understand the CIA triad, threat landscape, and core security concepts.', weeks: 2, difficulty: 'Beginner', topics: ['CIA Triad', 'Threat actors', 'Attack vectors', 'Security frameworks', 'Risk management'], ibmCourse: { name: 'Introduction to Cybersecurity', url: 'https://skillsbuild.org', duration: '6 hours' }, milestoneProject: 'Conduct a basic security audit of a sample system and document findings.', completed: false },
      { id: 2, title: 'Networking for Security', description: 'Master TCP/IP, protocols, and network architecture from a security perspective.', weeks: 2, difficulty: 'Beginner', topics: ['TCP/IP stack', 'DNS & HTTP', 'Firewalls & IDS', 'VPNs', 'Packet analysis with Wireshark'], ibmCourse: { name: 'Network Security Essentials', url: 'https://skillsbuild.org', duration: '7 hours' }, milestoneProject: 'Use Wireshark to capture and analyze network traffic for anomalies.', completed: false },
      { id: 3, title: 'Linux & Command Line', description: 'Build Linux proficiency essential for security tooling and server administration.', weeks: 2, difficulty: 'Beginner', topics: ['Bash scripting', 'File permissions', 'Process management', 'Log analysis', 'SSH hardening'], ibmCourse: { name: 'Linux for Security Professionals', url: 'https://skillsbuild.org', duration: '8 hours' }, milestoneProject: 'Harden a Linux server: disable unused services, configure firewall rules.', completed: false },
      { id: 4, title: 'Web Application Security', description: 'Identify and exploit OWASP Top 10 vulnerabilities in web applications.', weeks: 3, difficulty: 'Intermediate', topics: ['SQL Injection', 'XSS & CSRF', 'Authentication flaws', 'Burp Suite', 'OWASP Top 10'], ibmCourse: { name: 'Web Application Security Testing', url: 'https://skillsbuild.org', duration: '10 hours' }, milestoneProject: 'Exploit and remediate vulnerabilities in a deliberately vulnerable web app (DVWA).', completed: false },
      { id: 5, title: 'Penetration Testing', description: 'Learn ethical hacking methodology and tools for authorized security assessments.', weeks: 3, difficulty: 'Intermediate', topics: ['Reconnaissance', 'Metasploit', 'Privilege escalation', 'Post-exploitation', 'Reporting'], ibmCourse: { name: 'Ethical Hacking Fundamentals', url: 'https://skillsbuild.org', duration: '12 hours' }, milestoneProject: 'Complete a full penetration test on a TryHackMe or HackTheBox machine.', completed: false },
      { id: 6, title: 'Incident Response & Forensics', description: 'Respond to security incidents, analyze artifacts, and preserve evidence.', weeks: 4, difficulty: 'Advanced', topics: ['Incident response lifecycle', 'Memory forensics', 'Log analysis', 'SIEM tools', 'Chain of custody'], ibmCourse: { name: 'Digital Forensics & Incident Response', url: 'https://skillsbuild.org', duration: '10 hours' }, milestoneProject: 'Investigate a simulated breach: identify indicators of compromise and write an IR report.', completed: false },
    ]
  },
  default: {
    title: 'Technology Career Roadmap',
    summary: 'A structured learning pathway tailored to your chosen technology domain. Progress through foundational concepts to advanced specialization with hands-on projects at every milestone.',
    totalWeeks: 12,
    careerOutcome: 'Technology Professional, Software Engineer, Technical Specialist',
    modules: [
      { id: 1, title: 'Foundations & Core Concepts', description: 'Build a solid understanding of the fundamental concepts in your chosen domain.', weeks: 2, difficulty: 'Beginner', topics: ['Domain overview', 'Key terminology', 'Core principles', 'Industry tools', 'Best practices'], ibmCourse: { name: 'Technology Foundations', url: 'https://skillsbuild.org', duration: '4 hours' }, milestoneProject: 'Create a personal learning journal documenting key concepts and their applications.', completed: false },
      { id: 2, title: 'Core Skills Development', description: 'Develop hands-on skills through guided exercises and real-world examples.', weeks: 3, difficulty: 'Beginner', topics: ['Practical exercises', 'Tool proficiency', 'Problem solving', 'Documentation', 'Debugging'], ibmCourse: { name: 'Core Technical Skills', url: 'https://skillsbuild.org', duration: '6 hours' }, milestoneProject: 'Complete 5 guided exercises demonstrating core technical competencies.', completed: false },
      { id: 3, title: 'Intermediate Applications', description: 'Apply your knowledge to solve realistic problems and build practical projects.', weeks: 3, difficulty: 'Intermediate', topics: ['Applied techniques', 'Project structure', 'Code quality', 'Testing', 'Collaboration'], ibmCourse: { name: 'Intermediate Technical Practice', url: 'https://skillsbuild.org', duration: '8 hours' }, milestoneProject: 'Build a functional project that demonstrates intermediate-level skills.', completed: false },
      { id: 4, title: 'Advanced Techniques & Patterns', description: 'Master advanced patterns, optimizations, and professional-grade workflows.', weeks: 2, difficulty: 'Advanced', topics: ['Advanced patterns', 'Performance optimization', 'Security considerations', 'Scalability', 'Code review'], ibmCourse: { name: 'Advanced Technical Mastery', url: 'https://skillsbuild.org', duration: '8 hours' }, milestoneProject: 'Refactor an existing project using advanced patterns and document improvements.', completed: false },
      { id: 5, title: 'Capstone Project & Portfolio', description: 'Combine all skills into a portfolio-ready capstone project.', weeks: 2, difficulty: 'Advanced', topics: ['Project planning', 'Full implementation', 'Testing & QA', 'Documentation', 'Presentation'], ibmCourse: { name: 'Project Management & Delivery', url: 'https://skillsbuild.org', duration: '5 hours' }, milestoneProject: 'Design, build, and present a complete capstone project for your portfolio.', completed: false },
    ]
  }
};

const MOCK_QUIZ_QUESTIONS = {
  default: [
    { id: 1, question: 'What does the acronym "REST" stand for in web development?', options: ['Reliable Efficient State Transfer', 'Representational State Transfer', 'Remote Execution Service Technology', 'Rapid Endpoint Service Template'], correctIndex: 1, explanation: 'REST stands for Representational State Transfer, an architectural style for distributed hypermedia systems.' },
    { id: 2, question: 'Which HTTP method is used to retrieve data from a server?', options: ['POST', 'PUT', 'GET', 'DELETE'], correctIndex: 2, explanation: 'GET requests retrieve data without modifying the server state.' },
    { id: 3, question: 'What is the purpose of a "promise" in JavaScript?', options: ['To declare a variable', 'To handle asynchronous operations', 'To define a class', 'To import a module'], correctIndex: 1, explanation: 'Promises represent the eventual completion or failure of an asynchronous operation.' },
    { id: 4, question: 'Which data structure provides O(1) average-time lookups by key?', options: ['Array', 'Linked List', 'Hash Map', 'Binary Tree'], correctIndex: 2, explanation: 'Hash Maps (dictionaries) use a hash function to achieve constant average-time key lookups.' },
    { id: 5, question: 'What does "CI/CD" stand for?', options: ['Code Integration / Code Deployment', 'Continuous Integration / Continuous Delivery', 'Certified Infrastructure / Certified Deployment', 'Client Integration / Client Deployment'], correctIndex: 1, explanation: 'CI/CD stands for Continuous Integration and Continuous Delivery/Deployment, automating build and release pipelines.' },
    { id: 6, question: 'What is the role of a primary key in a relational database?', options: ['Encrypts sensitive data', 'Uniquely identifies each record', 'Links two tables together', 'Indexes the table for speed'], correctIndex: 1, explanation: 'A primary key uniquely identifies each row in a database table, preventing duplicates.' },
    { id: 7, question: 'Which principle of software design suggests classes should have one reason to change?', options: ['Open/Closed Principle', 'Single Responsibility Principle', 'Dependency Inversion', 'Interface Segregation'], correctIndex: 1, explanation: 'The Single Responsibility Principle (SRP) states a class/module should have only one responsibility.' },
    { id: 8, question: 'What does "version control" enable in software development?', options: ['Faster code execution', 'Tracking changes and team collaboration', 'Automatic bug fixing', 'Real-time performance monitoring'], correctIndex: 1, explanation: 'Version control systems like Git track changes to code over time and enable team collaboration.' },
    { id: 9, question: 'What is the difference between authentication and authorization?', options: ['They are the same thing', 'Authentication verifies identity; authorization controls access', 'Authorization verifies identity; authentication controls access', 'Authentication is for APIs; authorization is for UIs'], correctIndex: 1, explanation: 'Authentication confirms who you are; authorization determines what you are allowed to do.' },
    { id: 10, question: 'Which of the following best describes "technical debt"?', options: ['Money owed to software vendors', 'Cost of future rework caused by choosing a quick solution now', 'Hardware upgrade costs', 'Licensing fees for development tools'], correctIndex: 1, explanation: 'Technical debt is the implied cost of additional rework caused by choosing an easy short-term solution over a better long-term approach.' },
  ]
};

const MOCK_REMEDIATIONS = {
  default: `1. Review the module's core concepts from the beginning, focusing on definitions and terminology.
2. Re-read the topics covered in this module, paying attention to areas where your quiz answers were incorrect.
3. Search for beginner-friendly tutorials or videos on the specific topics you found challenging.
4. Practice by working through at least 2-3 exercises related to the weak areas identified.
5. Try explaining the concepts out loud (the Feynman technique) — if you can't explain it simply, study it more.
6. Retake the quiz after 24 hours of focused study to reinforce memory retention.`
};

/**
 * Returns a mock roadmap for a given interest and skill level.
 */
function getMockRoadmap(interest, skillLevel) {
  const template = INTEREST_ROADMAPS[interest] || INTEREST_ROADMAPS.default;

  // Adjust difficulty labels based on skill level
  const diffMap = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
  const baseDiff = diffMap[skillLevel] || 'Beginner';

  return {
    ...template,
    modules: template.modules.map((m, i) => ({
      ...m,
      difficulty: i < 2 ? 'Beginner' : i < 4 ? (baseDiff === 'Advanced' ? 'Intermediate' : baseDiff) : (baseDiff === 'Beginner' ? 'Intermediate' : baseDiff),
    })),
    _isFallback: true,
  };
}

/**
 * Returns mock quiz questions for a given topic.
 */
function getMockQuiz(topic) {
  return {
    topic,
    questions: MOCK_QUIZ_QUESTIONS.default,
    _isFallback: true,
  };
}

/**
 * Returns a mock remediation text.
 */
function getMockRemediation(topic) {
  return MOCK_REMEDIATIONS.default;
}

/**
 * Determines if an error should trigger the fallback.
 * Catches: 429 rate limit, 401 auth, 403 forbidden, 500 server, network timeouts.
 */
function shouldUseFallback(err) {
  if (!err) return false;
  const status = err.response?.status;
  if (status === 429 || status === 401 || status === 403 || status >= 500) return true;
  // Network error (ECONNRESET, ETIMEDOUT, ENOTFOUND, etc.)
  if (err.code && ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED', 'ERR_NETWORK'].includes(err.code)) return true;
  // Axios network error with no response
  if (err.message && /network|timeout|ECONNRESET|ETIMEDOUT/i.test(err.message)) return true;
  return true; // Default: always fallback on any unhandled AI error
}

module.exports = { getMockRoadmap, getMockQuiz, getMockRemediation, shouldUseFallback };
