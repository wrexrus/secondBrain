import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { isTokenValid } from '../App';
import Header from '../components/home/Header';
import BrainHero from '../components/home/BrainHero';
import CategoryModal from '../components/home/CategoryModal';
import CreateLinkModal from '../components/home/CreateLinkModal';
import TutorialSection from '../components/home/TutorialSection';
import FeaturesSection from '../components/home/FeaturesSection';
import FeedbackSection from '../components/home/FeedbackSection';
import Footer from '../components/layout/Footer';
import GlobalSearch from '../components/home/GlobalSearch';
import { 
  fetchCategoriesApi, 
  fetchMetadataApi, 
  fetchWebsitesByCategoryApi, 
  deleteWebsiteApi, 
  deleteCategoryApi,
  saveWebsiteApi,
  updateWebsiteApi,
  saveMediaApi
} from '../services/api';
import BASE_URL from '../config/api';
import '../assets/styles/index.css';

// ==========================================
// Constants & Configuration
// ==========================================

const DUMMY_CATEGORIES = ["Ideas", "Inspiration", "Tech", "Design", "Fitness", "Recipes", "Books", "Travel", "Music", "Art", "Movies", "Gaming", "Coding", "Finance", "News", "Health", "Pets", "DIY", "Sports", "Nature"];

