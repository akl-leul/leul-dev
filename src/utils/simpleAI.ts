import { searchContent, websiteContent, PageContent } from './contentIndexer';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ResponsePattern {
  patterns: RegExp[];
  responses: string[];
  action?: (query: string, context?: string) => Promise<string> | string;
}

// Helper to format lists for better readability with breaks
const formatList = (items: string[]): string => {
  return items.map(item => `* ${item}`).join('\n\n');
};

// Helper to clean up common typing/grammar issues in DB content
const cleanDataText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\bbuild\b/gi, 'built') // Fix tense
    .replace(/\binformations\b/gi, 'information') // Fix pluralization
    .replace(/\s+\*\*/g, ' **') // Fix spacing around bold
    .replace(/\*\*\s+/g, '** ')
    .trim();
};

// Detect the current topic based on history
function detectContext(history: ChatMessage[]): string {
  if (!history || history.length === 0) return '';

  const recentMessages = [...history].slice(-4).reverse();
  for (const msg of recentMessages) {
    const text = msg.content.toLowerCase();
    if (/\b(project|portfolio|built|made|work|app|website)\b/i.test(text)) return 'projects';
    if (/\b(skill|tech|language|framework|expertise|know|proficiency)\b/i.test(text)) return 'skills';
    if (/\b(experience|work|history|career|job|previous|company|role)\b/i.test(text)) return 'experience';
    if (/\b(blog|article|post|write|read|insight)\b/i.test(text)) return 'blog';
    if (/\b(contact|reach|email|hire|call|phone|location|where)\b/i.test(text)) return 'contact';
    if (/\b(help|support|how to|guide|documentation|usage)\b/i.test(text)) return 'help';
    if (/\b(price|cost|plan|billing|money|pay|amount)\b/i.test(text)) return 'pricing';
    if (/\b(service|feature|offer|capability|provide)\b/i.test(text)) return 'services';
  }
  return '';
}

// Universal database search across multiple descriptive tables
async function universalDbSearch(query: string): Promise<string[]> {
  const cleanQuery = query.toLowerCase().trim();
  const terms = cleanQuery.split(/\s+/).filter(t => t.length > 2); // Reduced from 3 to 2
  if (terms.length === 0) return [];

  const results: string[] = [];

  try {
    // 1. Search Help Articles
    const { data: helpArticles } = await supabase.from('help_articles').select('title, content').eq('active', true);
    if (helpArticles) {
      helpArticles.filter(art =>
        art.title.toLowerCase().includes(cleanQuery) ||
        terms.some(t => art.title.toLowerCase().includes(t)) ||
        terms.some(t => art.content.toLowerCase().includes(t))
      ).forEach(art => results.push(`### 📚 Help: ${art.title}\n\n${art.content.slice(0, 150)}...`));
    }

    // 2. Search Features/Services
    const { data: features } = await supabase.from('features').select('title, description').eq('active', true);
    if (features) {
      features.filter(f =>
        f.title.toLowerCase().includes(cleanQuery) ||
        terms.some(t => f.title.toLowerCase().includes(t)) ||
        terms.some(t => f.description.toLowerCase().includes(t))
      ).forEach(f => results.push(`### 🛠️ Service: ${f.title}\n\n${f.description}`));
    }

    // 3. Search Pricing
    const { data: plans } = await supabase.from('pricing_plans').select('name, price, description').eq('active', true);
    if (plans) {
      plans.filter(p =>
        p.name.toLowerCase().includes(cleanQuery) ||
        terms.some(t => p.name.toLowerCase().includes(t))
      ).forEach(p => results.push(`### 💰 Pricing: ${p.name}\n**Price:** $${p.price}\n${p.description}`));
    }

    // 4. Search Job Postings
    const { data: jobs } = await supabase.from('job_postings').select('title, department').eq('active', true);
    if (jobs) {
      jobs.filter(j =>
        j.title.toLowerCase().includes(cleanQuery) ||
        terms.some(t => j.title.toLowerCase().includes(t))
      ).forEach(j => results.push(`### 💼 Job Opening: ${j.title}\n**Department:** ${j.department}`));
    }
  } catch (error) {
    console.error("Universal search error:", error);
  }

  return results.slice(0, 3); // Limit to top 3 results
}

