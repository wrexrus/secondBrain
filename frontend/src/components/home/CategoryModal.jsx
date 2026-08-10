import { useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2, Plus, X } from 'lucide-react';
import DeleteConfirmModal from './CategoryModalComponents/DeleteConfirmModal';
import ViewWebsiteModal from './CategoryModalComponents/ViewWebsiteModal';
import CategoryItemCard from './CategoryModalComponents/CategoryItemCard';

import BASE_URL from '../../config/api';

const CategoryModal = ({
  selectedCategory,
  isLoading,
  websites,
  activeSubCategory,
  setActiveSubCategory,
  handleDeleteWebsite,
  handleDeleteCategory,
  handleUpdateWebsite,
  closeExpansion,
  setNewWebsite,
  setIsCreatingCategory
}) => {
  const [editingSiteId, setEditingSiteId] = useState(null);
  const [viewingSite, setViewingSite] = useState(null);
  const [isEditingView, setIsEditingView] = useState(false);
  const [editFormData, setEditFormData] = useState({ url: '', content: '', category: '', subCategory: '', image: null, imagePreview: null, aiEnabled: false });
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFormData(prev => ({ ...prev, image: reader.result, imagePreview: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setEditFormData(prev => ({ ...prev, image: null, imagePreview: null }));
    }
  };

  const startEdit = (site) => {
    setEditingSiteId(site._id);
    setEditFormData({
      url: site.url || '',
      content: site.content || '',
      category: site.category || '',
      subCategory: site.subCategory || '',
      image: null,
      imagePreview: null,
      aiEnabled: site.aiEnabled || false   // seed from the DB value
    });
  };

  const handleEditSubmit = async (e, id) => {
    e.preventDefault();
    setIsUpdating(true);
    const result = await handleUpdateWebsite(id, editFormData);
    if (result && result.success) {
      if (isEditingView && viewingSite && viewingSite._id === id) {
        setViewingSite(result.site);
        setIsEditingView(false);
      }
      setEditingSiteId(null);
    }
    setIsUpdating(false);
  };

  const downloadImage = async (e, imagePath) => {
    e.stopPropagation();
    try {
      const url = imagePath.startsWith('http') ? imagePath : `${BASE_URL}${imagePath}`;
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = downloadUrl;
      a.download = `synapse_image_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image.');
    }
  };

  const confirmBulkDelete = () => {
    handleDeleteCategory(selectedCategory);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="expansion-view custom-scrollbar glass-panel" style={{ 
      position: 'fixed', 
      top: '2%', 
      left: '2%', 
      right: '2%',
      bottom: '2%',
      animation: 'slowZoomFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards', 
      padding: '3rem 2rem', 
      zIndex: 100,
      overflowY: viewingSite ? 'hidden' : 'auto',
      overflowX: 'hidden'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 style={{ color: 'var(--text-color)', textTransform: 'capitalize', fontSize: '2.2rem', fontFamily: 'Comfortaa, cursive', fontWeight: '700', margin: 0 }}>
            {selectedCategory}
          </h2>
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="btn-icon-danger"
            style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
            title="Delete Entire Category"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => {
              setNewWebsite({ category: selectedCategory, subCategory: '', url: '', content: '' });
              setIsCreatingCategory(true);
            }}
            className="btn-primary-outline"
            style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center' }}
          >
            <Plus size={18} style={{ marginRight: '0.5rem' }} />
            New SubCategory
          </button>
          
          <button
            onClick={() => {
              setNewWebsite({ 
                category: selectedCategory, 
                subCategory: activeSubCategory === "All" ? '' : activeSubCategory, 
                url: '', 
                content: '' 
              });
              setIsCreatingCategory(true);
            }}
            className="btn-primary"
            style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center' }}
          >
            <Plus size={18} style={{ marginRight: '0.5rem' }} />
            Add Content
          </button>
          <button 
            onClick={closeExpansion} 
            className="btn-icon-danger"
            style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <div className="loader"></div>
        </div>
      ) : (
        <>
          {(() => {
            const subs = new Set();
            websites.forEach(s => { if (s.subCategory) subs.add(s.subCategory) });
            const subsArray = Array.from(subs);
            if (subsArray.length > 0) {
              return (
                <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <button
                    onClick={() => setActiveSubCategory("All")}
                    style={{
                      padding: '0.5rem 1.2rem',
                      borderRadius: '20px',
                      background: activeSubCategory === "All" ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                      color: activeSubCategory === "All" ? '#000' : 'var(--text-muted)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                      fontWeight: activeSubCategory === "All" ? 'bold' : 'normal'
                    }}
                  >
                    All
                  </button>
                  {subsArray.map(sub => (
                    <button
                      key={sub}
                      onClick={() => setActiveSubCategory(sub)}
                      style={{
                        padding: '0.5rem 1.2rem',
                        borderRadius: '20px',
                        background: activeSubCategory === sub ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        color: activeSubCategory === sub ? '#000' : 'var(--text-muted)',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                        fontWeight: activeSubCategory === sub ? 'bold' : 'normal'
                      }}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              );
            }
            return null;
          })()}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem', paddingBottom: '4rem' }}>
            {websites.filter(site => activeSubCategory === "All" || site.subCategory === activeSubCategory).map(site => (
              <CategoryItemCard 
                key={site._id}
                site={site}
                activeSubCategory={activeSubCategory}
                editingSiteId={editingSiteId}
                editFormData={editFormData}
                setEditFormData={setEditFormData}
                handleEditImageChange={handleEditImageChange}
                handleEditSubmit={handleEditSubmit}
                setEditingSiteId={setEditingSiteId}
                isUpdating={isUpdating}
                handleDeleteWebsite={handleDeleteWebsite}
                setViewingSite={setViewingSite}
                startEdit={startEdit}
                setIsEditingView={setIsEditingView}
              />
            ))}
          </div>
        </>
      )}
      </div>

      <ViewWebsiteModal 
        viewingSite={viewingSite}
        setViewingSite={setViewingSite}
        startEdit={startEdit}
        downloadImage={downloadImage}
        isEditingView={isEditingView}
        setIsEditingView={setIsEditingView}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        handleEditImageChange={handleEditImageChange}
        handleEditSubmit={handleEditSubmit}
        isUpdating={isUpdating}
      />

      <DeleteConfirmModal 
        show={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmBulkDelete}
        categoryName={selectedCategory}
      />

    </div>
  );
};

export default CategoryModal;
