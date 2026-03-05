export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'STUDENT' | 'RECRUITER' | 'ADMIN' | 'SUPER_ADMIN';
    is_approved: boolean;
    is_active: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface StudentProfile {
    _id: string;
    user: string;
    branch: string;
    cgpa: number;
    graduation_year: number;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    marks_10th: number;
    marks_12th: number;
    skills: string[];
    resume_url?: string;
    is_approved: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface RecruiterProfile {
    _id: string;
    user: string;
    company_name: string;
    contact_person: string;
    industry: string;
    location: string;
    website: string;
    is_verified: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface Job {
    _id: string;
    recruiter: string | User;
    title: string;
    description: string;
    type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
    location: string;
    salary_range: string;
    salary_package?: number | string;
    min_cgpa?: number;
    eligible_branch?: string;
    applicationCount?: number;
    skills_required: string[];
    status: 'ACTIVE' | 'CLOSED';
    deadline: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Application {
    _id: string;
    student: string | User;
    job: string | Job;
    status: 'SUBMITTED' | 'REVIEWED' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED';
    resume_url: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Announcement {
    _id: string;
    title: string;
    message: string;
    content?: string; // For backward compatibility if any
    target_audience?: 'ALL' | 'STUDENT' | 'RECRUITER';
    created_at: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
    count?: number;
    total?: number;
}
