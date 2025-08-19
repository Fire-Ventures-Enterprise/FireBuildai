import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";

interface AddressSuggestion {
  id: string;
  description: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface AddressAutocompleteProps {
  value?: string;
  onChange: (address: AddressSuggestion | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Mock address suggestions for different regions
const MOCK_ADDRESSES: AddressSuggestion[] = [
  // US Addresses
  { id: '1', description: '123 Main Street, New York, NY 10001, USA', street: '123 Main Street', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA' },
  { id: '2', description: '456 Oak Avenue, Los Angeles, CA 90210, USA', street: '456 Oak Avenue', city: 'Los Angeles', state: 'CA', zipCode: '90210', country: 'USA' },
  { id: '3', description: '789 Pine Street, Chicago, IL 60601, USA', street: '789 Pine Street', city: 'Chicago', state: 'IL', zipCode: '60601', country: 'USA' },
  { id: '4', description: '321 Elm Drive, Miami, FL 33101, USA', street: '321 Elm Drive', city: 'Miami', state: 'FL', zipCode: '33101', country: 'USA' },
  { id: '5', description: '654 Maple Lane, Seattle, WA 98101, USA', street: '654 Maple Lane', city: 'Seattle', state: 'WA', zipCode: '98101', country: 'USA' },
  { id: '6', description: '987 Cedar Court, Austin, TX 78701, USA', street: '987 Cedar Court', city: 'Austin', state: 'TX', zipCode: '78701', country: 'USA' },
  { id: '7', description: '147 Birch Boulevard, Denver, CO 80201, USA', street: '147 Birch Boulevard', city: 'Denver', state: 'CO', zipCode: '80201', country: 'USA' },
  { id: '8', description: '258 Willow Way, Portland, OR 97201, USA', street: '258 Willow Way', city: 'Portland', state: 'OR', zipCode: '97201', country: 'USA' },
  
  // Canadian Addresses
  { id: '9', description: '123 King Street, Toronto, ON M5H 3T9, Canada', street: '123 King Street', city: 'Toronto', state: 'ON', zipCode: 'M5H 3T9', country: 'Canada' },
  { id: '10', description: '456 Queen Street, Vancouver, BC V6B 2W2, Canada', street: '456 Queen Street', city: 'Vancouver', state: 'BC', zipCode: 'V6B 2W2', country: 'Canada' },
  { id: '11', description: '789 Rue Saint-Catherine, Montreal, QC H3B 1A1, Canada', street: '789 Rue Saint-Catherine', city: 'Montreal', state: 'QC', zipCode: 'H3B 1A1', country: 'Canada' },
  { id: '12', description: '321 Jasper Avenue, Edmonton, AB T5J 0N3, Canada', street: '321 Jasper Avenue', city: 'Edmonton', state: 'AB', zipCode: 'T5J 0N3', country: 'Canada' },
  { id: '13', description: '654 Broadway Avenue, Saskatoon, SK S7N 1B1, Canada', street: '654 Broadway Avenue', city: 'Saskatoon', state: 'SK', zipCode: 'S7N 1B1', country: 'Canada' },
  
  // UK Addresses  
  { id: '14', description: '123 Oxford Street, London, England W1C 1DE, UK', street: '123 Oxford Street', city: 'London', state: 'England', zipCode: 'W1C 1DE', country: 'UK' },
  { id: '15', description: '456 Deansgate, Manchester, England M3 2AZ, UK', street: '456 Deansgate', city: 'Manchester', state: 'England', zipCode: 'M3 2AZ', country: 'UK' },
  { id: '16', description: '789 Princes Street, Edinburgh, Scotland EH2 2AN, UK', street: '789 Princes Street', city: 'Edinburgh', state: 'Scotland', zipCode: 'EH2 2AN', country: 'UK' },
];

export function AddressAutocomplete({
  value = "",
  onChange,
  placeholder = "Enter address...",
  className,
  disabled = false,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Simulate API delay for address lookup
  useEffect(() => {
    if (inputValue.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      const filtered = MOCK_ADDRESSES.filter(address =>
        address.description.toLowerCase().includes(inputValue.toLowerCase()) ||
        address.street.toLowerCase().includes(inputValue.toLowerCase()) ||
        address.city.toLowerCase().includes(inputValue.toLowerCase()) ||
        address.state.toLowerCase().includes(inputValue.toLowerCase()) ||
        address.zipCode.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 5); // Limit to 5 suggestions
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    setInputValue(suggestion.description);
    setShowSuggestions(false);
    onChange(suggestion);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Delay hiding suggestions to allow for click events
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
        setShowSuggestions(false);
      }
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const clearInput = () => {
    setInputValue("");
    onChange(null);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`pl-10 pr-10 ${className}`}
          disabled={disabled}
          data-testid="input-address-autocomplete"
        />
        {isLoading && (
          <Loader2 className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
        )}
        {inputValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            onClick={clearInput}
            tabIndex={-1}
          >
            ×
          </Button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <Card
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-lg"
        >
          <CardContent className="p-0">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                className={`w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-none bg-transparent cursor-pointer transition-colors ${
                  index === selectedIndex 
                    ? 'bg-blue-50 dark:bg-blue-900/20' 
                    : ''
                } ${
                  index !== suggestions.length - 1 
                    ? 'border-b border-gray-200 dark:border-gray-700' 
                    : ''
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
                data-testid={`suggestion-${suggestion.id}`}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {suggestion.street}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {suggestion.city}, {suggestion.state} {suggestion.zipCode}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {suggestion.country}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}