// ==========================================
// Main Home Component
// ==========================================

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');
  const initialSubCategory = searchParams.get('sub');

  const [isActive, setIsActive] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || null);
  const [websites, setWebsites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newWebsite, setNewWebsite] = useState({ category: '', subCategory: '', url: '', content: '' });
  const [imageBase64, setImageBase64] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [websiteSuggestions, setWebsiteSuggestions] = useState([]);
  const [metadata, setMetadata] = useState([]);
  const [totalWebsites, setTotalWebsites] = useState(0);
  const [subCategorySuggestions, setSubCategorySuggestions] = useState([]);
  const [activeSubCategory, setActiveSubCategory] = useState(initialSubCategory || "All");
  
  // Global Search State
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [searchMode, setSearchMode] = useState('global');

  const navigate = useNavigate();

  // Read auth state from local storage
  const token = localStorage.getItem("token");
  const isAuthenticated = token && isTokenValid(token);  

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
      if (initialCategory) {
        fetchWebsitesByCategory(initialCategory);
      }
    } else {
      setCategories(DUMMY_CATEGORIES);
    }

    const handleMessage = (event) => {
      // Check if message is from our content script telling us to refresh categories
      if (event.data && event.data.type === "REFRESH_CATEGORIES") {
        fetchCategories();
        setSelectedCategory(null);
        setIsCreatingCategory(false);
        setIsGlobalSearchOpen(false);
        setSearchParams(new URLSearchParams(), { replace: true });
      }
    };
    
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isAuthenticated]);

  // Sync selectedCategory and activeSubCategory to the URL so state persists on refresh
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    let changed = false;
    
    if (selectedCategory) {
      if (params.get('category') !== selectedCategory) {
        params.set('category', selectedCategory);
        changed = true;
      }
    } else {
      if (params.has('category')) {
        params.delete('category');
        changed = true;
      }
    }
    
    if (activeSubCategory !== "All") {
      if (params.get('sub') !== activeSubCategory) {
        params.set('sub', activeSubCategory);
        changed = true;
      }
    } else {
      if (params.has('sub')) {
        params.delete('sub');
        changed = true;
      }
    }
    
    if (changed) {
      setSearchParams(params, { replace: true });
    }
  }, [selectedCategory, activeSubCategory, setSearchParams, searchParams]);

  // Global search shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isAuthenticated) {
          setSearchMode('global');
          setIsGlobalSearchOpen(true);
        } else {
          toast.error("Log in to use Global Search!");
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated]);

  // Prevent body scroll when any modal is open
  useEffect(() => {
    if (isGlobalSearchOpen || selectedCategory || isCreatingCategory) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isGlobalSearchOpen, selectedCategory, isCreatingCategory]);

  const fetchCategories = async () => {
    try {
      const categoriesData = await fetchCategoriesApi(token);
      setCategories(categoriesData);
      
      const metadataRes = await fetchMetadataApi(token);
      if (metadataRes && metadataRes.metadata) {
        setMetadata(metadataRes.metadata);
        setTotalWebsites(metadataRes.totalCount || 0);
      } else {
        setMetadata(metadataRes || []);
      }
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  const fetchWebsitesByCategory = async (categoryName) => {
    setIsLoading(true);
    try {
      const websitesData = await fetchWebsitesByCategoryApi(token, categoryName);
      setWebsites(websitesData);
    } catch (error) {
      console.error("Error fetching websites", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWebsite = async (id) => {
    try {
      await deleteWebsiteApi(token, id);
      // Remove from local state immediately
      setWebsites(prev => prev.filter(site => site._id !== id));
      
      // If that was the last website in the category, refresh the categories to fetch the stub
      if (websites.length === 1) {
        fetchCategories();
      }
    } catch (error) {
      console.error("Error deleting website", error);
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    try {
      await deleteCategoryApi(token, categoryName);
      toast.success(`${categoryName} deleted successfully`);
      fetchCategories();
      closeExpansion();
    } catch (error) {
      console.error("Error deleting category", error);
      toast.error("Failed to delete category");
    }
  };

  const handleUpdateWebsite = async (id, updatedData) => {
    try {
      const updatedSite = await updateWebsiteApi(token, id, updatedData);
      setWebsites(prev => prev.map(site => site._id === id ? updatedSite : site));
      // Refresh categories/metadata just in case the category changed
      if (updatedData.category || updatedData.subCategory !== undefined) {
        fetchCategories();
      }
      return { success: true, site: updatedSite };
    } catch (error) {
      console.error("Error updating website", error);
      toast.error("Error updating website");
      return { success: false };
    }
  };

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    fetchWebsitesByCategory(categoryName);
  };

  const closeExpansion = () => {
    setSelectedCategory(null);
    setWebsites([]);
    setActiveSubCategory("All");
  };

  const handleBrainClick = () => {
    setIsActive(!isActive);
  };

  const handleNewCategoryClick = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Log in to create new Category!");
      return;
    }
    setIsCreatingCategory(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    if (!newWebsite.url?.trim() && !newWebsite.content?.trim() && !imageBase64 && !newWebsite.category?.trim()) {
      toast.error("Please provide at least a Category, URL, Content, or an Image.");
      return;
    }

    setIsLoading(true);
    try {
      if (imageBase64) {
        await saveMediaApi(token, { ...newWebsite, image: imageBase64 });
      } else {
        await saveWebsiteApi(token, newWebsite);
      }
      
      if (selectedCategory === newWebsite.category && newWebsite.subCategory) {
        setActiveSubCategory(newWebsite.subCategory);
        fetchWebsitesByCategory(selectedCategory);
      }
      
      setIsCreatingCategory(false);
      setNewWebsite({ category: '', subCategory: '', url: '', content: '' });
      setImageBase64(null);
      setImagePreview(null);
      fetchCategories(); 
      toast.success("Category saved successfully!");
    } catch (error) {
      console.error("Error saving new category", error);
      toast.error("Error saving category.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryInputChange = (e) => {
    const val = e.target.value;
    
    let formattedVal = val;
    if (val.length > 0) {
      formattedVal = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
    }
    
    setNewWebsite({ ...newWebsite, category: formattedVal });

    if (val.length > 0) {
      const matches = categories.filter(c => c.toLowerCase().startsWith(val.toLowerCase()));
      setWebsiteSuggestions(matches);
    } else {
      setWebsiteSuggestions([]);
    }
  };

  const handleSubCategoryInputChange = (e) => {
    const val = e.target.value;
    
    let formattedVal = val;
    if (val.length > 0) {
      formattedVal = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
    }
    
    setNewWebsite({ ...newWebsite, subCategory: formattedVal });

    if (val.length > 0 && newWebsite.category) {
      const catMeta = metadata.find(m => m.category.toLowerCase() === newWebsite.category.toLowerCase());
      if (catMeta && catMeta.subCategories) {
        const matches = catMeta.subCategories.filter(s => s.toLowerCase().startsWith(val.toLowerCase()));
        setSubCategorySuggestions(matches);
      } else {
        setSubCategorySuggestions([]);
      }
    } else {
      setSubCategorySuggestions([]);
    }
  };

  const getIndicatorText = () => {
    if (!isAuthenticated) {
      return isActive ? "LOG IN TO AWAKEN" : "CLICK TO INITIALIZE";
    }
    return isActive ? "ACTIVE" : "CLICK TO INITIALIZE";
  };

  useEffect(() => {
    if (selectedCategory || isCreatingCategory || isGlobalSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedCategory, isCreatingCategory, isGlobalSearchOpen]);

  return (
    <>
      <Header 
        isAuthenticated={isAuthenticated} 
        setSearchMode={setSearchMode} 
        setIsGlobalSearchOpen={setIsGlobalSearchOpen} 
      />

      <GlobalSearch 
        isOpen={isGlobalSearchOpen} 
        onClose={() => setIsGlobalSearchOpen(false)} 
        token={token} 
        categories={categories}
        onCategoryClick={handleCategoryClick} 
        mode={searchMode}
      />

      <BrainHero 
        isActive={isActive}
        categories={categories}
        isAuthenticated={isAuthenticated}
        setSearchMode={setSearchMode}
        setIsGlobalSearchOpen={setIsGlobalSearchOpen}
        handleCategoryClick={handleCategoryClick}
        handleBrainClick={handleBrainClick}
        getIndicatorText={getIndicatorText}
        handleNewCategoryClick={handleNewCategoryClick}
        totalWebsites={totalWebsites}
      />

      {selectedCategory && (
        <CategoryModal
          selectedCategory={selectedCategory}
          isLoading={isLoading}
          websites={websites}
          activeSubCategory={activeSubCategory}
          setActiveSubCategory={setActiveSubCategory}
          handleDeleteWebsite={handleDeleteWebsite}
          handleDeleteCategory={handleDeleteCategory}
          handleUpdateWebsite={handleUpdateWebsite}
          closeExpansion={closeExpansion}
          setNewWebsite={setNewWebsite}
          setIsCreatingCategory={setIsCreatingCategory}
        />
      )}

      {isCreatingCategory && (
        <CreateLinkModal
          setIsCreatingCategory={setIsCreatingCategory}
          newWebsite={newWebsite}
          setNewWebsite={setNewWebsite}
          handleCreateSubmit={handleCreateSubmit}
          isLoading={isLoading}
          selectedCategory={selectedCategory}
          handleCategoryInputChange={handleCategoryInputChange}
          websiteSuggestions={websiteSuggestions}
          setWebsiteSuggestions={setWebsiteSuggestions}
          handleSubCategoryInputChange={handleSubCategoryInputChange}
          subCategorySuggestions={subCategorySuggestions}
          setSubCategorySuggestions={setSubCategorySuggestions}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          setImageBase64={setImageBase64}
        />
      )}

      <TutorialSection />
      <FeaturesSection />
      <FeedbackSection />
      <Footer />
    </>
  );
};

export default Home;
