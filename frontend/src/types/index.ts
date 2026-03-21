export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'student' | 'recruiter' | 'admin';
  isVerified: boolean;
  status: 'active' | 'inactive';
  token?: string;
  refreshToken?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  companyName: string;
  location: string;
  salary: number;
  jobType: string;
  deadline: string;
  recruiter: string | User;
  status: 'Open' | 'Closed';
  createdAt?: string;
  updatedAt?: string;
}

export interface Application {
  _id: string;
  student: string | User;
  job: string | Job;
  resume: string;
  status: 'Applied' | 'Under Review' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected';
  interview?: {
    date: string;
    link: string;
    location?: string;
    notes?: string;
  };
  nextStep?: string;
  appliedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileData {
  bio?: string;
  studentDetails?: {
    cgpa: string | number;
    branch: string;
    graduationYear: string | number;
  };
  companyDetails?: {
    companyName: string;
    designation: string;
    website?: string;
  };
  recruiterDetails?: { // Keeping this for backward compatibility if any
    companyName: string;
    designation: string;
    companyLogo?: string;
  };
  resume?: string;
}

export interface SettingsData {
  portalName: string;
  primaryColor: string;
  logoUrl?: string;
}

export interface ToastMessage {
  id: number;
  title: string;
  message: string;
}
