import React, { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import useStore from '../store';

const Food = () => {
  const foodData = useStore((state) => state.foodData);
  const updateFoodData = useStore((state) => state.updateFoodData);

  const [groceryInput, setGroceryInput] = useState('');
  const [expandedRecipe, setExpandedRecipe] = useState(null);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newRecipeDescription, setNewRecipeDescription] = useState('');

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };
  const meals = ['breakfast', 'lunch', 'dinner', 'snack'];
  const mealNames = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack'
  };

  // Grocery list handlers
  const handleGroceryInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const lines = groceryInput.split('\n');
      const newItems = lines.filter(line => line.trim()).map(line => ({ text: line.trim(), checked: false }));

      updateFoodData({
        ...foodData,
        groceryList: [...foodData.groceryList, ...newItems]
      });

      setGroceryInput('');
    }
  };

  const toggleGroceryItem = (index) => {
    const newList = [...foodData.groceryList];
    newList[index].checked = !newList[index].checked;
    updateFoodData({
      ...foodData,
      groceryList: newList
    });
  };

  const deleteGroceryItem = (index) => {
    const newList = foodData.groceryList.filter((_, i) => i !== index);
    updateFoodData({
      ...foodData,
      groceryList: newList
    });
  };

  // Meal plan handlers
  const updateMeal = (day, meal, value) => {
    updateFoodData({
      ...foodData,
      mealPlan: {
        ...foodData.mealPlan,
        [day]: {
          ...foodData.mealPlan[day],
          [meal]: value
        }
      }
    });
  };

  const clearAllMeals = () => {
    const emptyPlan = {};
    days.forEach(day => {
      emptyPlan[day] = { breakfast: '', lunch: '', dinner: '', snack: '' };
    });
    updateFoodData({
      ...foodData,
      mealPlan: emptyPlan
    });
  };

  // Recipe handlers
  const addRecipe = () => {
    if (newRecipeName.trim()) {
      updateFoodData({
        ...foodData,
        recipes: [...foodData.recipes, { name: newRecipeName, description: newRecipeDescription }]
      });
      setNewRecipeName('');
      setNewRecipeDescription('');
    }
  };

  const deleteRecipe = (index) => {
    const newRecipes = foodData.recipes.filter((_, i) => i !== index);
    updateFoodData({
      ...foodData,
      recipes: newRecipes
    });
    if (expandedRecipe === index) {
      setExpandedRecipe(null);
    }
  };

  const updateRecipe = (index, field, value) => {
    const newRecipes = [...foodData.recipes];
    newRecipes[index][field] = value;
    updateFoodData({
      ...foodData,
      recipes: newRecipes
    });
  };

  return (
    <div className="space-y-6">
      {/* Grocery List Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-slate-200">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">Grocery List</h2>

        <textarea
          value={groceryInput}
          onChange={(e) => setGroceryInput(e.target.value)}
          onKeyDown={handleGroceryInputKeyDown}
          placeholder="Type grocery items (press Enter to add)..."
          className="w-full px-4 py-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white shadow-sm mb-4 resize-none"
          rows={3}
        />

        <div className="space-y-2">
          {foodData.groceryList.map((item, index) => (
            <div key={index} className="flex items-center gap-3 group">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleGroceryItem(index)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-400"
              />
              <span className={`flex-1 text-sm ${item.checked ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                {item.text}
              </span>
              <button
                onClick={() => deleteGroceryItem(index)}
                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Food Planner Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Weekly Meal Planner</h2>
          <button
            onClick={clearAllMeals}
            className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-all flex items-center gap-2"
          >
            <Trash2 size={16} />
            Clear All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                <th className="p-2 text-left font-semibold text-xs sm:text-sm border border-slate-600">Meal</th>
                {days.map(day => (
                  <th key={day} className="p-2 text-left font-semibold text-xs sm:text-sm border border-slate-600">
                    {dayNames[day]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {meals.map(meal => (
                <tr key={meal} className="hover:bg-indigo-50/50 transition-colors">
                  <td className="p-2 font-semibold text-slate-700 text-xs sm:text-sm border border-slate-200 bg-slate-50">
                    {mealNames[meal]}
                  </td>
                  {days.map(day => (
                    <td key={`${day}-${meal}`} className="p-1 border border-slate-200">
                      <input
                        type="text"
                        value={foodData.mealPlan[day][meal]}
                        onChange={(e) => updateMeal(day, meal, e.target.value)}
                        placeholder="..."
                        className="w-full px-2 py-1.5 text-xs sm:text-sm border-0 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded bg-transparent hover:bg-white transition-colors"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recipe Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-slate-200">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">Recipes</h2>

        <div className="mb-4 space-y-2">
          <input
            type="text"
            value={newRecipeName}
            onChange={(e) => setNewRecipeName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addRecipe()}
            placeholder="Recipe name..."
            className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white shadow-sm"
          />
          <textarea
            value={newRecipeDescription}
            onChange={(e) => setNewRecipeDescription(e.target.value)}
            placeholder="Recipe description/instructions..."
            className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white shadow-sm resize-none"
            rows={3}
          />
          <button
            onClick={addRecipe}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            Add Recipe
          </button>
        </div>

        <div className="space-y-2">
          {foodData.recipes.map((recipe, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-3 hover:bg-indigo-50/30 transition-colors">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setExpandedRecipe(expandedRecipe === index ? null : index)}
                  className="flex-1 text-left font-semibold text-indigo-600 hover:text-indigo-800 transition-colors text-sm"
                >
                  {recipe.name}
                </button>
                <button
                  onClick={() => deleteRecipe(index)}
                  className="text-red-500 hover:text-red-700 transition-all ml-2"
                >
                  <X size={16} />
                </button>
              </div>

              {expandedRecipe === index && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <textarea
                    value={recipe.description}
                    onChange={(e) => updateRecipe(index, 'description', e.target.value)}
                    placeholder="Add recipe description..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white resize-none"
                    rows={5}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Food;
