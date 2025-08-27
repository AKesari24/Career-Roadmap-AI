import { CareerGenerator } from '@/components/CareerGenerator';
import heroImage from '@/assets/career-hero.jpg';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Career roadmap visualization" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-background/80"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative container mx-auto px-4 text-center space-y-8">
          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent leading-tight">
              Career Roadmap Generator
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Get personalized, research-backed career roadmaps powered by real-time industry data and AI insights
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 pt-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>Current Industry Data</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>AI-Powered Insights</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-2 h-2 bg-warning rounded-full"></div>
                <span>Actionable Steps</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <CareerGenerator />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Powered by real-time web search and AI • Built for ambitious career builders(Built by Aditya Kesari)
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;