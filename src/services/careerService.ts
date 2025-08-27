interface WebSearchResult {
  title: string;
  content: string;
  url: string;
}

interface RoadmapData {
  goal: string;
  overview: string;
  prerequisites: string[];
  stages: {
    title: string;
    skills: string[];
    resources: string[];
  }[];
  timeline: string;
  tips: {
    certifications: string[];
    communities: string[];
    trends: string[];
  };
}

export class CareerService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchWeb(query: string): Promise<WebSearchResult[]> {
    // Using DuckDuckGo Instant Answer API (no API key needed)
    try {
      const searchQueries = [
        `${query} career requirements skills certifications`,
        `${query} job requirements education degree`,
        `${query} salary trends hiring 2024`,
        `${query} professional development courses training`
      ];

      const results: WebSearchResult[] = [];
      
      for (const searchQuery of searchQueries) {
        try {
          const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json&no_html=1&skip_disambig=1`);
          const data = await response.json();
          
          if (data.AbstractText) {
            results.push({
              title: data.Heading || 'Career Information',
              content: data.AbstractText,
              url: data.AbstractURL || ''
            });
          }
        } catch (error) {
          console.log(`Search failed for query: ${searchQuery}`);
        }
      }

      return results;
    } catch (error) {
      console.error('Web search failed:', error);
      return [];
    }
  }

  async generateRoadmapWithAI(career: string, searchResults: WebSearchResult[], apiKey: string, apiType: 'gemini' | 'openai' = 'gemini'): Promise<RoadmapData> {
    const searchContext = searchResults.map(result => 
      `Title: ${result.title}\nContent: ${result.content}\nURL: ${result.url}`
    ).join('\n\n---\n\n');

    const prompt = `You are a Career Roadmap Generator AI. Based on the provided web search results and your knowledge, create a comprehensive career roadmap for: "${career}".

Web Search Context:
${searchContext}

Please structure your response as a JSON object with this exact format:
{
  "goal": "${career}",
  "overview": "A concise description of the career and its current market relevance (2-3 sentences)",
  "prerequisites": ["List 3-5 specific background requirements or foundational skills"],
  "stages": [
    {
      "title": "Foundation (Months 1-X)",
      "skills": ["Specific technical/soft skills for this stage"],
      "resources": ["Actual course names, certifications, or learning platforms"]
    },
    {
      "title": "Intermediate (Months X-Y)",
      "skills": ["More advanced skills"],
      "resources": ["Specific intermediate resources and certifications"]
    },
    {
      "title": "Advanced (Months Y-Z)",
      "skills": ["Expert-level skills and specializations"],
      "resources": ["Advanced certifications, degree requirements"]
    },
    {
      "title": "Professional (Month Z+)",
      "skills": ["Industry networking and career advancement"],
      "resources": ["Professional networking, job search strategies"]
    }
  ],
  "timeline": "Realistic timeline estimate (e.g., '18-24 months for entry-level proficiency')",
  "tips": {
    "certifications": ["List 3-5 ACTUAL certification names that are valuable for this career"],
    "communities": ["List 3-5 REAL professional communities, associations, or forums"],
    "trends": ["List 3-5 current industry trends affecting this career in 2024"]
  }
}

Requirements:
- Use REAL, SPECIFIC information (actual certification names, real courses, existing communities)
- Base recommendations on current 2024 industry standards
- Include specific degree requirements if applicable
- Mention actual companies hiring for this role
- Provide realistic salary expectations if relevant
- Focus on actionable, current information

Respond ONLY with the JSON object, no additional text.`;

    try {
      let response;
      
      console.log(`Making ${apiType.toUpperCase()} API call for career: ${career}`);
      
      if (apiType === 'gemini') {
        // Updated Gemini API endpoint
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.3,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            }
          })
        });
      } else {
        // OpenAI API
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{
              role: 'user',
              content: prompt
            }],
            temperature: 0.3,
            max_tokens: 2048,
          })
        });
      }

      console.log(`API Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response Error:', errorText);
        throw new Error(`${apiType.toUpperCase()} API error: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      let generatedText;
      
      if (apiType === 'gemini') {
        generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      } else {
        generatedText = data.choices?.[0]?.message?.content;
      }
      
      if (!generatedText) {
        throw new Error(`No content generated from ${apiType.toUpperCase()} API`);
      }

      console.log('Generated text:', generatedText);

      // Parse the JSON response with better error handling
      let jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // Try to find JSON even if it's not the whole response
        const lines = generatedText.split('\n');
        let jsonStart = -1, jsonEnd = -1;
        let braceCount = 0;
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('{') && jsonStart === -1) {
            jsonStart = i;
            braceCount = 1;
          } else if (jsonStart !== -1) {
            braceCount += (lines[i].match(/\{/g) || []).length;
            braceCount -= (lines[i].match(/\}/g) || []).length;
            if (braceCount === 0) {
              jsonEnd = i;
              break;
            }
          }
        }
        
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonText = lines.slice(jsonStart, jsonEnd + 1).join('\n');
          jsonMatch = [jsonText];
        }
      }
      
      if (!jsonMatch) {
        console.error('No valid JSON found in response:', generatedText);
        throw new Error(`No valid JSON found in ${apiType.toUpperCase()} response`);
      }

      try {
        const roadmapData = JSON.parse(jsonMatch[0]);
        console.log('Parsed roadmap data:', roadmapData);
        return roadmapData;
      } catch (parseError) {
        console.error('JSON Parse error:', parseError);
        console.error('Attempted to parse:', jsonMatch[0]);
        throw new Error('Failed to parse AI response as JSON');
      }

    } catch (error) {
      console.error(`${apiType.toUpperCase()} API call failed:`, error);
      throw error;
    }
  }

  async generateCareerRoadmap(career: string, apiType: 'gemini' | 'openai' = 'gemini'): Promise<RoadmapData> {
    // First, search the web for current information
    const searchResults = await this.searchWeb(career);
    
    // Then use AI to process and structure the information
    try {
      const roadmapData = await this.generateRoadmapWithAI(career, searchResults, this.apiKey, apiType);
      return roadmapData;
    } catch (error) {
      // If AI fails, create a structured roadmap from search results
      console.log('AI generation failed, creating structured roadmap from search results');
      return this.createFallbackRoadmap(career, searchResults);
    }
  }

  private createFallbackRoadmap(career: string, searchResults: WebSearchResult[]): RoadmapData {
    // Create a structured roadmap even without AI
    return {
      goal: career,
      overview: `${career} is a growing field with diverse opportunities. This roadmap provides a structured path based on current industry standards and requirements.`,
      prerequisites: [
        'Strong analytical and problem-solving skills',
        'Relevant educational background or willingness to learn',
        'Good communication and teamwork abilities',
        'Continuous learning mindset'
      ],
      stages: [
        {
          title: 'Foundation (Months 1-6)',
          skills: ['Basic industry knowledge', 'Core technical skills', 'Professional communication'],
          resources: ['Online courses', 'Industry publications', 'Entry-level certifications']
        },
        {
          title: 'Intermediate (Months 6-12)',
          skills: ['Advanced technical skills', 'Project management', 'Specialized tools'],
          resources: ['Professional courses', 'Industry conferences', 'Networking events']
        },
        {
          title: 'Advanced (Months 12-18)',
          skills: ['Expert-level competencies', 'Leadership skills', 'Strategic thinking'],
          resources: ['Advanced certifications', 'Mentorship programs', 'Professional associations']
        },
        {
          title: 'Professional (Month 18+)',
          skills: ['Industry leadership', 'Innovation', 'Team management'],
          resources: ['Senior-level roles', 'Industry speaking', 'Thought leadership']
        }
      ],
      timeline: '18-24 months for career readiness, with continuous growth thereafter',
      tips: {
        certifications: ['Industry-standard certifications', 'Professional development courses', 'Specialized training programs'],
        communities: ['Professional associations', 'Online communities', 'Local meetups and events'],
        trends: ['Digital transformation', 'Remote work adaptation', 'Continuous skill development']
      }
    };
  }
}