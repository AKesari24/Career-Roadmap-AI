import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Target, Clock, Lightbulb, CheckCircle, ArrowRight, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ApiKeyModal } from './ApiKeyModal';
import { CareerService } from '@/services/careerService';

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

export const CareerGenerator = () => {
  const [careerGoal, setCareerGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedApiKey = localStorage.getItem('ai_api_key');
    setHasApiKey(!!storedApiKey);
  }, []);

  const handleApiKeySave = (apiKey: string, apiType: 'gemini' | 'openai') => {
    localStorage.setItem('ai_api_key', apiKey);
    localStorage.setItem('ai_api_type', apiType);
    setHasApiKey(true);
    toast({
      title: "API Key saved",
      description: `You can now generate accurate career roadmaps with ${apiType === 'gemini' ? 'Gemini' : 'OpenAI'}!`,
    });
  };

  const clearApiKey = () => {
    localStorage.removeItem('ai_api_key');
    localStorage.removeItem('ai_api_type');
    setHasApiKey(false);
    setRoadmapData(null);
  };

  const generateRoadmap = async () => {
    if (!careerGoal.trim()) {
      toast({
        title: "Enter a career goal",
        description: "Please enter the career you want to explore",
        variant: "destructive"
      });
      return;
    }

    const storedApiKey = localStorage.getItem('ai_api_key');
    const storedApiType = (localStorage.getItem('ai_api_type') as 'gemini' | 'openai') || 'gemini';
    
    if (!storedApiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setIsLoading(true);
    
    try {
      const careerService = new CareerService(storedApiKey);
      const data = await careerService.generateCareerRoadmap(careerGoal, storedApiType);
      setRoadmapData(data);
      
      toast({
        title: "Roadmap generated!",
        description: "Your personalized career roadmap is ready.",
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Unable to generate roadmap. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* API Key Modal */}
      <ApiKeyModal 
        isOpen={showApiKeyModal} 
        onClose={() => setShowApiKeyModal(false)} 
        onSave={handleApiKeySave} 
      />

      {/* Search Section */}
      <Card className="gradient-card border-border/50 p-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Generate Your Career Roadmap</h2>
            <p className="text-muted-foreground">Enter any career goal to get a personalized, research-backed roadmap</p>
            {hasApiKey && (
              <div className="flex items-center justify-center gap-2 text-success text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>AI-powered generation ready</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearApiKey}
                  className="text-muted-foreground hover:text-foreground ml-2"
                >
                  <Settings className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex gap-4 max-w-2xl mx-auto">
            <div className="flex-1">
              <Input
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                placeholder="e.g., Data Scientist, UI/UX Designer, Cybersecurity Analyst..."
                className="bg-muted/30 border-border/50 text-foreground placeholder:text-muted-foreground"
                onKeyPress={(e) => e.key === 'Enter' && generateRoadmap()}
              />
            </div>
            <Button 
              onClick={generateRoadmap}
              disabled={isLoading}
              variant="default"
              className="bg-primary hover:bg-primary/90 shadow-glow transition-smooth"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {hasApiKey ? 'Researching...' : 'Generate'}
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Results Section */}
      {roadmapData && (
        <div className="space-y-6">
          {/* Header */}
          <Card className="gradient-card border-border/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">Career Goal: {roadmapData.goal}</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">{roadmapData.overview}</p>
          </Card>

          {/* Prerequisites */}
          <Card className="gradient-card border-border/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-5 h-5 text-success" />
              <h4 className="text-xl font-semibold text-foreground">Prerequisites</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roadmapData.prerequisites.map((prereq, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-muted-foreground">{prereq}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Roadmap Stages */}
          <Card className="gradient-card border-border/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <ArrowRight className="w-5 h-5 text-primary" />
              <h4 className="text-xl font-semibold text-foreground">Step-by-Step Roadmap</h4>
            </div>
            <div className="space-y-6">
              {roadmapData.stages.map((stage, index) => (
                <div key={index} className="relative">
                  {index < roadmapData.stages.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-border"></div>
                  )}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30">
                      <span className="text-primary font-semibold">{index + 1}</span>
                    </div>
                    <div className="flex-1 space-y-3">
                      <h5 className="text-lg font-semibold text-foreground">{stage.title}</h5>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Key Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {stage.skills.map((skill, skillIndex) => (
                            <Badge key={skillIndex} variant="secondary" className="bg-muted/50">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Resources:</p>
                        <div className="flex flex-wrap gap-2">
                          {stage.resources.map((resource, resourceIndex) => (
                            <Badge key={resourceIndex} variant="outline" className="border-border/50">
                              {resource}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Timeline & Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="gradient-card border-border/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-warning" />
                <h4 className="text-lg font-semibold text-foreground">Timeline Estimate</h4>
              </div>
              <p className="text-muted-foreground">{roadmapData.timeline}</p>
            </Card>

            <Card className="gradient-card border-border/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-5 h-5 text-primary" />
                <h4 className="text-lg font-semibold text-foreground">Extra Tips</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Top Certifications:</p>
                  <div className="flex flex-wrap gap-1">
                    {roadmapData.tips.certifications.slice(0, 2).map((cert, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-muted/30">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Communities:</p>
                  <div className="flex flex-wrap gap-1">
                    {roadmapData.tips.communities.slice(0, 2).map((community, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-border/30">
                        {community}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};