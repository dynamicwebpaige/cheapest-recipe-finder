import React from 'react';
import { Store } from '../types';
import { ShoppingBag, MapPin } from 'lucide-react';

interface StoreListProps {
  stores: Store[];
}

const StoreList: React.FC<StoreListProps> = ({ stores }) => {
  if (stores.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stores.map((store, index) => (
        <div key={index} className="flex flex-col bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow h-full relative overflow-hidden">
          {/* Accent Border */}
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500 opacity-20"></div>
          
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-red-500 text-white font-bold rounded-full shadow-sm shrink-0">
                {index + 1}
              </div>
              <h3 className="font-semibold text-lg text-slate-800 leading-tight">{store.name}</h3>
            </div>
            <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
          </div>
          
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <ShoppingBag className="w-3 h-3" />
              Items to buy
            </div>
            <div className="flex flex-wrap gap-2">
              {store.items.map((item, i) => (
                <span key={i} className="px-2.5 py-1.5 bg-slate-50 text-slate-700 text-sm font-medium rounded-lg border border-slate-200">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StoreList;