const responsePatterns: ResponsePattern[] = [
  // Greetings
  {
    patterns: [/^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening))/i, /\b(hi|hello|hey)\b/i],
    responses: [
      "Hello! 👋 I'm your website assistant. How can I help you today?",
      "Hi there! 😊 I can help you find information about Leul's work, projects, or skills. What's on your mind?",
      "Hey! 🚀 I'm here to help you navigate Leul's portfolio. Ask me anything about his experience or projects!"
    ]
  },

  // Who/About questions
  {
    patterns: [
      /who (is|are) (you|this|the developer|leul)/i,
      /tell me about (you|yourself|the developer|leul)/i,
      /\b(bio|background|identity|about)\b/i,
      /your name/i
    ],
    responses: [],
    action: async () => {
      const { data: aboutData } = await supabase.from('about_content').select('*').limit(1).single();
      if (aboutData) {
        return `### 👨‍💻 About Leul Ayfokru\n\n${aboutData.intro || "Leul is a passionate full-stack developer. 🌟"}\n\n${aboutData.bio || ""}\n\n---\n*Would you like to hear about his skills or see some projects? 🧐*`;
      }
      return "Leul Ayfokru is a full-stack developer 👨‍💻 from Ethiopia specializing in web and application development. He builds scalable, efficient solutions using modern tech stacks. 🚀";
    }
  },

  // Bot Info & Capabilities
  {
    patterns: [
      /\b(what are you|who are you|how can you help|what do you do|help me|what can I ask)\b/i,
      /you do/i,
      /your name/i
    ],
    responses: [
      "I'm Leul's AI Assistant! 🤖 I can help you find his **projects**, check his **skills**, read his **blog**, or even get his **contact info**. What can I help you discover today? ✨",
      "I'm here to guide you through Leul's portfolio! 🚀 You can ask me things like 'Show me your projects', 'What is your tech stack?', or 'How can I contact you?'. I'm also great at giving context about his education and career! 📚",
      "Think of me as a digital bridge to Leul's work. 🌉 Ask me about his apps, his experience, or even his latest articles. I can also help you with pricing and service details! 💰"
    ]
  },

  // Skills questions
  {
    patterns: [
      /\b(skills|technologies|tech stack|languages|frameworks|tools|expertise|stack)\b/i,
      /(know|use|work with) (react|javascript|python|typescript|node|database)/i,
      /what can you do/i
    ],
    responses: [],
    action: async (query) => {
      const { data: skills } = await supabase.from('skills').select('name, level, category').order('category');

      if (skills && skills.length > 0) {
        const lowerQuery = query.toLowerCase();
        const specificSkill = skills.find(s => lowerQuery.includes(s.name.toLowerCase()));
        const categories = [...new Set(skills.map(s => s.category))];

        let response = specificSkill
          ? `Yes! ✅ Leul is highly proficient in **${specificSkill.name}** (${specificSkill.level}).\n\n### ⚡ Technical Expertise\n\n`
          : "### ⚡ Technical Expertise\n\nLeul has a diverse set of technical skills: 🛠️\n\n";

        const categoryEmojis: Record<string, string> = {
          'Backend/ORM/Database': '🗄️',
          'design': '🎨',
          'language': '💻',
          'technical': '🛠️'
        };

        categories.forEach(cat => {
          const emoji = categoryEmojis[cat] || '✨';
          const catSkills = skills.filter(s => s.category === cat)
            .map(s => `• **${s.name}** (${s.level})`)
            .join('\n\n');
          response += `#### ${emoji} ${cat}\n\n${catSkills}\n\n`;
        });

        response += "---\n*Would you like to see projects where he applied these technologies? 🎨*";
        return response;
      }
      return "Leul specializes in modern web tech like React, TypeScript, and Node.js. 💻 He also works with Supabase and various databases. 🗄️";
    }
  },

  // Experience questions
  {
    patterns: [
      /\b(experience|history|career|previous|worked|background|years)\b/i,
      /work experience/i,
      /career path/i,
      /how (long|much) experience/i,
      /where (did|has) (he|leul) worked/i
    ],
    responses: [],
    action: async () => {
      const { data: experiences } = await supabase.from('experiences')
        .select('company, role, location, description, start_date, end_date, current')
        .order('start_date', { ascending: false });

      if (experiences && experiences.length > 0) {
        let response = "### 📈 Professional Experience\n\nLeul's career journey: 💼\n\n\n\n";
        experiences.forEach(exp => {
          const startDate = new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          const endDate = exp.current ? 'Present' : exp.end_date ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';

          response += `#### 🏢 **${cleanDataText(exp.role)}** at **${cleanDataText(exp.company)}**\n\n`;
          response += `📍 *${exp.location || 'Remote'}* | 📅 *${startDate} - ${endDate}*\n\n`;
          if (exp.description) response += `${cleanDataText(exp.description)}\n\n`;
          response += `\n---\n\n\n\n`;
        });
        response += "\nDetailed project descriptions are available on the [About Page](/about). Should I tell you about his skills instead? 🏹";
        return response;
      }

      return "Leul has over 5 years of experience in the industry, building scalable software solutions. 🚀 You can see the full timeline on the [About Page](/about).";
    }
  },

  // Projects questions
  {
    patterns: [
      /\b(projects|portfolio|built|made|created|apps|websites)\b/i,
      /show me (projects|portfolio)/i,
      /what (have you|has leul) (built|made|created)/i
    ],
    responses: [],
    action: async (query, context) => {
      const { data: projects } = await supabase.from('projects')
        .select('id, title, description, tech_stack, demo_url, github_url')
        .order('created_at', { ascending: false });

      if (projects && projects.length > 0) {
        let response = "### 🚀 Leul's Portfolio Projects\n\n";

        projects.forEach(p => {
          response += `#### ✨ [${cleanDataText(p.title)}](/projects/${p.id})\n\n`;

          response += `${cleanDataText(p.description)}\n\n`;

          if (p.tech_stack && p.tech_stack.length > 0) {
            response += `**🛠️ Tech Stack:**\n${p.tech_stack.join(', ')}\n\n`;
          }

          response += `📂 [View Details](/projects/${p.id})\n\n`;

          if (p.demo_url || p.github_url) {
            if (p.demo_url) response += `🔗 [Live Demo](${p.demo_url}) &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; `;
            if (p.github_url) response += `💻 [Source Code](${p.github_url})`;
            response += `\n\n`;
          }

          response += `\n\n---\n\n\n\n\n\n\n`;
        });

        response += "You can see all of these on the [Projects Page](/projects).\n\nWould you like to know more about a specific one? 🧐";
        return response;
      }

      return "I couldn't find any projects in the database right now. 😔 However, Leul is always building new things! \n\n You can check back later or view his skills in the meantime. 🛠️";
    }
  },

  // Services / Features
  {
    patterns: [
      /\b(services|offer|features|capabilities|can you do|provide)\b/i,
      /what (do you|can you) (do|offer)/i
    ],
    responses: [],
    action: async () => {
      const { data: features } = await supabase.from('features').select('title, description').eq('active', true);
      if (features && features.length > 0) {
        let response = "### 🛠️ Specialized Services\n\nLeul offers a variety of specialized services: ✨\n\n";
        features.forEach(f => {
          response += `* **${f.title}**: ${f.description}\n`;
        });
        response += "\n---\n*Would any of these be helpful for your project? 🤝*";
        return response;
      }
      return "Leul specializes in full-stack web development, mobile app creation, and UI/UX design. 🎨 What are you looking for help with? 🤔";
    }
  },

  // Help / Support
  {
    patterns: [
      /\b(help|support|how to|guide|documentation|assistance|questions)\b/i,
      /how do i/i
    ],
    responses: [],
    action: async () => {
      const { data: help } = await supabase.from('help_articles').select('title, content').eq('active', true).limit(3);
      if (help && help.length > 0) {
        let response = "### 📚 Help & Support\n\nI found some helpful articles that might assist you: 💡\n\n";
        help.forEach(h => {
          response += `#### 📖 ${h.title}\n${h.content.slice(0, 150)}...\n\n`;
        });
        response += "---\n*Do you need more specific help with any of these? 🙋‍♂️*";
        return response;
      }
      return "I can help you navigate the site or answer questions about Leul's work. ❓ What do you need assistance with? 😊";
    }
  },

  // Jobs / Careers
  {
    patterns: [
      /\b(job|career|hiring|work with|opportunity|vacancy|openings|positions)\b/i,
      /are you hiring/i
    ],
    responses: [],
    action: async () => {
      const { data: jobs } = await supabase.from('job_postings').select('title, department, location').eq('active', true);
      if (jobs && jobs.length > 0) {
        let response = "### 💼 Opportunities\n\nThere are currently open opportunities to work with Leul's team: 🚀\n\n";
        jobs.forEach(j => {
          response += `* **${j.title}**\n  *Department:* ${j.department} | *Location:* ${j.location}\n\n`;
        });
        response += "---\n*You can apply through the Careers page. Are you interested in a specific role? 📝*";
        return response;
      }
      return "Leul is always open to collaborations and freelance projects! 🤝 Reach out through the **Contact** page if you have something in mind. ✨";
    }
  },

  // Pricing
  {
    patterns: [
      /\b(price|cost|plan|billing|money|pay|amount|budget|how much)\b/i,
      /what are your rates/i
    ],
    responses: [],
    action: async () => {
      const { data: plans } = await supabase.from('pricing_plans').select('name, price, description').eq('active', true).order('price');
      if (plans && plans.length > 0) {
        let response = "### 💰 Service Plans\n\nHere are the available service plans: 🏷️\n\n";
        plans.forEach(p => {
          response += `#### 💵 ${p.name}\n**Price:** $${p.price}\n${p.description}\n\n`;
        });
        response += "---\n*Would you like to discuss a custom quote for your needs? 📞*";
        return response;
      }
      return "Pricing varies based on project complexity. 📊 For a detailed quote, please reach out via the **Contact** form! 📩";
    }
  },

  // Contact questions
  {
    patterns: [
      /\b(contact|reach|hire|email|phone|call|message|social|linkedin|github)\b/i,
      /get in touch/i
    ],
    responses: [],
    action: async () => {
      const { data: contact } = await supabase.from('contact_content').select('*').limit(1).single();

      if (contact) {
        let response = `### 📞 Get in Touch\n\nYou can reach Leul via: ✉️\n\n`;
        if (contact.email) response += `* **📧 Email:** [${contact.email}](mailto:${contact.email})\n`;
        if (contact.phone) response += `* **📞 Phone:** [${contact.phone}](tel:${contact.phone})\n`;
        if (contact.location) response += `* **📍 Location:** ${contact.location}\n`;

        response += "\n---\n*Feel free to [send a message directly](/contact)! Would you like to know more about his experience? 📈*";
        return response;
      }

      return "You can reach Leul through the [Contact Page](/contact). 📩 He's usually very responsive! ⚡";
    }
  },

  // Blog questions
  {
    patterns: [
      /\b(blog|article|post|writing|read|insights|news)\b/i
    ],
    responses: [],
    action: async () => {
      const { data: posts } = await supabase.from('posts')
        .select('title, excerpt, slug, published_at')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(3);

      if (posts && posts.length > 0) {
        let response = "### ✍️ Latest from the Blog\n\nInsights and updates from Leul's tech journey: 💡\n\n\n\n";
        posts.forEach(post => {
          const date = post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently';

          response += `#### 📝 [${cleanDataText(post.title)}](/blog/${post.slug})\n\n`;
          response += `📅 *Published on ${date}*\n\n`;
          response += `${cleanDataText(post.excerpt)}\n\n`;
          response += `📖 [Read full article](/blog/${post.slug})\n\n`;
          response += `\n---\n\n\n\n`;
        });
        response += "Check out the [Full Blog](/blog) for more articles! 🧐";
        return response;
      }

      return "Leul writes regularly about tech. ✍️ You can find all his articles on the [Blog Page](/blog). 📖";
    }
  },

  // Thanks & Extras
  {
    patterns: [/\b(thank|thanks|appreciated|cool|nice|awesome|great|good|wow)\b/i],
    responses: [
      "You're very welcome! 😊 I've enjoyed our conversation. Anything else I can help with? ✨",
      "Happy to help! 🌟 We've covered quite a bit, is there anything specific left to explore? 🧐",
      "Glad I could be of assistance! 🙌 Feel free to keep the questions coming. 🚀"
    ]
  },

  // Goodbye
  {
    patterns: [/\b(bye|goodbye|see you|exit|quit|stop|done)\b/i],
    responses: [
      "Goodbye! 👋 It was great chatting with you about Leul's portfolio. Come back anytime! ✨",
      "See you later! 😊 I'll be here if you have more questions. 🚀",
      "Take care! 🙌 Hope you found exactly what you were looking for. 🌟"
    ]
  }
];

