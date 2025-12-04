import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, Copy, Share2, Star } from 'lucide-react';

interface TemplateCardProps {
  template: {
    id: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    usage_count: number;
    is_public: boolean;
    approval_status?: string;
    avgRating?: number;
  };
  onPreview: (template: any) => void;
  onUse: (template: any) => void;
  onShare?: (template: any) => void;
}

export function TemplateCard({ template, onPreview, onUse, onShare }: TemplateCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <FileText className="h-8 w-8 text-blue-600 mb-2" />
          <div className="flex gap-2">
            {template.is_public && (
              <Badge variant="secondary">Public</Badge>
            )}
            {template.approval_status === 'approved' && (
              <Badge className="bg-green-600">Approved</Badge>
            )}
          </div>
        </div>
        <CardTitle className="text-lg">{template.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {template.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {template.tags?.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Used {template.usage_count} times</span>
              {template.avgRating && template.avgRating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{template.avgRating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <Badge variant="outline">{template.category}</Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onPreview(template)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onUse(template)}
            >
              <Copy className="h-4 w-4 mr-1" />
              Use
            </Button>
            {onShare && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShare(template)}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
