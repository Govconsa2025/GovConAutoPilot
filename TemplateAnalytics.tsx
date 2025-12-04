import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { BarChart, TrendingUp, Users, Download, Eye, Award } from 'lucide-react';

interface TemplateAnalyticsProps {
  templateId?: string;
  showTopTemplates?: boolean;
}

export function TemplateAnalytics({ templateId, showTopTemplates }: TemplateAnalyticsProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [topTemplates, setTopTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (templateId) {
      loadTemplateAnalytics();
    }
    if (showTopTemplates) {
      loadTopTemplates();
    }
  }, [templateId, showTopTemplates]);

  const loadTemplateAnalytics = async () => {
    setLoading(true);
    
    const { data: analyticsData } = await supabase
      .from('template_analytics')
      .select('*')
      .eq('template_id', templateId);

    if (analyticsData) {
      const stats = {
        totalViews: analyticsData.filter(a => a.action === 'view').length,
        totalUses: analyticsData.filter(a => a.action === 'use').length,
        totalDownloads: analyticsData.filter(a => a.action === 'download').length,
        successRate: analyticsData.filter(a => a.success_outcome).length / analyticsData.length * 100,
        totalWinValue: analyticsData.reduce((sum, a) => sum + (a.win_value || 0), 0)
      };
      setAnalytics(stats);
    }
    
    setLoading(false);
  };

  const loadTopTemplates = async () => {
    const { data: templates } = await supabase
      .from('document_templates')
      .select('id, name, category, usage_count')
      .eq('is_public', true)
      .eq('approval_status', 'approved')
      .order('usage_count', { ascending: false })
      .limit(5);

    setTopTemplates(templates || []);
  };

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div className="space-y-6">
      {analytics && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Eye className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{analytics.totalViews}</p>
                  <p className="text-sm text-gray-600">Views</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{analytics.totalUses}</p>
                  <p className="text-sm text-gray-600">Uses</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Download className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{analytics.totalDownloads}</p>
                  <p className="text-sm text-gray-600">Downloads</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{analytics.successRate.toFixed(0)}%</p>
                  <p className="text-sm text-gray-600">Success Rate</p>
                </div>
              </div>
            </Card>
          </div>

          {analytics.totalWinValue > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Award className="h-10 w-10 text-yellow-600" />
                <div>
                  <p className="text-3xl font-bold">${analytics.totalWinValue.toLocaleString()}</p>
                  <p className="text-gray-600">Total Contract Value Won</p>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {showTopTemplates && topTemplates.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Most Effective Templates
          </h3>
          <div className="space-y-3">
            {topTemplates.map((template, index) => (
              <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg text-gray-400">#{index + 1}</span>
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-sm text-gray-500">{template.category}</p>
                  </div>
                </div>
                <span className="text-sm font-medium">{template.usage_count} uses</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}