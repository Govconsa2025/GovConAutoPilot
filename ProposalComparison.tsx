import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Loader2, TrendingUp, Award, Lightbulb } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface Proposal {
  name: string;
  content: string;
  file?: File;
}

export default function ProposalComparison() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const newProposals = [...proposals];
      newProposals[index] = { name: file.name, content, file };
      setProposals(newProposals);
    };
    reader.readAsText(file);
  };

  const addProposalSlot = () => {
    setProposals([...proposals, { name: '', content: '' }]);
  };

  const removeProposal = (index: number) => {
    setProposals(proposals.filter((_, i) => i !== index));
  };

  const compareProposals = async () => {
    if (proposals.length < 2) {
      setError('Please upload at least 2 proposals to compare');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: funcError } = await supabase.functions.invoke('compare-proposals', {
        body: { proposals }
      });

      if (funcError) throw funcError;
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message || 'Failed to compare proposals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Proposal Comparison</h1>
        <p className="text-muted-foreground">Upload multiple proposals to compare them side-by-side with AI-powered analysis</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Proposals</CardTitle>
          <CardDescription>Add 2 or more proposals to compare</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {proposals.map((proposal, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <div className="flex-1">
                <Label htmlFor={`proposal-${index}`}>Proposal {index + 1}</Label>
                <Input
                  id={`proposal-${index}`}
                  type="file"
                  accept=".txt,.doc,.docx,.pdf"
                  onChange={(e) => handleFileUpload(e, index)}
                  className="mt-1"
                />
                {proposal.name && <p className="text-sm text-muted-foreground mt-1">{proposal.name}</p>}
              </div>
              <Button variant="outline" size="sm" onClick={() => removeProposal(index)}>Remove</Button>
            </div>
          ))}
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={addProposalSlot}>
              <Upload className="h-4 w-4 mr-2" />
              Add Proposal
            </Button>
            <Button onClick={compareProposals} disabled={loading || proposals.length < 2}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Compare Proposals
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {analysis && <ComparisonResults analysis={analysis} proposals={proposals} />}
    </div>
  );
}

function ComparisonResults({ analysis, proposals }: { analysis: any; proposals: Proposal[] }) {
  const chartData = analysis.scores?.map((score: any) => ({
    name: score.proposalName,
    Compliance: score.compliance,
    Technical: score.technical,
    Clarity: score.clarity,
    Completeness: score.completeness,
    Competitiveness: score.competitiveness
  })) || [];

  // Transform data for radar chart - each metric becomes a data point
  const radarData = [
    { metric: 'Compliance', ...Object.fromEntries(analysis.scores?.map((s: any, i: number) => [`Proposal ${i + 1}`, s.compliance]) || []) },
    { metric: 'Technical', ...Object.fromEntries(analysis.scores?.map((s: any, i: number) => [`Proposal ${i + 1}`, s.technical]) || []) },
    { metric: 'Clarity', ...Object.fromEntries(analysis.scores?.map((s: any, i: number) => [`Proposal ${i + 1}`, s.clarity]) || []) },
    { metric: 'Completeness', ...Object.fromEntries(analysis.scores?.map((s: any, i: number) => [`Proposal ${i + 1}`, s.completeness]) || []) },
    { metric: 'Competitiveness', ...Object.fromEntries(analysis.scores?.map((s: any, i: number) => [`Proposal ${i + 1}`, s.competitiveness]) || []) }
  ];

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-500" />
          Comparison Results
        </CardTitle>
        {analysis.overallWinner && (
          <Alert className="mt-4">
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              <strong>{analysis.overallWinner}</strong> is the strongest proposal. {analysis.winnerReason}
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="charts" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="charts">Score Charts</TabsTrigger>
            <TabsTrigger value="comparison">Comparisons</TabsTrigger>
            <TabsTrigger value="practices">Best Practices</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Score Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Compliance" fill="#3b82f6" />
                  <Bar dataKey="Technical" fill="#10b981" />
                  <Bar dataKey="Clarity" fill="#f59e0b" />
                  <Bar dataKey="Completeness" fill="#8b5cf6" />
                  <Bar dataKey="Competitiveness" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Radar Comparison</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  {analysis.scores?.map((_: any, idx: number) => (
                    <Radar 
                      key={idx} 
                      name={`Proposal ${idx + 1}`} 
                      dataKey={`Proposal ${idx + 1}`} 
                      stroke={colors[idx % colors.length]} 
                      fill={colors[idx % colors.length]} 
                      fillOpacity={0.3} 
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>


          <TabsContent value="comparison" className="space-y-4">
            {analysis.comparisons?.map((comp: any, idx: number) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-lg">{comp.category}</CardTitle>
                  <Badge variant="secondary">{comp.winner} wins this category</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{comp.analysis}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="practices" className="space-y-4">
            {analysis.bestPractices?.map((practice: any, idx: number) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        {practice.practice}
                      </CardTitle>
                      <Badge variant="outline" className="mt-2">{practice.proposalName}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <strong className="text-sm">Why it's effective:</strong>
                    <p className="text-sm text-muted-foreground">{practice.description}</p>
                  </div>
                  <div>
                    <strong className="text-sm">How to apply:</strong>
                    <p className="text-sm text-muted-foreground">{practice.applicability}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {analysis.recommendations?.map((rec: any, idx: number) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{rec.proposalName}</CardTitle>
                    <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                      {rec.priority} priority
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <strong className="text-sm">Recommendation:</strong>
                    <p className="text-sm text-muted-foreground">{rec.recommendation}</p>
                  </div>
                  <div>
                    <strong className="text-sm">Expected Impact:</strong>
                    <p className="text-sm text-muted-foreground">{rec.impact}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}