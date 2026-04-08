/**
 * Centralized Service for Application Eligibility Rules
 */

const checkEligibility = (student, job, currentApplicationsCount = 0, systemSettings = {}) => {
  const reasons = [];
  const criteria = {
    cgpa: { met: true, required: job.minCGPA || 0, actual: student.cgpa || 0 },
    tenth: { met: true, required: job.min10th || 0, actual: student.tenthPercentage || 0 },
    twelfth: { met: true, required: job.min12th || 0, actual: student.twelfthPercentage || 0 },
    backlogs: { met: true, required: job.maxBacklogs || 0, actual: student.activeBacklogs || 0 },
    course: { met: true, required: job.targetCourses || [], actual: student.course || '' },
    branch: { met: true, required: job.branches || [], actual: student.branch || '' },
    gender: { met: true, required: job.genderPreference || 'all', actual: student.gender || '' },
    placementStatus: { met: true, required: 'Unplaced/Better Offer', actual: student.placementStatus || 'Unplaced' },
    applicationCap: { met: true, required: systemSettings.maxApplicationsPerStudent || 999, actual: currentApplicationsCount }
  };

  // 1. Academic Verification Check
  if (!student.academicVerified) {
    reasons.push("Academic profile not verified by Placement Office");
    return { isEligible: false, reasons, criteria };
  }

  // 2. CGPA Check
  if (student.cgpa < job.minCGPA) {
    criteria.cgpa.met = false;
    reasons.push(`CGPA requirement not met (Min: ${job.minCGPA})`);
  }

  // 3. 10th/12th Check
  if (job.min10th > 0 && student.tenthPercentage < job.min10th) {
    criteria.tenth.met = false;
    reasons.push(`10th percentage requirement not met (Min: ${job.min10th}%)`);
  }
  if (job.min12th > 0 && student.twelfthPercentage < job.min12th) {
    criteria.twelfth.met = false;
    reasons.push(`12th percentage requirement not met (Min: ${job.min12th}%)`);
  }

  // 4. Backlogs Check
  if (student.activeBacklogs > job.maxBacklogs) {
    criteria.backlogs.met = false;
    reasons.push(`Too many active backlogs (Max allowed: ${job.maxBacklogs})`);
  }

  // 5. Course & Branch Check
  if (job.targetCourses && job.targetCourses.length > 0) {
    if (!job.targetCourses.includes(student.course)) {
      criteria.course.met = false;
      reasons.push(`Academic course "${student.course}" is not eligible for this role`);
    }
  }
  if (job.branches && job.branches.length > 0) {
    if (!job.branches.includes(student.branch)) {
      criteria.branch.met = false;
      reasons.push(`Specialization/Branch "${student.branch}" is not eligible`);
    }
  }

  // 6. Gender Check (Diversity)
  if (job.genderPreference !== 'all') {
    if (student.gender && student.gender.toLowerCase() !== job.genderPreference.toLowerCase()) {
      criteria.gender.met = false;
      reasons.push(`This opportunity is specifically for ${job.genderPreference} candidates`);
    }
  }

  // 7. Placement Policy Check
  // Logic: Generally, if someone is already "Placed", they might be restricted unless it's a higher tier job.
  // For now, let's just flag it if they are already Placed and the job isn't marked as "Dream Company" (we can add that flag later)
  if (student.placementStatus === 'Placed' && job.jobType === 'Full_time') {
    // Basic policy: Placed students can't apply for another Full-time job unless it's a Dream Company (Package > X)
    // We'll just add a warning/restriction for now
    // criteria.placementStatus.met = false;
    // reasons.push("Student already placed in another company");
  }

  // 8. Application Cap
  if (systemSettings.maxApplicationsPerStudent && currentApplicationsCount >= systemSettings.maxApplicationsPerStudent) {
    criteria.applicationCap.met = false;
    reasons.push(`Application limit reached (${systemSettings.maxApplicationsPerStudent} applications max)`);
  }

  const isEligible = reasons.length === 0;
  return { isEligible, reasons, criteria };
};

module.exports = { checkEligibility };
