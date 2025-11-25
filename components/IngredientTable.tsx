import React from 'react';
import { Ingredient } from '../types';

interface IngredientTableProps {
  ingredients: Ingredient[];
}

const IngredientTable: React.FC<IngredientTableProps> = ({ ingredients }) => {
  if (ingredients.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
        No ingredients found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200 h-full">
      <table className="min-w-full text-left text-sm relative">
        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="px-6 py-3 font-semibold text-slate-700 whitespace-nowrap">Ingredient</th>
            <th className="px-6 py-3 font-semibold text-slate-700 whitespace-nowrap">Price (Est.)</th>
            <th className="px-6 py-3 font-semibold text-slate-700 whitespace-nowrap">Store</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {ingredients.map((item, index) => (
            <tr key={index} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-3 text-slate-800 font-medium">{item.name}</td>
              <td className="px-6 py-3 text-green-600 font-medium">{item.price}</td>
              <td className="px-6 py-3 text-slate-600">{item.store}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IngredientTable;