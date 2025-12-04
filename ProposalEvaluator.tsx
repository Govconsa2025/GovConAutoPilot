import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EvaluationResult {
  overallScore: number;
  scores: {
    compliance: number;
    technical: number;
    clarity: number;
    completeness: number;
    competitiveness: number;
  };
  sectionAnalysis: Array<{
    section: string;
    score: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  }>;
  complianceIssues: Array<{
    severity: string;
    issue: string;
    location: string;
    recommendation: string;
  }>;
  strengths: string[];
  improvements: Array<{
    priority: string;
    area: string;
    current: string;
    recommended: string;
    impact: string;
  }>;
  winningPatterns: {
    matched: string[];
    missing: string[];
  };
  summary: string;
}

export function ProposalEvaluator() {
  const [proposalText, setProposalText] = useState('');
  const [rfpRequirements, setRfpRequirements] = useState('');
  const [contractType, setContractType] = useState('');
  const [agency, setAgency] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  const handleEvaluate = async () => {
    if (!proposalText || !rfpRequirements) {
      alert('Please provide both proposal text and RFP requirements');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('evaluate-proposal', {
        body: { proposalText, rfpRequirements, contractType, agency }
      });

      if (error) throw error;
      if (data.success) {
        setEvaluation(data.evaluation);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      alert('Evaluation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">AI Proposal Evaluator</h2>
        <p className="text-muted-foreground mb-6">
          Analyze your proposal against RFP requirements with AI-powered scoring
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Contract Type</Label>
              <Input
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                placeholder="e.g., FFP, T&M, CPFF"
              />
            </div>
            <div>
              <Label>Agency</Label>
              <Input
                value={agency}
                onChange={(e) => setAgency(e.target.value)}
                placeholder="e.g., DoD, GSA, NASA"
              />
            </div>
          </div>

          <div>
            <Label>RFP Requirements</Label>
            <Textarea
              value={rfpRequirements}
              onChange={(e) => setRfpRequirements(e.target.value)}
              placeholder="Paste RFP requirements, evaluation criteria, and key sections..."
              rows={6}
            />
          </div>

          <div>
            <Label>Proposal Draft</Label>
            <Textarea
              value={proposalText}
              onChange={(e) => setProposalText(e.target.value)}
              placeholder="Paste your proposal draft for evaluation..."
              rows={10}
            />
          </div>

          <Button onClick={handleEvaluate} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Proposal...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Evaluate Proposal
              </>
            )}
          </Button>
        </div>
      </Card>

      {evaluation && (
        <Card className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-3xl font-bold">Overall Score</h3>
              <span className={`text-5xl font-bold ${getScoreColor(evaluation.overallScore)}`}>
                {evaluation.overallScore}
              </span>
            </div>
            <Progress value={evaluation.overallScore} className="h-3" />
            <p className="text-muted-foreground mt-2">{evaluation.summary}</p>
          </div>

          <Tabs defaultValue="scores" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="scores">Scores</TabsTrigger>
              <TabsTrigger value="sections">Sections</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="improvements">Improvements</TabsTrigger>
              <TabsTrigger value="patterns">Patterns</TabsTrigger>
            </TabsList>

            <TabsContent value="scores" className="space-y-4">
              {Object.entries(evaluation.scores).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className="capitalize font-medium">{key}</span>
                    <span className={`font-bold ${getScoreColor(value)}`}>{value}</span>
                  </div>
                  <Progress value={value} />
                </div>
              ))}

              <div className="mt-6">
                <h4 className="font-semibold mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  Strengths
                </h4>
                <ul className="space-y-1">
                  {evaluation.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {s}</li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="sections" className="space-y-4">
              {evaluation.sectionAnalysis.map((section, i) => (
                <Card key={i} className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold">{section.section}</h4>
                    <Badge variant={section.score >= 70 ? 'default' : 'destructive'}>
                      {section.score}/100
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-green-600">Strengths:</span>
                      <ul className="ml-4 mt-1">
                        {section.strengths.map((s, j) => (
                          <li key={j}>• {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-medium text-red-600">Weaknesses:</span>
                      <ul className="ml-4 mt-1">
                        {section.weaknesses.map((w, j) => (
                          <li key={j}>• {w}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-medium text-blue-600">Recommendations:</span>
                      <ul className="ml-4 mt-1">
                        {section.recommendations.map((r, j) => (
                          <li key={j}>• {r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="compliance" className="space-y-3">
              {evaluation.complianceIssues.length === 0 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>No compliance issues detected</AlertDescription>
                </Alert>
              ) : (
                evaluation.complianceIssues.map((issue, i) => (
                  <Alert key={i} variant={issue.severity === 'critical' || issue.severity === 'high' ? 'destructive' : 'default'}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(issue.severity)}>
                            {issue.severity.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{issue.location}</span>
                        </div>
                        <p>{issue.issue}</p>
                        <p className="text-sm italic">→ {issue.recommendation}</p>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </TabsContent>

            <TabsContent value="improvements" className="space-y-3">
              {evaluation.improvements.map((imp, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{imp.area}</h4>
                    <Badge variant={imp.priority === 'high' ? 'destructive' : imp.priority === 'medium' ? 'default' : 'secondary'}>
                      {imp.priority} priority
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Current:</span> {imp.current}</p>
                    <p><span className="font-medium">Recommended:</span> {imp.recommended}</p>
                    <p className="text-green-600"><span className="font-medium">Impact:</span> {imp.impact}</p>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="patterns" className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Winning Patterns Matched
                </h4>
                <ul className="space-y-1">
                  {evaluation.winningPatterns.matched.map((p, i) => (
                    <li key={i} className="text-sm">• {p}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center text-orange-600">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Missing Winning Patterns
                </h4>
                <ul className="space-y-1">
                  {evaluation.winningPatterns.missing.map((p, i) => (
                    <li key={i} className="text-sm">• {p}</li>
                  ))}
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
}
