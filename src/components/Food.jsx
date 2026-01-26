import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import useStore from '../store';

const Food = () => {
  const foodData = useStore((state) => state.foodData);
  const updateFoodData = useStore((state) => state.updateFoodData);
  const reloadFromStorage = useStore((state) => state.reloadFromStorage);

  // Listen for cross-device sync events
  useEffect(() => {
    const handleSync = () => {
      // Force reload from Zustand store which has been updated by PersonalOrganizer
      reloadFromStorage();
    };

    window.addEventListener('supabase-sync-complete', handleSync);
    return () => window.removeEventListener('supabase-sync-complete', handleSync);
  }, [reloadFromStorage]);

  const [expandedRecipe, setExpandedRecipe] = useState(null);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newRecipeDescription, setNewRecipeDescription] = useState('');
  const [newRecipeLink, setNewRecipeLink] = useState('');
  const [newRecipeTags, setNewRecipeTags] = useState([]);
  const [currentTagInput, setCurrentTagInput] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingRecipeTagInput, setEditingRecipeTagInput] = useState({});
  const [showDeletedModal, setShowDeletedModal] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [editSuggestionIndex, setEditSuggestionIndex] = useState({});

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
        recipes: [...foodData.recipes, { name: newRecipeName, description: newRecipeDescription, link: newRecipeLink, tags: newRecipeTags }]
      });
      setNewRecipeName('');
      setNewRecipeDescription('');
      setNewRecipeLink('');
      setNewRecipeTags([]);
      setCurrentTagInput('');
    }
  };

  const addTagToNewRecipe = () => {
    const tag = currentTagInput.trim();
    if (tag && !newRecipeTags.includes(tag)) {
      setNewRecipeTags([...newRecipeTags, tag]);
      setCurrentTagInput('');
    }
  };

  const removeTagFromNewRecipe = (tagToRemove) => {
    setNewRecipeTags(newRecipeTags.filter(tag => tag !== tagToRemove));
  };

  const addTagToExistingRecipe = (index, tag) => {
    const recipe = foodData.recipes[index];
    const currentTags = recipe.tags || [];
    if (tag && !currentTags.includes(tag)) {
      updateRecipe(index, 'tags', [...currentTags, tag]);
    }
  };

  const removeTagFromExistingRecipe = (index, tagToRemove) => {
    const recipe = foodData.recipes[index];
    const currentTags = recipe.tags || [];
    updateRecipe(index, 'tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const deleteRecipe = (index) => {
    const recipeToDelete = foodData.recipes[index];
    const newRecipes = foodData.recipes.filter((_, i) => i !== index);
    const deletedRecipes = foodData.deletedRecipes || [];

    updateFoodData({
      ...foodData,
      recipes: newRecipes,
      deletedRecipes: [...deletedRecipes, { ...recipeToDelete, deletedAt: new Date().toISOString() }]
    });

    if (expandedRecipe === index) {
      setExpandedRecipe(null);
    }
  };

  const restoreRecipe = (index) => {
    const deletedRecipes = foodData.deletedRecipes || [];
    const recipeToRestore = deletedRecipes[index];
    const { deletedAt, ...recipe } = recipeToRestore; // Remove deletedAt timestamp

    updateFoodData({
      ...foodData,
      recipes: [...foodData.recipes, recipe],
      deletedRecipes: deletedRecipes.filter((_, i) => i !== index)
    });
  };

  const permanentlyDeleteRecipe = (index) => {
    const deletedRecipes = foodData.deletedRecipes || [];
    updateFoodData({
      ...foodData,
      deletedRecipes: deletedRecipes.filter((_, i) => i !== index)
    });
  };

  const clearAllDeletedRecipes = () => {
    updateFoodData({
      ...foodData,
      deletedRecipes: []
    });
  };

  const updateRecipe = (index, field, value) => {
    const newRecipes = [...foodData.recipes];
    newRecipes[index][field] = value;
    updateFoodData({
      ...foodData,
      recipes: newRecipes
    });
  };

  // Get all unique tags from all recipes
  const getAllTags = () => {
    const tagsSet = new Set();
    foodData.recipes.forEach(recipe => {
      const recipeTags = recipe.tags || (recipe.tag ? [recipe.tag] : []);
      recipeTags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  };

  // Toggle filter selection
  const toggleFilter = (tag) => {
    if (selectedFilters.includes(tag)) {
      setSelectedFilters(selectedFilters.filter(f => f !== tag));
    } else {
      setSelectedFilters([...selectedFilters, tag]);
    }
  };

  // Check if recipe matches current filters (AND logic - must have all selected tags)
  const recipeMatchesFilters = (recipe) => {
    if (selectedFilters.length === 0) return true;
    const recipeTags = recipe.tags || (recipe.tag ? [recipe.tag] : []);
    return selectedFilters.every(filter => recipeTags.includes(filter));
  };

  // Get filtered tag suggestions based on input
  const getTagSuggestions = (input) => {
    if (!input.trim()) return [];
    const allTags = getAllTags();
    return allTags.filter(tag =>
      tag.toLowerCase().includes(input.toLowerCase()) &&
      !newRecipeTags.includes(tag)
    );
  };

  return (
    <div className="space-y-6">
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
          <input
            type="text"
            value={newRecipeLink}
            onChange={(e) => setNewRecipeLink(e.target.value)}
            placeholder="Recipe link (optional)..."
            className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white shadow-sm"
          />
          <div>
            <div className="flex gap-2 mb-2 relative">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={currentTagInput}
                  onChange={(e) => {
                    setCurrentTagInput(e.target.value);
                    setShowSuggestions(true);
                    setSelectedSuggestionIndex(-1);
                  }}
                  onKeyDown={(e) => {
                    const suggestions = getTagSuggestions(currentTagInput);
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setSelectedSuggestionIndex(prev =>
                        prev < suggestions.length - 1 ? prev + 1 : prev
                      );
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
                    } else if (e.key === 'Enter') {
                      e.preventDefault();
                      if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
                        setCurrentTagInput(suggestions[selectedSuggestionIndex]);
                        setNewRecipeTags([...newRecipeTags, suggestions[selectedSuggestionIndex]]);
                        setCurrentTagInput('');
                        setSelectedSuggestionIndex(-1);
                      } else {
                        addTagToNewRecipe();
                      }
                      setShowSuggestions(false);
                    } else if (e.key === 'Escape') {
                      setShowSuggestions(false);
                      setSelectedSuggestionIndex(-1);
                    }
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Add tags (e.g., breakfast, healthy, quick)..."
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white shadow-sm"
                />
                {showSuggestions && currentTagInput && getTagSuggestions(currentTagInput).length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {getTagSuggestions(currentTagInput).map((tag, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentTagInput(tag);
                          addTagToNewRecipe();
                          setShowSuggestions(false);
                          setSelectedSuggestionIndex(-1);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          idx === selectedSuggestionIndex ? 'bg-indigo-100' : 'hover:bg-indigo-50'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={addTagToNewRecipe}
                className="px-4 py-2 bg-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-300 transition-all"
              >
                Add Tag
              </button>
            </div>
            {newRecipeTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newRecipeTags.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                    {tag}
                    <button
                      onClick={() => removeTagFromNewRecipe(tag)}
                      className="hover:text-indigo-900"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={addRecipe}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            Add Recipe
          </button>
        </div>

        {/* Filter buttons */}
        {getAllTags().length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-slate-700">Filter by tags:</span>
              {selectedFilters.length > 0 && (
                <button
                  onClick={() => setSelectedFilters([])}
                  className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {getAllTags().map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleFilter(tag)}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    selectedFilters.includes(tag)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {foodData.recipes.map((recipe, index) => {
            // Skip if filtered out
            if (!recipeMatchesFilters(recipe)) return null;

            const recipeTags = recipe.tags || (recipe.tag ? [recipe.tag] : []);

            return (
              <div key={index} className="border border-slate-200 rounded-lg p-3 hover:bg-indigo-50/30 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 flex-wrap">
                    <button
                      onClick={() => setExpandedRecipe(expandedRecipe === index ? null : index)}
                      className="text-left font-semibold text-indigo-600 hover:text-indigo-800 transition-colors text-sm"
                    >
                      {recipe.name}
                    </button>
                    <div className="flex flex-wrap gap-1">
                      {recipeTags.map((tag, tagIdx) => (
                        <span key={tagIdx} className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteRecipe(index)}
                    className="text-red-500 hover:text-red-700 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>

                {expandedRecipe === index && (
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Recipe Name</label>
                      <input
                        type="text"
                        value={recipe.name}
                        onChange={(e) => updateRecipe(index, 'name', e.target.value)}
                        placeholder="Recipe name..."
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Recipe Link</label>
                      <input
                        type="text"
                        value={recipe.link || ''}
                        onChange={(e) => updateRecipe(index, 'link', e.target.value)}
                        placeholder="Add recipe link..."
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                      />
                      {recipe.link && (
                        <a
                          href={recipe.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-indigo-600 hover:text-indigo-800 text-sm underline"
                        >
                          Open link →
                        </a>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Tags</label>
                      <div className="flex gap-2 mb-2 relative">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={editingRecipeTagInput[index] || ''}
                            onChange={(e) => {
                              setEditingRecipeTagInput({ ...editingRecipeTagInput, [index]: e.target.value });
                              setEditSuggestionIndex({ ...editSuggestionIndex, [index]: -1 });
                            }}
                            placeholder="Add a tag..."
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                            onKeyDown={(e) => {
                              const editSuggestions = getAllTags().filter(tag =>
                                tag.toLowerCase().includes((editingRecipeTagInput[index] || '').toLowerCase()) &&
                                !recipeTags.includes(tag)
                              );
                              const currentIndex = editSuggestionIndex[index] || -1;

                              if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                setEditSuggestionIndex({
                                  ...editSuggestionIndex,
                                  [index]: currentIndex < editSuggestions.length - 1 ? currentIndex + 1 : currentIndex
                                });
                              } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                setEditSuggestionIndex({
                                  ...editSuggestionIndex,
                                  [index]: currentIndex > 0 ? currentIndex - 1 : -1
                                });
                              } else if (e.key === 'Enter') {
                                e.preventDefault();
                                if (currentIndex >= 0 && editSuggestions[currentIndex]) {
                                  addTagToExistingRecipe(index, editSuggestions[currentIndex]);
                                  setEditingRecipeTagInput({ ...editingRecipeTagInput, [index]: '' });
                                  setEditSuggestionIndex({ ...editSuggestionIndex, [index]: -1 });
                                } else {
                                  const tag = editingRecipeTagInput[index]?.trim();
                                  if (tag) {
                                    addTagToExistingRecipe(index, tag);
                                    setEditingRecipeTagInput({ ...editingRecipeTagInput, [index]: '' });
                                  }
                                }
                              } else if (e.key === 'Escape') {
                                setEditSuggestionIndex({ ...editSuggestionIndex, [index]: -1 });
                              }
                            }}
                          />
                          {editingRecipeTagInput[index] && getAllTags().filter(tag =>
                            tag.toLowerCase().includes(editingRecipeTagInput[index].toLowerCase()) &&
                            !recipeTags.includes(tag)
                          ).length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                              {getAllTags().filter(tag =>
                                tag.toLowerCase().includes(editingRecipeTagInput[index].toLowerCase()) &&
                                !recipeTags.includes(tag)
                              ).map((tag, tagIdx) => (
                                <button
                                  key={tagIdx}
                                  onClick={() => {
                                    addTagToExistingRecipe(index, tag);
                                    setEditingRecipeTagInput({ ...editingRecipeTagInput, [index]: '' });
                                    setEditSuggestionIndex({ ...editSuggestionIndex, [index]: -1 });
                                  }}
                                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                    tagIdx === (editSuggestionIndex[index] || -1) ? 'bg-indigo-100' : 'hover:bg-indigo-50'
                                  }`}
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {recipeTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {recipeTags.map((tag, tagIdx) => (
                            <span key={tagIdx} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                              {tag}
                              <button
                                onClick={() => removeTagFromExistingRecipe(index, tag)}
                                className="hover:text-indigo-900"
                              >
                                <X size={14} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
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
            );
          })}
        </div>

        {/* Recently Deleted Button */}
        {foodData.deletedRecipes && foodData.deletedRecipes.length > 0 && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setShowDeletedModal(true)}
              className="px-4 py-2 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-700 transition-all flex items-center gap-2"
            >
              <Trash2 size={16} />
              Recently Deleted ({foodData.deletedRecipes.length})
            </button>
          </div>
        )}
      </div>

      {/* Recently Deleted Modal */}
      {showDeletedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeletedModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Recently Deleted Recipes</h3>
              <button
                onClick={() => setShowDeletedModal(false)}
                className="text-slate-500 hover:text-slate-700 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {(!foodData.deletedRecipes || foodData.deletedRecipes.length === 0) ? (
                <p className="text-slate-500 text-center py-8">No recently deleted recipes</p>
              ) : (
                <div className="space-y-3">
                  {foodData.deletedRecipes.map((recipe, index) => {
                    const recipeTags = recipe.tags || (recipe.tag ? [recipe.tag] : []);
                    const deletedDate = new Date(recipe.deletedAt);
                    const formattedDate = deletedDate.toLocaleDateString() + ' ' + deletedDate.toLocaleTimeString();

                    return (
                      <div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                        <div className="flex justify-between items-start gap-3 mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800">{recipe.name}</h4>
                            <p className="text-xs text-slate-500 mt-1">Deleted on {formattedDate}</p>
                            {recipeTags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {recipeTags.map((tag, tagIdx) => (
                                  <span key={tagIdx} className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            {recipe.description && (
                              <p className="text-sm text-slate-600 mt-2 line-clamp-2">{recipe.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => {
                              restoreRecipe(index);
                              if (foodData.deletedRecipes.length === 1) {
                                setShowDeletedModal(false);
                              }
                            }}
                            className="flex-1 px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-all"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Permanently delete this recipe? This cannot be undone.')) {
                                permanentlyDeleteRecipe(index);
                                if (foodData.deletedRecipes.length === 1) {
                                  setShowDeletedModal(false);
                                }
                              }
                            }}
                            className="flex-1 px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-all"
                          >
                            Delete Forever
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {foodData.deletedRecipes && foodData.deletedRecipes.length > 0 && (
              <div className="p-6 border-t border-slate-200">
                <button
                  onClick={() => {
                    if (window.confirm('Permanently delete all recipes? This cannot be undone.')) {
                      clearAllDeletedRecipes();
                      setShowDeletedModal(false);
                    }
                  }}
                  className="w-full px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-all"
                >
                  Clear All Deleted Recipes
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Food;
