import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import { FileUp, FileText, CheckCircle, Trash2, ExternalLink } from 'lucide-react';
import './Resumes.css';
import api from '../../services/api';

const Resumes = () => {
    const { addToast } = useToast();
    const [resumes, setResumes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            const res = await api.get('/upload/resumes');
            setResumes(res.data.data);
        } catch (error) {
            addToast('Failed to load resumes', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            addToast('Only PDF files are allowed', 'warning');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            addToast('File must be smaller than 5MB', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('resume', file);

        setIsUploading(true);
        try {
            await api.post('/upload/resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            addToast('Resume uploaded and analyzed successfully', 'success');
            fetchResumes();
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to upload resume', 'error');
        } finally {
            setIsUploading(false);
            // Reset input
            e.target.value = null;
        }
    };

    const handleSetActive = async (id) => {
        try {
            await api.put(`/upload/resumes/${id}/activate`);
            addToast('Active resume updated', 'success');
            fetchResumes();
        } catch (error) {
            addToast('Failed to set active resume', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this resume?')) return;
        try {
            await api.delete(`/upload/resumes/${id}`);
            addToast('Resume deleted', 'success');
            fetchResumes();
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to delete', 'error');
        }
    };

    if (isLoading) return <Loader />;

    return (
        <div className="resumes-container animate-fade-in">
            <div className="page-header">
                <h1 className="page-heading">Resume Management</h1>
                <p className="page-subheading">Upload and manage your resume versions.</p>
            </div>

            <div className="resumes-grid">

                {/* Upload Section */}
                <Card className="upload-card">
                    <div className="upload-dropzone">
                        <FileUp size={48} className="upload-icon" />
                        <h3>Upload New Resume</h3>
                        <p className="text-muted">PDFs only (Max 5MB)</p>
                        <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '1.5rem' }}>
                            Our AI will automatically scan and extract your technical skills to improve your match score.
                        </p>

                        <input
                            type="file"
                            id="resume-upload"
                            accept=".pdf"
                            className="hidden-input"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                        <label htmlFor="resume-upload" className={`btn btn-primary ${isUploading ? 'btn-loading' : ''}`}>
                            {isUploading ? <span className="btn-spinner"></span> : 'Select File'}
                        </label>
                    </div>
                </Card>

                {/* Versions List */}
                <div className="resume-versions">
                    <h2 className="section-title">Version History</h2>

                    {resumes.length === 0 ? (
                        <div className="empty-state-card">
                            <FileText size={40} className="text-muted" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                            <p>You haven't uploaded any resumes yet.</p>
                        </div>
                    ) : (
                        <div className="versions-list">
                            {resumes.map(resume => (
                                <Card key={resume._id} className={`resume-item ${resume.isActive ? 'active-item' : ''}`}>
                                    <div className="resume-info">
                                        <div className="resume-meta">
                                            <span className="version-tag">v{resume.version}</span>
                                            {resume.isActive && <span className="status-badge active"><CheckCircle size={12} /> Active</span>}
                                        </div>
                                        <p className="upload-date">
                                            Uploaded on {new Date(resume.uploadedAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="resume-actions">
                                        <a href={resume.fileUrl} target="_blank" rel="noreferrer" className="action-btn view">
                                            <ExternalLink size={18} />
                                        </a>

                                        {!resume.isActive && (
                                            <button className="action-btn set-active" onClick={() => handleSetActive(resume._id)} title="Set as Active">
                                                <CheckCircle size={18} />
                                            </button>
                                        )}

                                        <button className="action-btn delete" onClick={() => handleDelete(resume._id)} disabled={resume.isActive} title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Resumes;
