import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NAICSSelectorProps {
  selectedCodes: string[];
  onCodesChange: (codes: string[]) => void;
}

const COMMON_NAICS = [
  { code: '541330', name: 'Engineering Services' },
  { code: '541511', name: 'Custom Computer Programming' },
  { code: '541512', name: 'Computer Systems Design' },
  { code: '541519', name: 'Other Computer Related' },
  { code: '541611', name: 'Administrative Management' },
  { code: '541990', name: 'Professional Services' },
];

export function NAICSSelector({ selectedCodes, onCodesChange }: NAICSSelectorProps) {
  const [inputValue, setInputValue] = useState('');

  const addCode = (code: string) => {
    if (code && !selectedCodes.includes(code)) {
      onCodesChange([...selectedCodes, code]);
    }
    setInputValue('');
  };

  const removeCode = (code: string) => {
    onCodesChange(selectedCodes.filter(c => c !== code));
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">NAICS Codes</Label>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCode(inputValue)}
          placeholder="Enter NAICS code"
        />
        <Button onClick={() => addCode(inputValue)} size="sm">Add</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedCodes.map(code => (
          <Badge key={code} variant="secondary" className="gap-1">
            {code}
            <X className="h-3 w-3 cursor-pointer" onClick={() => removeCode(code)} />
          </Badge>
        ))}
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Common Codes:</Label>
        <div className="flex flex-wrap gap-2">
          {COMMON_NAICS.map(({ code, name }) => (
            <Badge
              key={code}
              variant="outline"
              className="cursor-pointer hover:bg-secondary"
              onClick={() => addCode(code)}
            >
              {code} - {name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
