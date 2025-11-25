import React, { useState, useEffect } from 'react';
import { MapPin, ChefHat, ExternalLink } from 'lucide-react';
import SearchInput from './components/SearchInput';
import IngredientTable from './components/IngredientTable';
import StoreMap from './components/StoreMap';
import StoreList from './components/StoreList';
import { fetchRecipeSources, GeminiResponse } from './services/geminiService';
import { Coordinates, SearchResult } from './types';
import { DEFAULT_COORDINATES } from './constants';

const App: React.FC = () => {
  const [location, setLocation] = useState<Coordinates>(DEFAULT_COORDINATES);
  const [locationStatus, setLocationStatus] = useState<'locating' | 'found' | 'error'>('locating');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [groundingLinks, setGroundingLinks] = useState<{ title: string; uri: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationStatus('found');
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLocationStatus('error');
        }
      );
    } else {
      setLocationStatus('error');
    }
  }, []);

  const handleSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setRawText(null);
    setGroundingLinks([]);

    try {
      const response: GeminiResponse = await fetchRecipeSources(query, location);
      
      if (response.data) {
        setResult(response.data);
      } else {
        setRawText(response.rawText);
        setError("Could not structure the data perfectly, but here is what I found:");
      }
      setGroundingLinks(response.groundingLinks);
    } catch (e) {
      setError("Failed to fetch information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Cheapest<span className="text-blue-600">Recipe</span>Finder
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="w-4 h-4" />
            {locationStatus === 'locating' ? 'Locating...' : 
             locationStatus === 'error' ? 'Using Default Location' : 
             'Location Found'}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Search Section */}
        <section className="text-center space-y-4">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Find the best prices for your next meal.
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Tell us what you want to cook. We'll search local stores to find the cheapest ingredients near you.
          </p>
          <div className="pt-4">
            <SearchInput onSearch={handleSearch} isLoading={loading} />
          </div>
        </section>

        {/* Results Section */}
        {(result || rawText) && (
          <div className="animate-fade-in space-y-8">
            
            {/* Error / Fallback Message */}
            {error && !result && (
              <div className="bg-orange-50 text-orange-800 p-4 rounded-lg border border-orange-200">
                {error}
              </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              {/* Left Column: Ingredients Table + Summary */}
              {/* We enforce height on desktop to enable scrolling within the card, but allow auto growth on mobile */}
              <div className="flex flex-col lg:h-[600px] h-auto space-y-4">
                <div className="flex items-center justify-between shrink-0">
                  <h3 className="text-xl font-bold text-slate-800">Shopping List</h3>
                  {result && (
                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      {result.ingredients.length} items
                    </span>
                  )}
                </div>
                
                {/* Scrollable Container */}
                <div className="flex-1 lg:overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-sm min-h-[300px] relative scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                  {result ? (
                     <IngredientTable ingredients={result.ingredients} />
                  ) : (
                    <div className="p-6 prose prose-slate max-w-none">
                        <p className="whitespace-pre-wrap">{rawText}</p>
                    </div>
                  )}
                </div>

                {/* Summary Box */}
                {result?.summary && (
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-900 text-sm shadow-sm shrink-0">
                    <strong>Summary:</strong> <span className="whitespace-pre-wrap">{result.summary}</span>
                  </div>
                )}
              </div>

              {/* Right Column: Map */}
              {/* Fixed height on desktop to match table, fixed height on mobile for visibility */}
              <div className="h-96 lg:h-[600px] rounded-xl overflow-hidden shadow-lg border border-slate-200 relative bg-slate-100 z-0">
                <StoreMap 
                  userLocation={location} 
                  stores={result?.stores || []} 
                />
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-md text-xs font-semibold shadow-sm text-slate-600 pointer-events-none z-[400]">
                  Map Data © OpenStreetMap
                </div>
              </div>
            </div>

            {/* Bottom Section: Store Details */}
            {result && result.stores.length > 0 && (
              <section className="pt-4 border-t border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Store Breakdown</h3>
                <StoreList stores={result.stores} />
              </section>
            )}

            {/* Sources Section (Grounding) */}
            {groundingLinks.length > 0 && (
              <section className="border-t border-slate-200 pt-6">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Sources</h4>
                <div className="flex flex-wrap gap-3">
                  {groundingLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-md transition-colors"
                    >
                      {link.title || new URL(link.uri).hostname}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </main>
    </div>
  );
};

export default App;