exports.checkEligibility = (student, job) => {
    const reasons = [];

    // 1. CGPA Check
    if (student.cgpa < job.min_cgpa) {
        reasons.push(`Requires Min CGPA of ${job.min_cgpa}, but your CGPA is ${student.cgpa}`);
    }

    // 2. Graduation Year Check
    if (student.graduation_year !== job.graduation_year) {
        reasons.push(`Requires Graduation Year ${job.graduation_year}, but yours is ${student.graduation_year}`);
    }

    // 3. Branch Check
    const allowedBranches = job.eligible_branch.split(',').map(b => b.trim().toUpperCase());
    if (!allowedBranches.includes('ALL') && !allowedBranches.includes(student.branch.toUpperCase())) {
        reasons.push(`Your branch (${student.branch}) is not eligible for this job`);
    }

    // 4. Backlogs Check
    if (student.backlogs_active > job.max_backlogs_allowed) {
        reasons.push(`Max backlogs allowed is ${job.max_backlogs_allowed}, but you have ${student.backlogs_active}`);
    }

    // 5. 10th Marks Check
    if (student.marks_10th < job.min_marks_10th) {
        reasons.push(`Requires Min 10th marks of ${job.min_marks_10th}%, but yours is ${student.marks_10th}%`);
    }

    // 6. 12th Marks Check
    if (student.marks_12th < job.min_marks_12th) {
        reasons.push(`Requires Min 12th marks of ${job.min_marks_12th}%, but yours is ${student.marks_12th}%`);
    }

    // 7. Diversity Hiring Check
    if (job.diversity_hiring === 'FEMALE_ONLY' && student.gender !== 'FEMALE') {
        reasons.push(`This is a diversity hiring drive restricted to FEMALE candidates.`);
    }

    return {
        isEligible: reasons.length === 0,
        reasons
    };
};
