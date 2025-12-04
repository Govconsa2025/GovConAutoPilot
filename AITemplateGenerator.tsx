import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AITemplateGeneratorProps {
  onTemplateGenerated: (template: string, metadata: any) => void;
}

export function AITemplateGenerator({ onTemplateGenerated }: AITemplateGeneratorProps) {
  const [description, setDescription] = useState('');
  const [templateType, setTemplateType] = useState('');
  const [contractType, setContractType] = useState('');
  const [agency, setAgency] = useState('');
  const [includeBoilerplate, setIncludeBoilerplate] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!description || !templateType) {
      toast.error('Please provide a description and template type');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-template', {
        body: {
          description,
          templateType,
          contractType,
          agency,
          includeBoilerplate
        }
      });

      if (error) throw error;

      if (data?.template) {
        onTemplateGenerated(data.template, data.metadata);
        toast.success('Template generated successfully!');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate template');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Template Generator
        </CardTitle>
        <CardDescription>
          Generate professional templates using AI based on government contracting best practices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Template Description</Label>
          <Textarea
            placeholder="Describe what you need... e.g., 'Technical proposal for IT modernization project with cloud migration'"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Template Type</Label>
            <Select value={templateType} onValueChange={setTemplateType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rfp_response">RFP Response</SelectItem>
                <SelectItem value="cover_letter">Cover Letter</SelectItem>
                <SelectItem value="technical_proposal">Technical Proposal</SelectItem>
                <SelectItem value="past_performance">Past Performance</SelectItem>
                <SelectItem value="capability_statement">Capability Statement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Contract Type</Label>
            <Input
              placeholder="e.g., FFP, T&M, IDIQ"
              value={contractType}
              onChange={(e) => setContractType(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Target Agency</Label>
          <Input
            placeholder="e.g., DoD, VA, GSA"
            value={agency}
            onChange={(e) => setAgency(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="boilerplate"
            checked={includeBoilerplate}
            onCheckedChange={(checked) => setIncludeBoilerplate(checked as boolean)}
          />
          <Label htmlFor="boilerplate" className="text-sm font-normal">
            Include standard boilerplate sections
          </Label>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Template...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Template
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}