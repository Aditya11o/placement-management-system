import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Send, SkipForward, Mail } from 'lucide-react';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { useToast } from '../../context/ToastContext';

// Extend base Application to support UI specific fields passed from ApplicantReview
export interface MessageRecipient {
    _id: string;
    student?: { name: string; email: string; resume_url?: string; cgpa?: number; skills?: string[] };
    job?: { _id: string; title: string };
}

interface ComposeMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSkip?: () => void;
    recipients: MessageRecipient[];
    defaultSubject?: string;
    defaultBody?: string;
    requireAction?: boolean; // If true, implies this was triggered by a status change and needs a generic Skip button
}

const messageSchema = z.object({
    subject: z.string().min(1, 'Subject is required'),
    body: z.string().min(5, 'Message body is too short')
});

type MessageFormData = z.infer<typeof messageSchema>;

export const TEMPLATES = [
    {
        label: "Standard Rejection",
        subject: "Update on your application at our company",
        body: "Hi {{candidate_name}},\n\nThank you for taking the time to apply and speak with our team. While we were impressed with your background, we have decided to move forward with other candidates whose experience better aligns with our current needs.\n\nWe wish you the best of luck in your job search.\n\nBest regards,\nThe Hiring Team"
    },
    {
        label: "Next Steps / Shortlist",
        subject: "Next steps for your application!",
        body: "Hi {{candidate_name}},\n\nWe're excited to let you know that we'd like to move you forward to the next round of our interview process. \n\nPlease let us know your availability for a quick chat next week.\n\nBest,\nThe Hiring Team"
    },
    {
        label: "Interview Follow-Up",
        subject: "Thank you for interviewing with us",
        body: "Hi {{candidate_name}},\n\nThank you for your time today! We enjoyed learning more about your background.\n\nWe will be in touch shortly with an update regarding next steps.\n\nBest,\nThe Hiring Team"
    }
];

const ComposeMessageModal: React.FC<ComposeMessageModalProps> = ({
    isOpen,
    onClose,
    onSkip,
    recipients,
    defaultSubject = '',
    defaultBody = '',
    requireAction = false
}) => {
    const { addToast } = useToast();

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<MessageFormData>({
        resolver: zodResolver(messageSchema),
        defaultValues: {
            subject: defaultSubject,
            body: defaultBody
        }
    });

    const isSingleRecipient = recipients.length === 1;
    const recipientNames = recipients.map(r => r.student?.name || 'Applicant').join(', ');
    const placeholderName = isSingleRecipient ? recipients[0].student?.name?.split(' ')[0] || 'there' : 'there';

    // Reset when modal opens with new data
    useEffect(() => {
        if (isOpen) {
            reset({ subject: defaultSubject, body: defaultBody });
        }
    }, [isOpen, defaultSubject, defaultBody, reset]);

    const handleApplyTemplate = (subject: string, body: string) => {
        // Replace {{candidate_name}} with actual name for single recipient, or generic greeting for bulk
        const parsedBody = body.replace(/{{candidate_name}}/g, placeholderName);
        setValue('subject', subject);
        setValue('body', parsedBody);
    };

    const onSubmit = async (data: MessageFormData) => {
        try {
            // Mock API Call - In reality this would be api.post('/messages/send')
            console.log("Sending email to:", recipients.map(r => r.student?.email));
            console.log("Payload:", data);

            await new Promise(r => setTimeout(r, 600)); // Network delay simulation

            addToast(`Successfully sent email to ${recipients.length} candidate(s).`, 'success');
            onClose();
        } catch (error) {
            addToast('Failed to send messages.', 'error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-fade-in border border-slate-200 dark:border-slate-700">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg">
                            <Mail size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Compose Message</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

                    {/* Read-only Recipient List */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            To ({recipients.length} Recipient{recipients.length > 1 ? 's' : ''})
                        </label>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 break-words">
                            {recipientNames.length > 100 ? `${recipientNames.substring(0, 100)}... +${recipients.length - 3} more` : recipientNames}
                        </div>
                    </div>

                    {/* Quick Templates */}
                    <div className="mb-6 space-y-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Quick Templates
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {TEMPLATES.map((tmpl, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleApplyTemplate(tmpl.subject, tmpl.body)}
                                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md transition-colors"
                                >
                                    {tmpl.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <form id="compose-message-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="Subject"
                            {...register('subject')}
                            error={errors.subject?.message}
                            placeholder="Email Subject"
                            fullWidth
                        />

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                                Message Body
                            </label>
                            <textarea
                                {...register('body')}
                                rows={8}
                                className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 custom-scrollbar ${errors.body
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                    : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                                    }`}
                                placeholder="Type your message here... Use {{candidate_name}} to dynamically insert the candidate's first name."
                            />
                            {errors.body && (
                                <p className="text-red-500 text-xs mt-1 font-medium">{errors.body.message}</p>
                            )}
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl shrink-0">
                    {requireAction ? (
                        <>
                            <Button
                                variant="secondary"
                                type="button"
                                onClick={onSkip || onClose}
                                icon={SkipForward}
                            >
                                Skip & Don't Email
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                form="compose-message-form"
                                isLoading={isSubmitting}
                                icon={Send}
                            >
                                Send Email
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                type="button"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                form="compose-message-form"
                                isLoading={isSubmitting}
                                icon={Send}
                            >
                                Send Message
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComposeMessageModal;
