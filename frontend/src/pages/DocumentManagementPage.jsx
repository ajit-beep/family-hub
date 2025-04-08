// frontend/src/pages/DocumentManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { Link, useNavigate } from 'react-router-dom';

// Define category choices matching the backend model for the form
const CATEGORY_CHOICES = [
    { code: 'MD', label: 'Medical' },
    { code: 'ID', label: 'Identity' },
    { code: 'FN', label: 'Financial' },
    { code: 'LG', label: 'Legal' },
    { code: 'AG', label: 'Agreement' },
    { code: 'OT', label: 'Other' },
];

function DocumentManagementPage() {
    const { isAuthenticated, isLoading: authLoading, familyId } = useAuth();
    const navigate = useNavigate();

    // State for the document list
    const [documents, setDocuments] = useState([]);
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState(null);

    // State for the upload form
    const [fileToUpload, setFileToUpload] = useState(null);
    const [documentName, setDocumentName] = useState('');
    const [documentCategory, setDocumentCategory] = useState('OT'); // Default to 'Other'
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    // State for deleting
    const [deletingId, setDeletingId] = useState(null);
    const [deleteError, setDeleteError] = useState(null);

    // --- Fetching Documents ---
    const fetchDocuments = useCallback(async () => {
        if (!isAuthenticated || !familyId) { // Need to be in a family to have documents
             setDocuments([]); // Clear documents if not in family
             setListLoading(false);
             return;
        }
        console.log("Fetching documents...");
        setListLoading(true);
        setListError(null);
        setUploadError(null); // Clear action errors
        setDeleteError(null);
        try {
            const response = await axiosInstance.get('/api/records/documents/');
            setDocuments(response.data || []); // Ensure it's an array
        } catch (err) {
            console.error("Error fetching documents:", err.response?.data || err.message);
            setListError("Could not load documents. Please try again later.");
            setDocuments([]);
        } finally {
            setListLoading(false);
        }
    }, [isAuthenticated, familyId]); // Depend on auth state and familyId

    // Initial fetch
    useEffect(() => {
        if (!authLoading) { // Run only after initial auth check
            fetchDocuments();
        }
    }, [authLoading, fetchDocuments]); // Rerun if auth state changes

    // --- Handle File Selection ---
    const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setFileToUpload(event.target.files[0]);
        } else {
            setFileToUpload(null);
        }
    };

    // --- Handle Document Upload ---
    const handleUploadSubmit = async (event) => {
        event.preventDefault();
        if (!fileToUpload || !documentName || !documentCategory) {
            setUploadError("Please provide a name, category, and select a file.");
            return;
        }

        setUploading(true);
        setUploadError(null);
        setDeleteError(null); // Clear other errors

        const formData = new FormData();
        formData.append('name', documentName);
        formData.append('category_code', documentCategory); // Send the code
        formData.append('file', fileToUpload);

        try {
            const response = await axiosInstance.post('/api/records/documents/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log("Upload successful:", response.data);
            // Clear form and refetch list
            setDocumentName('');
            setDocumentCategory('OT');
            setFileToUpload(null);
            // Reset the file input visually (find a better way if needed)
            const fileInput = document.getElementById('fileUploadInput');
            if (fileInput) fileInput.value = "";

            await fetchDocuments(); // Refresh the list

        } catch (err) {
            console.error("Error uploading document:", err.response?.data || err.message);
            setUploadError(err.response?.data?.detail || "Failed to upload document.");
        } finally {
            setUploading(false);
        }
    };

    // --- Handle Document Deletion ---
    const handleDelete = async (docId, docName) => {
         if (!window.confirm(`Are you sure you want to delete the document "${docName}"?`)) {
             return;
         }
        setDeletingId(docId);
        setDeleteError(null);
        setUploadError(null); // Clear other errors

        try {
            await axiosInstance.delete(`/api/records/documents/${docId}/`);
            console.log(`Document ${docId} deleted.`);
            await fetchDocuments(); // Refresh list
        } catch (err) {
            console.error("Error deleting document:", err.response?.data || err.message);
            setDeleteError(`Failed to delete ${docName}.`);
        } finally {
            setDeletingId(null);
        }
    };


    // --- Render Logic ---
    if (authLoading) {
        return <p>Loading application...</p>;
    }

    if (!isAuthenticated) {
        // Should be handled by protected route, but as a fallback:
        navigate('/login'); // Redirect to login
        return null; // Avoid rendering anything further
    }

     if (!familyId) {
        return (
            <div>
                <h2>Documents</h2>
                <p>You must <Link to="/">create or join a family</Link> first to manage documents.</p>
            </div>
        )
    }

    return (
        <div>
            <h2>Family Documents</h2>

            {/* --- Upload Form --- */}
            <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', backgroundColor: '#f0f0f0' }}>
                <h4>Upload New Document</h4>
                <form onSubmit={handleUploadSubmit}>
                    <div style={{ marginBottom: '10px' }}>
                        <label htmlFor="docName">Document Name: </label>
                        <input
                            type="text" id="docName" value={documentName}
                            onChange={(e) => setDocumentName(e.target.value)}
                            required disabled={uploading}
                        />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label htmlFor="docCategory">Category: </label>
                        <select
                            id="docCategory" value={documentCategory}
                            onChange={(e) => setDocumentCategory(e.target.value)}
                            required disabled={uploading}
                        >
                            {CATEGORY_CHOICES.map(cat => (
                                <option key={cat.code} value={cat.code}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label htmlFor="fileUploadInput">File: </label>
                        <input
                            type="file" id="fileUploadInput"
                            onChange={handleFileChange}
                            required disabled={uploading}
                        />
                    </div>
                    {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}
                    <button type="submit" disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Upload Document'}
                    </button>
                </form>
            </div>

            {/* --- Document List --- */}
            <h4>Existing Documents</h4>
            {listLoading && <p>Loading documents...</p>}
            {listError && <p style={{ color: 'red' }}>{listError} <button onClick={fetchDocuments}>Retry</button></p>}
            {deleteError && <p style={{ color: 'red' }}>{deleteError}</p>}

            {!listLoading && !listError && documents.length === 0 && (
                <p>No documents found for your family.</p>
            )}

            {!listLoading && !listError && documents.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {documents.map(doc => (
                        <li key={doc.id} style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            <div><strong>Name:</strong> {doc.name}</div>
                            <div><strong>Category:</strong> {doc.category}</div>
                            <div><strong>Uploaded:</strong> {new Date(doc.uploaded_at).toLocaleString()}</div>
                            <div>
                                <a href={doc.file} target="_blank" rel="noopener noreferrer" style={{ marginRight: '15px' }}>
                                    View/Download File
                                </a>
                                <button
                                    onClick={() => handleDelete(doc.id, doc.name)}
                                    disabled={deletingId === doc.id}
                                    style={{ color: 'red', cursor: 'pointer' }}
                                >
                                    {deletingId === doc.id ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default DocumentManagementPage;