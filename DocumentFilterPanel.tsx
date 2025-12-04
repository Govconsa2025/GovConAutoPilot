import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, X, Save, Bookmark } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface FilterState {
  tags: string[];
  dateFrom: string;
  dateTo: string;
  fileTypes: string[];
  minSize: number;
  maxSize: number;
}

interface DocumentFilterPanelProps {
  allTags: string[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function DocumentFilterPanel({ allTags, filters, onFiltersChange }: DocumentFilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [searchName, setSearchName] = useState('');

  useEffect(() => {
    loadSavedSearches();
  }, []);

  const loadSavedSearches = async () => {
    const { data } = await supabase.from('saved_searches').select('*').order('created_at', { ascending: false });
    if (data) setSavedSearches(data);
  };

  const saveSearch = async () => {
    if (!searchName) return;
    const { error } = await supabase.from('saved_searches').insert({
      name: searchName,
      filters: filters,
      organization_id: 'default-org'
    });
    if (error) toast.error('Failed to save search');
    else {
      toast.success('Search saved');
      setSearchName('');
      loadSavedSearches();
    }
  };

  const loadSearch = (search: any) => {
    onFiltersChange(search.filters);
    toast.success(`Loaded "${search.name}"`);
  };

  const deleteSearch = async (id: string) => {
    await supabase.from('saved_searches').delete().eq('id', id);
    loadSavedSearches();
  };

  const activeFilterCount = [
    filters.tags.length > 0,
    filters.dateFrom || filters.dateTo,
    filters.fileTypes.length > 0,
    filters.minSize > 0 || filters.maxSize < Infinity
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFiltersChange({ tags: [], dateFrom: '', dateTo: '', fileTypes: [], minSize: 0, maxSize: Infinity });
  };

  return (
    <Card className="mb-4">
      <div className="p-4">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Advanced Filters</h3>
            {activeFilterCount > 0 && <Badge variant="default">{activeFilterCount} active</Badge>}
          </div>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>

        {isOpen && (
          <div className="mt-4 space-y-6">
            <div>
              <Label className="mb-2 block">Tags</Label>
              <div className="grid grid-cols-2 gap-2">
                {allTags.map(tag => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      checked={filters.tags.includes(tag)}
                      onCheckedChange={(checked) => {
                        const newTags = checked 
                          ? [...filters.tags, tag]
                          : filters.tags.filter(t => t !== tag);
                        onFiltersChange({ ...filters, tags: newTags });
                      }}
                    />
                    <label className="text-sm">{tag}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Date Range</Label>
              <div className="flex gap-2">
                <Input type="date" value={filters.dateFrom} onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })} />
                <Input type="date" value={filters.dateTo} onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })} />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">File Types</Label>
              <div className="grid grid-cols-2 gap-2">
                {['PDF', 'Image', 'Text', 'Word', 'Excel'].map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      checked={filters.fileTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        const newTypes = checked 
                          ? [...filters.fileTypes, type]
                          : filters.fileTypes.filter(t => t !== type);
                        onFiltersChange({ ...filters, fileTypes: newTypes });
                      }}
                    />
                    <label className="text-sm">{type}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">File Size (MB)</Label>
              <div className="flex gap-2 items-center">
                <Input type="number" placeholder="Min" value={filters.minSize || ''} onChange={(e) => onFiltersChange({ ...filters, minSize: Number(e.target.value) })} />
                <span>to</span>
                <Input type="number" placeholder="Max" value={filters.maxSize === Infinity ? '' : filters.maxSize} onChange={(e) => onFiltersChange({ ...filters, maxSize: e.target.value ? Number(e.target.value) : Infinity })} />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={clearFilters} className="flex-1"><X className="w-4 h-4 mr-2" />Clear All</Button>
            </div>

            <div className="border-t pt-4">
              <Label className="mb-2 block">Save This Search</Label>
              <div className="flex gap-2">
                <Input placeholder="Search name" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
                <Button onClick={saveSearch}><Save className="w-4 h-4" /></Button>
              </div>
            </div>

            {savedSearches.length > 0 && (
              <div>
                <Label className="mb-2 block">Saved Searches</Label>
                <div className="space-y-2">
                  {savedSearches.map(search => (
                    <div key={search.id} className="flex justify-between items-center p-2 bg-muted rounded">
                      <Button variant="ghost" size="sm" onClick={() => loadSearch(search)} className="flex-1 justify-start">
                        <Bookmark className="w-4 h-4 mr-2" />{search.name}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteSearch(search.id)}><X className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
