export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'student' | 'recruiter' | 'admin' | 'alumni' | 'mentor';
  isVerified: boolean;
  status: 'active' | 'inactive' | 'blacklisted' | 'pending';
  profilePhoto?: string;
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
  department?: string;
  course?: string;
  current_cgpa?: string | number;
  skills?: string[];
  role?: string;
  profilePhoto?: string;
  profile_photo?: string;
  studentDetails?: {
    cgpa: string | number;
    branch: string;
    graduationYear: string | number;
    skills?: string[];
    profilePhoto?: string;
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
    phone?: string;
    companyWebsite?: string;
    location?: string;
  };
  resume?: string;
  user?: User;
  _error?: boolean;
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
