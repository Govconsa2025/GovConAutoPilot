import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ContractValueFilterProps {
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}

export function ContractValueFilter({ minValue, maxValue, onMinChange, onMaxChange }: ContractValueFilterProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Contract Value Range</Label>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">Min</Label>
          <Input
            type="number"
            value={minValue}
            onChange={(e) => onMinChange(Number(e.target.value))}
            placeholder="0"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Max</Label>
          <Input
            type="number"
            value={maxValue}
            onChange={(e) => onMaxChange(Number(e.target.value))}
            placeholder="10000000"
            className="mt-1"
          />
        </div>
      </div>
      <div className="text-xs text-muted-foreground text-center">
        {formatCurrency(minValue)} - {formatCurrency(maxValue)}
      </div>
    </div>
  );
}
