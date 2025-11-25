import React, { useState, useEffect } from 'react';
import { Mic, Search, MicOff, Loader2 } from 'lucide-react';

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any | null>(null);

  useEffect(() => {
    // Cast window to any to avoid TypeScript errors with missing SpeechRecognition types
    const win = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        onSearch(transcript); // Auto-search on speech end
        setIsListening(false);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [onSearch]);

  const toggleListening = () => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to cook? (e.g., Chicken Piccata)"
          className="w-full pl-12 pr-14 py-4 bg-white border border-slate-200 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg transition-all"
          disabled={isLoading}
        />
        <Search className="absolute left-4 w-6 h-6 text-slate-400" />
        
        <div className="absolute right-2 flex items-center gap-2">
            {recognition && (
            <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-full transition-colors ${
                isListening 
                    ? 'bg-red-100 text-red-600 animate-pulse' 
                    : 'hover:bg-slate-100 text-slate-500'
                }`}
                title="Use voice"
                disabled={isLoading}
            >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            )}
            <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            </button>
        </div>
      </div>
      {isListening && (
        <p className="absolute -bottom-6 left-0 right-0 text-center text-xs text-red-500 font-medium">
          Listening...
        </p>
      )}
    </form>
  );
};

export default SearchInput;