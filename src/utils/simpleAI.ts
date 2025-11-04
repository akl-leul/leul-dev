import { searchContent, websiteContent, PageContent } from './contentIndexer';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ResponsePattern {
  patterns: RegExp[];
  responses: string[];
  action?: (query: string) => string;
}

const responsePatterns: ResponsePattern[] = [
  // Greetings
  {
    patterns: [/^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening))/i],
    responses: [
      "Hello! I'm your website assistant. How can I help you today?",
      "Hi there! I can help you find information about this portfolio website. What would you like to know?",
      "Hey! Feel free to ask me anything about the developer, projects, skills, or how to navigate the site."
    ]
  },
  
  // Who/About questions
  {
    patterns: [/who (is|are) (you|this|the developer|leul)/i, /tell me about (you|yourself|the developer|leul)/i],
    responses: [
      "I'm an AI assistant for this portfolio website. The developer is Leul Ayfokru, a full-stack developer from Ethiopia specializing in web and application development. Would you like to know more about their skills or projects?"
    ]
  },
  
  // Skills questions
  {
    patterns: [/what (skills|technologies|tech stack|languages|frameworks|tools)/i, /(know|use|work with) (react|javascript|python|typescript)/i],
    responses: [],
    action: () => {
      const skillsPage = websiteContent.find(p => p.path === '/skills');
      return `The developer has expertise in: JavaScript, TypeScript, Python, React, Next.js, Node.js, TailwindCSS, and more. They work with databases like PostgreSQL, MySQL, and Supabase. For the complete list with proficiency levels, visit the Skills page. ${skillsPage ? '\n\nSkills include: ' + skillsPage.keywords.slice(5).join(', ') : ''}`;
    }
  },
  
  // Projects questions
  {
    patterns: [/what (projects|work|portfolio)/i, /show me (projects|work|portfolio)/i, /(built|created|made) what/i],
    responses: [],
    action: () => {
      return "The developer has worked on various projects including web applications, mobile apps, and full-stack solutions. Each project showcases different technologies and skills. You can browse the complete portfolio on the Projects page, where you can filter by technology and view live demos or GitHub repositories.";
    }
  },
  
  // Experience questions
  {
    patterns: [/how (long|much) experience/i, /work (experience|history)/i, /years of experience/i],
    responses: [
      "The developer has several years of experience in web development, working with modern technologies and frameworks. For detailed work history, companies, and specific roles, please visit the About page where you can see the complete work experience timeline."
    ]
  },
  
  // Contact questions
  {
    patterns: [/how (to|can|do) (contact|reach|hire|email)/i, /contact (info|information|details)/i, /get in touch/i],
    responses: [],
    action: () => {
      return "You can contact the developer through the Contact page. There's a contact form available, or you can reach out via email. The developer is available for freelance projects, collaborations, and job opportunities. Response time is typically within 24-48 hours.";
    }
  },
  
  // Location questions
  {
    patterns: [/where (are you|is the developer|located)/i, /location/i, /based in/i],
    responses: [
      "The developer is based in Addis Ababa, Ethiopia. For more details about location and contact information, visit the Contact or About page."
    ]
  },
  
  // Blog questions
  {
    patterns: [/blog/i, /articles/i, /posts/i, /tutorials/i, /writing/i],
    responses: [
      "The developer writes blog posts covering web development topics, tutorials, best practices, and technology insights. You can read the latest articles on the Blog page, where posts are organized by date with reading time estimates."
    ]
  },
  
  // Navigation help
  {
    patterns: [/how to navigate/i, /find (page|section)/i, /where (is|can i find)/i],
    responses: [
      "The website has several main sections: Home (overview), About (biography and experience), Skills (technical expertise), Projects (portfolio), Blog (articles), and Contact (get in touch). Use the navigation menu at the top to browse these sections."
    ]
  },
  
  // Technology stack
  {
    patterns: [/what (is|powers|built) (this|the) (site|website)/i, /tech stack of (this|the) site/i],
    responses: [
      "This website is built with modern technologies including React, TypeScript, TailwindCSS, and Supabase for the backend. It showcases responsive design, smooth animations, and a clean user interface."
    ]
  },
  
  // Thanks
  {
    patterns: [/thank(s| you)/i, /appreciate/i],
    responses: [
      "You're welcome! Feel free to ask if you have more questions.",
      "Happy to help! Let me know if you need anything else.",
      "Glad I could assist! Don't hesitate to ask more questions."
    ]
  },
  
  // Goodbye
  {
    patterns: [/bye|goodbye|see you|exit|quit/i],
    responses: [
      "Goodbye! Feel free to come back anytime you have questions.",
      "See you later! Don't hesitate to return if you need help.",
      "Take care! I'm here whenever you need assistance."
    ]
  }
];

export async function generateAIResponse(userMessage: string, conversationHistory: ChatMessage[]): Promise<string> {
  const lowerMessage = userMessage.toLowerCase().trim();
  
  // Check response patterns first
  for (const pattern of responsePatterns) {
    for (const regex of pattern.patterns) {
      if (regex.test(lowerMessage)) {
        if (pattern.action) {
          return pattern.action(userMessage);
        }
        if (pattern.responses.length > 0) {
          return pattern.responses[Math.floor(Math.random() * pattern.responses.length)];
        }
      }
    }
  }
  
  // If no pattern matches, do content search
  const relevantPages = await searchContent(userMessage);
  
  if (relevantPages.length > 0) {
    const topPage = relevantPages[0];
    
    // Extract most relevant sentence from content
    const sentences = topPage.content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const relevantSentence = sentences.find(sentence => {
      const words = lowerMessage.split(/\s+/);
      return words.some(word => word.length > 3 && sentence.toLowerCase().includes(word));
    }) || sentences[0];
    
    let response = `Based on the ${topPage.title} page: ${relevantSentence}.`;
    
    if (relevantPages.length > 1) {
      response += ` You might also be interested in: ${relevantPages.slice(1, 3).map(p => p.title).join(', ')}.`;
    }
    
    response += ` Would you like to know more about anything specific?`;
    
    return response;
  }
  
  // Default fallback response
  const fallbackResponses = [
    "I'm not sure I understand that question. Could you try rephrasing it? I can help you with information about the developer's skills, projects, experience, or how to get in touch.",
    "I don't have specific information about that. However, I can tell you about the developer's background, technical skills, portfolio projects, or contact details. What would you like to know?",
    "That's an interesting question! While I may not have a direct answer, I can help you navigate the website to find: skills and technologies, project portfolio, work experience, or contact information. What interests you most?",
  ];
  
  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

// Function to get conversation context
export function getConversationSummary(messages: ChatMessage[]): string {
  const topics = new Set<string>();
  
  messages.forEach(msg => {
    if (msg.role === 'user') {
      const lower = msg.content.toLowerCase();
      if (/skill|tech|language|framework/i.test(lower)) topics.add('skills');
      if (/project|work|portfolio/i.test(lower)) topics.add('projects');
      if (/contact|email|hire/i.test(lower)) topics.add('contact');
      if (/experience|history|career/i.test(lower)) topics.add('experience');
      if (/about|who|bio/i.test(lower)) topics.add('about');
    }
  });
  
  return Array.from(topics).join(', ');
}
