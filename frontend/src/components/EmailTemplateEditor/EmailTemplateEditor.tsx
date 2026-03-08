import React, { useState } from 'react';
import { Save, Eye, Code, RefreshCw } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface EmailTemplate {
    _id: string;
    name: string;
    subject: string;
    description: string;
    htmlContent: string;
    variables: string[];
}

interface EmailTemplateEditorProps {
    template: EmailTemplate;
    onClose: () => void;
}

const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({ template, onClose }) => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    const [subject, setSubject] = useState(template.subject);
    const [htmlContent, setHtmlContent] = useState(template.htmlContent);
    const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');

    // Simulate dummy variables for the preview render
    const previewHtml = React.useMemo(() => {
        let parsed = htmlContent;
        template.variables.forEach(v => {
            // Replace e.g. {{name}} with a highlighted span indicating dummy data
            const rawVar = v.replace(/[{}]/g, ''); // Extract 'name' from '{{name}}'
            const dummyValue = `<span style="background-color: #fef08a; padding: 2px 4px; border-radius: 4px; font-weight: bold; color: #854d0e;">[${rawVar}]</span>`;
            const regex = new RegExp(v, 'g');
            parsed = parsed.replace(regex, dummyValue);
        });
        return parsed;
    }, [htmlContent, template.variables]);

    const saveMutation = useMutation({
        mutationFn: async () => {
            return api.put(`/admin/email-templates/${template._id}`, {
                subject,
                htmlContent
            });
        },
        onSuccess: () => {
            addToast('Email template saved successfully', 'success');
            queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
            onClose();
        },
        onError: () => {
            addToast('Failed to save email template', 'error');
        }
    });

    const handleInsertVariable = (variable: string) => {
        setHtmlContent(prev => prev + variable);
    };

    return (
        <div className="flex flex-col h-[80vh] bg-transparent overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Edit Template: {template.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 m-0">{template.description}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => saveMutation.mutate()}
                        disabled={saveMutation.isPending}
                        className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 shadow-sm"
                    >
                        {saveMutation.isPending ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Template
                    </button>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex flex-col flex-1 overflow-hidden p-6 gap-6">

                {/* Subject Line */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subject Line</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-white transition-all font-medium"
                        placeholder="Enter email subject"
                    />
                </div>

                {/* Editor Container */}
                <div className="flex flex-col flex-1 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800/50">

                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50">
                        <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('code')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'code' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                <Code size={16} /> HTML Code
                            </button>
                            <button
                                onClick={() => setViewMode('preview')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'preview' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                <Eye size={16} /> Live Preview
                            </button>
                        </div>

                        {/* Variables Tool */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:block">Variables:</span>
                            {template.variables.map(v => (
                                <button
                                    key={v}
                                    onClick={() => handleInsertVariable(v)}
                                    className="px-2 py-1 text-xs font-mono bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                                    title={`Insert ${v} into copy`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Viewport */}
                    <div className="flex-1 overflow-auto relative">
                        {viewMode === 'code' ? (
                            <textarea
                                value={htmlContent}
                                onChange={(e) => setHtmlContent(e.target.value)}
                                className="absolute inset-0 w-full p-4 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm leading-relaxed resize-none focus:outline-none"
                                spellCheck={false}
                                placeholder="<h1>Write your HTML code here</h1>"
                            />
                        ) : (
                            <div className="absolute inset-0 w-full p-8 bg-white text-slate-800 font-sans overflow-y-auto">
                                {/* Sanitize in real app, dangerouslySetInnerHTML okay for trusted admin dashboard feature */}
                                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EmailTemplateEditor;
