import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal, Save, Star } from 'lucide-react';
import { ContractValueFilter } from './ContractValueFilter';
import { NAICSSelector } from './NAICSSelector';
import { GeographicFilter } from './GeographicFilter';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface FilterBarProps {
  filters: any;
  onFilterChange: (filters: any) => void;
}

export default function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const [advancedFilters, setAdvancedFilters] = useState({
    minValue: 0,
    maxValue: 10000000,
    naicsCodes: [] as string[],
    zipCode: '',
    radius: 100,
  });
  const [presets, setPresets] = useState<any[]>([]);
  const [presetName, setPresetName] = useState('');

  const applyAdvancedFilters = () => {
    onFilterChange({ ...filters, ...advancedFilters });
    toast.success('Advanced filters applied');
  };

  const savePreset = async () => {
    if (!presetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }
    const { error } = await supabase.from('filter_presets').insert({
      name: presetName,
      filters: { ...filters, ...advancedFilters }
    });
    if (error) {
      toast.error('Failed to save preset');
    } else {
      toast.success('Filter preset saved');
      setPresetName('');
      loadPresets();
    }
  };

  const loadPresets = async () => {
    const { data } = await supabase.from('filter_presets').select('*').order('created_at', { ascending: false });
    if (data) setPresets(data);
  };

  const applyPreset = (preset: any) => {
    onFilterChange(preset.filters);
    setAdvancedFilters(preset.filters);
    toast.success(`Applied preset: ${preset.name}`);
  };

  return (
    <div className="bg-white border rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Input
          placeholder="Search opportunities..."
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        />
        <Select value={filters.classification} onValueChange={(v) => onFilterChange({ ...filters, classification: v })}>
          <SelectTrigger><SelectValue placeholder="Classification" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="PRIME">Prime</SelectItem>
            <SelectItem value="SUB_PLAY">Sub-Play</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.status} onValueChange={(v) => onFilterChange({ ...filters, status: v })}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
          </SelectContent>
        </Select>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" onClick={loadPresets}><SlidersHorizontal className="h-4 w-4 mr-2" />Advanced</Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader><SheetTitle>Advanced Filters</SheetTitle></SheetHeader>
            <div className="space-y-6 mt-6">
              <ContractValueFilter
                minValue={advancedFilters.minValue}
                maxValue={advancedFilters.maxValue}
                onMinChange={(v) => setAdvancedFilters({ ...advancedFilters, minValue: v })}
                onMaxChange={(v) => setAdvancedFilters({ ...advancedFilters, maxValue: v })}
              />
              <NAICSSelector
                selectedCodes={advancedFilters.naicsCodes}
                onCodesChange={(codes) => setAdvancedFilters({ ...advancedFilters, naicsCodes: codes })}
              />
              <GeographicFilter
                zipCode={advancedFilters.zipCode}
                radius={advancedFilters.radius}
                onZipCodeChange={(zip) => setAdvancedFilters({ ...advancedFilters, zipCode: zip })}
                onRadiusChange={(r) => setAdvancedFilters({ ...advancedFilters, radius: r })}
              />
              <div className="flex gap-2">
                <Input placeholder="Preset name" value={presetName} onChange={(e) => setPresetName(e.target.value)} />
                <Button onClick={savePreset}><Save className="h-4 w-4" /></Button>
              </div>
              {presets.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Saved Presets</p>
                  {presets.map(p => (
                    <Button key={p.id} variant="outline" className="w-full justify-start" onClick={() => applyPreset(p)}>
                      <Star className="h-4 w-4 mr-2" />{p.name}
                    </Button>
                  ))}
                </div>
              )}
              <Button onClick={applyAdvancedFilters} className="w-full">Apply Filters</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
