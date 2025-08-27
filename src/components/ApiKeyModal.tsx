import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Key, Shield, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string, apiType: 'gemini' | 'openai') => void;
}

export const ApiKeyModal = ({ isOpen, onClose, onSave }: ApiKeyModalProps) => {
  const [apiKey, setApiKey] = useState('');
  const [apiType, setApiType] = useState<'gemini' | 'openai'>('gemini');

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim(), apiType);
      onClose();
    }
  };

  const getApiKeyUrl = () => {
    return apiType === 'gemini' 
      ? 'https://makersuite.google.com/app/apikey'
      : 'https://platform.openai.com/api-keys';
  };

  const getApiKeyLabel = () => {
    return apiType === 'gemini' ? 'Google Gemini API Key' : 'OpenAI API Key';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="gradient-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Key className="w-5 h-5" />
            AI API Key Required
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose your preferred AI provider and enter your API key to generate accurate, research-backed career roadmaps.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert className="border-warning/20 bg-warning/5">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Your API key will be stored locally in your browser and never sent to our servers.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiType" className="text-foreground">AI Provider</Label>
              <Select value={apiType} onValueChange={(value: 'gemini' | 'openai') => setApiType(value)}>
                <SelectTrigger className="bg-muted/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="gradient-card border-border/50">
                  <SelectItem value="gemini">Google Gemini (Recommended - Free tier available)</SelectItem>
                  <SelectItem value="openai">OpenAI GPT (Paid service)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-foreground">{getApiKeyLabel()}</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter your ${apiType === 'gemini' ? 'Gemini' : 'OpenAI'} API key...`}
                className="bg-muted/30 border-border/50"
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                Get your API key from{' '}
                <a 
                  href={getApiKeyUrl()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  {apiType === 'gemini' ? 'Google AI Studio' : 'OpenAI Platform'}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>

          <Alert className="border-primary/20 bg-primary/5">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Recommended:</strong> For better security, consider connecting to Supabase to store API keys securely.{' '}
              <a 
                href="https://docs.lovable.dev/integrations/supabase" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Learn more
              </a>
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!apiKey.trim()}>
              Save & Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};