import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Loader2, Camera, CheckCircle, XCircle, Search } from "lucide-react";
import { menuAPI } from "../api/menuApi";
import { foodAPI } from "../api/foodApi";
import { fileAPI } from "../api/fileUploadApi";
import menuBanner from "../assets/menubanner.webp";
import backgroundImage from "../assets/background.jpg";

const DEFAULT_FOOD_PAGE_SIZE = 6;

export default function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [savingCategory, setSavingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  const [nameInput, setNameInput] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Food items state
  const [foods, setFoods] = useState([]);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [savingFood, setSavingFood] = useState(false);
  const [foodError, setFoodError] = useState("");

  const [foodIdEditing, setFoodIdEditing] = useState(null);
  const [foodName, setFoodName] = useState("");
  const [foodDescription, setFoodDescription] = useState("");
  const [foodPrice, setFoodPrice] = useState("");
  const [foodAvailable, setFoodAvailable] = useState(true);
  const [foodCategoryId, setFoodCategoryId] = useState("");
  const [foodImageUrl, setFoodImageUrl] = useState("");
  const [uploadingFoodImage, setUploadingFoodImage] = useState(false);

  // Form visibility state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [foodPageMeta, setFoodPageMeta] = useState({
    page: 0,
    size: DEFAULT_FOOD_PAGE_SIZE,
    totalPages: 1,
    totalElements: 0,
  });

  const foodCountByCategory = foods.reduce((acc, food) => {
    const key = food.categoryId != null ? String(food.categoryId) : null;
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  useEffect(() => {
    const init = async () => {
      await fetchCategories();
      await fetchFoods(0);
    };

    init();
  }, []);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    setCategoryError("");
    try {
      const res = await menuAPI.getCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to load menu categories", err);
      setCategoryError("Failed to load menu categories. Please try again.");
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchFoods = async (page = 0) => {
    const size = DEFAULT_FOOD_PAGE_SIZE;
    setLoadingFoods(true);
    setFoodError("");
    try {
      const res = await foodAPI.getFoods(page, size);
      const payload = res?.data;
      const content = Array.isArray(payload?.content)
        ? payload.content
        : Array.isArray(payload)
          ? payload
          : [];
      setFoods(content);
      setFoodPageMeta({
        page: payload?.number ?? page,
        size,
        totalPages: Math.max(payload?.totalPages ?? 1, 1),
        totalElements: payload?.totalElements ?? content.length,
      });
    } catch (err) {
      console.error("Failed to load foods", err);
      const msg = err?.response?.data?.message || "Failed to load food items. Please try again.";
      setFoodError(msg);
      setFoods([]);
      setFoodPageMeta((prev) => ({ ...prev, page, size }));
    } finally {
      setLoadingFoods(false);
    }
  };

  const resetForm = () => {
    setNameInput("");
    setEditingId(null);
    setShowCategoryForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = nameInput.trim();
    if (!trimmedName) return;

    const normalizedInput = trimmedName.toLowerCase();
    const duplicateExists = !editingId && categories.some((category) => {
      const candidate = (category.name || "").trim().toLowerCase();
      return candidate === normalizedInput;
    });

    if (duplicateExists) {
      setCategoryError("plz use different category name");
      return;
    }

    setSavingCategory(true);
    setCategoryError("");

    try {
      if (editingId) {
        await menuAPI.updateCategory(editingId, trimmedName);
      } else {
        await menuAPI.createCategory(trimmedName);
      }
      await fetchCategories();
      resetForm();
    } catch (err) {
      console.error("Failed to save category", err);
      const msg = err?.response?.data?.message || "Failed to save category. Please try again.";
      setCategoryError(msg);
    } finally {
      setSavingCategory(false);
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setNameInput(category.name || "");
    setShowCategoryForm(true);
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;

    setSavingCategory(true);
    setCategoryError("");
    try {
      await menuAPI.deleteCategory(category.id);
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
    } catch (err) {
      console.error("Failed to delete category", err);
      const msg = err?.response?.data?.message || "Failed to delete category. Please try again.";
      setCategoryError(msg);
    } finally {
      setSavingCategory(false);
    }
  };

  const resetFoodForm = () => {
    setFoodIdEditing(null);
    setFoodName("");
    setFoodDescription("");
    setFoodPrice("");
    setFoodAvailable(true);
    setFoodCategoryId("");
    setFoodImageUrl("");
    setUploadingFoodImage(false);
    setShowFoodForm(false);
  };

  const handleFoodImageUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    try {
      setUploadingFoodImage(true);
      const res = await fileAPI.upload(file);
      const url = res.data;
      setFoodImageUrl(url);
    } catch (err) {
      console.error("Failed to upload food image", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingFoodImage(false);
    }
  };

  const handleFoodSubmit = async (e) => {
    e.preventDefault();

    if (!foodName.trim() || !foodPrice || !foodCategoryId) return;

    const payload = {
      categoryId: Number(foodCategoryId),
      name: foodName.trim(),
      description: foodDescription.trim(),
      price: Number(foodPrice),
      available: Boolean(foodAvailable),
      imageUrl: foodImageUrl || null,
    };

    setSavingFood(true);
    setFoodError("");

    try {
      if (foodIdEditing) {
        await foodAPI.updateFood(foodIdEditing, payload);
      } else {
        await foodAPI.createFood(payload);
      }

      await fetchFoods(foodPageMeta.page);
      resetFoodForm();
    } catch (err) {
      console.error("Failed to save food", err);
      const msg = err?.response?.data?.message || "Failed to save food item. Please try again.";
      setFoodError(msg);
    } finally {
      setSavingFood(false);
    }
  };

  const startEditFood = (food) => {
    setFoodIdEditing(food.id);
    setFoodName(food.name || "");
    setFoodDescription(food.description || "");
    setFoodPrice(food.price != null ? String(food.price) : "");
    setFoodAvailable(food.available);
    setFoodCategoryId(food.categoryId != null ? String(food.categoryId) : "");
    setFoodImageUrl(food.imageUrl || "");
    setShowFoodForm(true);
  };

  const handleDeleteFood = async (food) => {
    if (!window.confirm(`Delete food item "${food.name}"?`)) return;

    setSavingFood(true);
    setFoodError("");
    try {
      await foodAPI.deleteFood(food.id);
      const shouldMoveBack = foods.length === 1 && foodPageMeta.page > 0;
      const nextPage = shouldMoveBack ? foodPageMeta.page - 1 : foodPageMeta.page;
      await fetchFoods(nextPage);
    } catch (err) {
      console.error("Failed to delete food", err);
      const msg = err?.response?.data?.message || "Failed to delete food item. Please try again.";
      setFoodError(msg);
    } finally {
      setSavingFood(false);
    }
  };

  const handlePageChange = (direction) => {
    if (loadingFoods) return;
    const delta = direction === "next" ? 1 : -1;
    const nextPage = foodPageMeta.page + delta;
    if (nextPage < 0 || nextPage >= foodPageMeta.totalPages) return;
    fetchFoods(nextPage);
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredFoods = !normalizedSearch
    ? foods
    : foods.filter((food) => {
        const name = (food.name || "").toLowerCase();
        const description = (food.description || "").toLowerCase();
        return name.includes(normalizedSearch) || description.includes(normalizedSearch);
      });

  // Group foods by category
  const groupedFoods = categories.reduce((acc, category) => {
    const categoryFoods = filteredFoods.filter((food) => food.categoryId === category.id);
    if (categoryFoods.length > 0) {
      acc.push({
        category,
        foods: categoryFoods,
      });
    }
    return acc;
  }, []);

  // Foods without a category
  const uncategorizedFoods = filteredFoods.filter(
    (food) => !categories.some((cat) => cat.id === food.categoryId)
  );

  const showingResultsCount = filteredFoods.length;
  const paginationStart = showingResultsCount === 0 ? 0 : foodPageMeta.page * foodPageMeta.size + 1;
  const paginationEnd = showingResultsCount === 0 ? 0 : paginationStart + showingResultsCount - 1;
  const canGoPrev = foodPageMeta.page > 0;
  const canGoNext = foodPageMeta.page < foodPageMeta.totalPages - 1;
  const showPagination = !normalizedSearch && !loadingFoods && foodPageMeta.totalElements > 0;

  return (
    <div
      className="relative min-h-screen py-8 overflow-hidden bg-gray-50"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
      }}
    >
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative mb-8 rounded-3xl overflow-hidden shadow-xl">
          <img
            src={menuBanner}
            alt="Menu banner"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 space-y-3">
            <span
              className="text-white text-3xl sm:text-4xl tracking-[0.4em]"
              style={{ fontFamily: 'Impact, sans-serif', fontWeight: '400' }}
            >
              YOUR MENU
            </span>
              <p
                className="text-white text-base sm:text-lg tracking-[0.3em] uppercase"
                style={{ fontFamily: 'sans-serif', fontWeight: '400' }}
              >
                Craft every dish with intent
              </p>
          </div>
        </div>
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-800">Menu</h1>
            <p className="text-gray-600 mt-1">
              Manage your menu categories and food items.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowCategoryForm(!showCategoryForm)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Category</span>
            </button>
            <button
              onClick={() => setShowFoodForm(!showFoodForm)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Food</span>
            </button>
          </div>
        </div>

        {showCategoryForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingId ? "Edit Category" : "Add New Category"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category name
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Starters, Main Course, Desserts"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingCategory || !nameInput.trim()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed transition min-w-[140px]"
            >
              {savingCategory ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{editingId ? "Update Category" : "Add Category"}</span>
                </>
              )}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            )}
          </form>

          {categoryError && (
            <p className="mt-3 text-sm text-red-600">{categoryError}</p>
          )}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Existing Categories</h2>
          </div>

          {loadingCategories ? (
            <div className="py-8 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-orange-600 animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <div className="py-8 px-6 text-center text-gray-500">
              No categories yet. Create your first category above.
            </div>
          ) : (
            <div className="px-6 py-5">
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
                {categories.map((category) => {
                  const categoryKey = category.id != null ? String(category.id) : '';
                  const foodCount = foodCountByCategory[categoryKey] || 0;
                  return (
                    <div
                      key={category.id}
                      className="min-w-[230px] flex-shrink-0 snap-start bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm"
                    >
                      <div>
                        <p className="text-sm uppercase tracking-wide text-gray-500">Category</p>
                        <h3 className="text-lg font-semibold text-gray-800 mt-1">{category.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{foodCount} {foodCount === 1 ? 'item' : 'items'}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(category)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-white"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-white"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Food items section */}
        <div className="mt-8 space-y-6">
          {showFoodForm && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {foodIdEditing ? "Edit Food Item" : "Add New Food Item"}
                </h2>
              </div>
              <form onSubmit={handleFoodSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g. Margherita Pizza"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={foodDescription}
                  onChange={(e) => setFoodDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[80px]"
                  placeholder="Short description of the dish"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={foodPrice}
                    onChange={(e) => setFoodPrice(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g. 12.99"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={foodCategoryId}
                    onChange={(e) => setFoodCategoryId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dish Image (optional)</label>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                      {uploadingFoodImage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                      <span>{uploadingFoodImage ? "Uploading..." : "Upload image"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFoodImageUpload(e.target.files[0])}
                        disabled={uploadingFoodImage}
                      />
                    </label>
                    {foodImageUrl && (
                      <img
                        src={foodImageUrl}
                        alt="Dish preview"
                        className="w-12 h-12 rounded-md object-cover border border-gray-200"
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 sm:mt-7">
                  <input
                    id="food-available"
                    type="checkbox"
                    checked={foodAvailable}
                    onChange={(e) => setFoodAvailable(e.target.checked)}
                    className="h-4 w-4 text-orange-600 border-gray-300 rounded"
                  />
                  <label htmlFor="food-available" className="text-sm text-gray-700">
                    Available
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-2">
                <button
                  type="submit"
                  disabled={
                    savingFood ||
                    !foodName.trim() ||
                    !foodPrice ||
                    !foodCategoryId
                  }
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed transition"
                >
                  {savingFood ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>{foodIdEditing ? "Update Food" : "Add Food"}</span>
                    </>
                  )}
                </button>

                {foodIdEditing && (
                  <button
                    type="button"
                    onClick={resetFoodForm}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {foodError && (
                <p className="mt-3 text-sm text-red-600">{foodError}</p>
              )}
            </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Food Items by Category</h2>
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <label htmlFor="menu-search" className="sr-only">Search menu items</label>
                <input
                  id="menu-search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or description..."
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm"
                />
              </div>
            </div>

            {loadingFoods ? (
              <div className="py-8 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-orange-600 animate-spin" />
              </div>
            ) : foods.length === 0 ? (
              <div className="py-8 px-6 text-center text-gray-500">
                No food items yet. Add your first dish using the form.
              </div>
            ) : filteredFoods.length === 0 ? (
              <div className="py-8 px-6 text-center text-gray-500">
                No dishes match "{searchTerm.trim()}". Try another keyword.
              </div>
            ) : (
              <>
              <div className="divide-y divide-gray-200">
                {groupedFoods.map(({ category, foods: categoryFoods }) => (
                  <div key={category.id} className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-orange-500 pb-2 inline-block">
                      {category.name}
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {categoryFoods.map((food) => (
                        <div
                          key={food.id}
                          className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                        >
                          {/* Food Image */}
                          <div className="flex-shrink-0 self-center sm:self-start">
                            {food.imageUrl ? (
                              <img
                                src={food.imageUrl}
                                alt={food.name}
                                className="w-32 h-32 sm:w-24 sm:h-24 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-32 h-32 sm:w-24 sm:h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400 text-xs text-center px-2">No image</span>
                              </div>
                            )}
                          </div>

                          {/* Food Details */}
                          <div className="flex-1 min-w-0 flex flex-col">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="font-semibold text-gray-800 text-lg">{food.name}</h4>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {food.available ? (
                                  <>
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="text-xs text-green-600 font-medium hidden sm:inline">Available</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-5 h-5 text-red-600" />
                                    <span className="text-xs text-red-600 font-medium hidden sm:inline">Unavailable</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 mb-3 flex-1">
                              {food.description || "No description"}
                            </p>
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <p className="text-xl font-bold text-orange-600">
                                ${Number(food.price).toFixed(2)}
                              </p>

                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditFood(food)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFood(food)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Uncategorized Foods */}
                {uncategorizedFoods.length > 0 && (
                  <div className="p-6 bg-gray-50">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-400 pb-2 inline-block">
                      Uncategorized
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {uncategorizedFoods.map((food) => (
                        <div
                          key={food.id}
                          className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition"
                        >
                          {/* Food Image */}
                          <div className="flex-shrink-0 self-center sm:self-start">
                            {food.imageUrl ? (
                              <img
                                src={food.imageUrl}
                                alt={food.name}
                                className="w-32 h-32 sm:w-24 sm:h-24 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-32 h-32 sm:w-24 sm:h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400 text-xs text-center px-2">No image</span>
                              </div>
                            )}
                          </div>

                          {/* Food Details */}
                          <div className="flex-1 min-w-0 flex flex-col">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="font-semibold text-gray-800 text-lg">{food.name}</h4>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {food.available ? (
                                  <>
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="text-xs text-green-600 font-medium hidden sm:inline">Available</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-5 h-5 text-red-600" />
                                    <span className="text-xs text-red-600 font-medium hidden sm:inline">Unavailable</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 mb-3 flex-1">
                              {food.description || "No description"}
                            </p>
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <p className="text-xl font-bold text-orange-600">
                                ${Number(food.price).toFixed(2)}
                              </p>

                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditFood(food)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFood(food)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {showPagination && (
                <div className="border-t border-gray-200 px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold text-gray-800">{paginationStart}-{paginationEnd}</span> of{" "}
                    <span className="font-semibold text-gray-800">{foodPageMeta.totalElements}</span> dishes
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
                    {/* <p className="text-sm text-gray-600">Per page: {DEFAULT_FOOD_PAGE_SIZE}</p> */}

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handlePageChange("prev")}
                        disabled={!canGoPrev}
                        className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 disabled:text-gray-400 disabled:border-gray-200 hover:bg-gray-50 disabled:hover:bg-transparent"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600 font-medium">
                        Page {foodPageMeta.page + 1} / {foodPageMeta.totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePageChange("next")}
                        disabled={!canGoNext}
                        className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 disabled:text-gray-400 disabled:border-gray-200 hover:bg-gray-50 disabled:hover:bg-transparent"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
