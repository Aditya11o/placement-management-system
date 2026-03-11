export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'STUDENT' | 'RECRUITER' | 'ADMIN' | 'SUPER_ADMIN';
    is_approved: boolean;
    is_active: boolean;
    company_name?: string;
    company_id?: string;
    team_role?: 'OWNER' | 'MEMBER';
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
    recruiter_id: string | User;
    title: string;
    description: string;
    requirements?: string[];
    location: string;
    package_lpa: number;
    salary_min?: number;
    salary_max?: number;
    has_equity?: boolean;
    has_bonus?: boolean;
    min_cgpa: number;
    eligible_branch: string;
    graduation_year: number;
    applicationCount?: number;
    is_featured?: boolean;
    status: 'ACTIVE' | 'CLOSED';
    deadline: string;
    created_at?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Application {
    _id: string;
    student: string | User;
    job: string | Job;
    status: 'SUBMITTED' | 'REVIEWED' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED' | 'OFFER_ACCEPTED' | 'OFFER_DECLINED';
    resume_url: string;
    notes?: string;
    scorecards?: Array<{
        reviewer_id: string;
        reviewer_name: string;
        round_name?: string;
        communication: number;
        technical: number;
        culture: number;
        overall: number;
        recommendation?: 'HIRE' | 'NO_HIRE' | 'MAYBE';
        comments: string;
        created_at: string;
    }>;
    offer_letter_url?: string;
    offer_issued_at?: string;
    offer_expires_at?: string;
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
