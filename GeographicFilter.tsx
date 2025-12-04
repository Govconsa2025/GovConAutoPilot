import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface GeographicFilterProps {
  zipCode: string;
  radius: number;
  onZipCodeChange: (zip: string) => void;
  onRadiusChange: (radius: number) => void;
}

export function GeographicFilter({ zipCode, radius, onZipCodeChange, onRadiusChange }: GeographicFilterProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">ZIP Code</Label>
        <Input
          value={zipCode}
          onChange={(e) => onZipCodeChange(e.target.value)}
          placeholder="Enter ZIP code"
          maxLength={5}
          className="mt-1"
        />
      </div>
      <div>
        <Label className="text-sm font-medium">Radius: {radius} miles</Label>
        <Slider
          value={[radius]}
          onValueChange={(values) => onRadiusChange(values[0])}
          min={10}
          max={500}
          step={10}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>10 mi</span>
          <span>500 mi</span>
        </div>
      </div>
    </div>
  );
}