export async function generateAIResponse(userMessage: string, conversationHistory: ChatMessage[]): Promise<string> {
  const lowerMessage = userMessage.toLowerCase().trim();
  const context = detectContext(conversationHistory);

  // 1. Handle Continuous Conversation (Vague Follow-ups)
  const isFollowUp = /^(tell me more|show me more|what else|go on|continue|elaborate|more|next)\b/i.test(lowerMessage);
  const isConfirmation = /^(yes|sure|ok|okay|yep|yeah|definitely|absolutely|go ahead|y|up)\b/i.test(lowerMessage);

  if ((isFollowUp || isConfirmation) && context) {
    // Determine the action based on context and what the user is agreeing to
    let targetContext = context;

    // Logic for "Yes" to specific prompts
    if (isConfirmation) {
      if (context === 'skills') targetContext = 'projects'; // Agreed to see projects from skills prompt
      if (context === 'experience') targetContext = 'skills'; // Suggest skills after experience
      if (context === 'projects') targetContext = 'contact'; // Suggest contact after projects
    }

    const followUpAction = responsePatterns.find(p => {
      if (targetContext === 'projects') return p.patterns.some(reg => reg.test('projects'));
      if (targetContext === 'skills') return p.patterns.some(reg => reg.test('skills'));
      if (targetContext === 'experience') return p.patterns.some(reg => reg.test('experience'));
      if (targetContext === 'blog') return p.patterns.some(reg => reg.test('blog'));
      if (targetContext === 'pricing') return p.patterns.some(reg => reg.test('price'));
      if (targetContext === 'contact') return p.patterns.some(reg => reg.test('contact'));
      return false;
    });

    if (followUpAction?.action) {
      return await followUpAction.action(userMessage, targetContext);
    }
  }

  // 2. Check specific response patterns (standard matching)
  for (const pattern of responsePatterns) {
    for (const regex of pattern.patterns) {
      if (regex.test(lowerMessage)) {
        if (pattern.action) {
          return await pattern.action(userMessage, context);
        }
        if (pattern.responses.length > 0) {
          return pattern.responses[Math.floor(Math.random() * pattern.responses.length)];
        }
      }
    }
  }

  // 2. Perform a Universal Database Search for keywords
  const dbSearchResults = await universalDbSearch(userMessage);
  if (dbSearchResults.length > 0) {
    return `### 🔍 Match Found\n\nI found some relevant information in the database for "**${userMessage}**": ✨\n\n${dbSearchResults.join('\n\n')}\n\n---\n*Does this help? I can also tell you about Leul's [projects](/projects) or [skills](/skills).*`;
  }

  // 3. Fallback to Content Search (static content + dynamic pages)
  const relevantPages = await searchContent(userMessage);
  if (relevantPages && relevantPages.length > 0) {
    const topPage = relevantPages[0];
    // Extract a more substantial snippet (up to 3 sentences)
    const sentences = topPage.content.split(/[.!?]+/).filter(s => s.trim().length > 15);
    const contextSnippet = sentences.slice(0, 3).join('. ').trim();

    return `### 📄 About: ${topPage.title}\n\n${cleanDataText(contextSnippet)}.\n\n---\n*You can explore more on the [${topPage.title}](${topPage.path}) page. Anything else you'd like to know? 🧐*`;
  }

  // 4. Detailed Default Fallback (The "Catch-All" for random things)
  return `### 🤖 I'm here to help!\n\nI couldn't find a direct match for "**${userMessage}**", but I can tell you all about Leul! 🚀\n\nLeul is a **Fullstack Web & Mobile Developer** who specializes in building high-performance applications with **React, Node.js, and Supabase**. 💻\n\n**What would you like to see?**\n* � **[Recent Projects](/projects)** - High-quality web and mobile apps.\n* �️ **[Technical Skills](/skills)** - Frontend, Backend, and Design expertise.\n* 📈 **[Experience](/about)** - His professional journey and career path.\n* ✍️ **[Blog Posts](/blog)** - Recent insights and technical articles.\n\n*Or ask me something specific, like "Tell me about your pharmacy project" or "What design tools do you use?"* ✨`;
}

// Keep the context aggregator for summary needs
export function getConversationSummary(messages: ChatMessage[]): string {
  if (!messages) return '';
  const topics = new Set<string>();
  messages.forEach(msg => {
    if (msg.role === 'user') {
      const lower = msg.content.toLowerCase();
      if (/\b(skill|tech|language|framework|code)\b/i.test(lower)) topics.add('skills');
      if (/\b(project|work|portfolio|app|website)\b/i.test(lower)) topics.add('projects');
      if (/\b(contact|email|hire|reach)\b/i.test(lower)) topics.add('contact');
      if (/\b(experience|history|career|job)\b/i.test(lower)) topics.add('experience');
      if (/\b(about|who|bio|leul)\b/i.test(lower)) topics.add('about');
      if (/\b(help|support|how|guide)\b/i.test(lower)) topics.add('help');
      if (/\b(price|billing|plan|cost)\b/i.test(lower)) topics.add('pricing');
    }
  });
  return Array.from(topics).join(', ');
}
