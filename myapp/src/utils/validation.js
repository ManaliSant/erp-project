export function validateApplicationForm(form, currentUser) {
  const errors = {};

  if (!form.title.trim()) {
    errors.title = "Title is required";
  }

  if (!form.description.trim()) {
    errors.description = "Description is required";
  }

  if ((form.type === "Leave" || form.type === "Resignation") && !form.dateRange.trim()) {
    errors.dateRange = "Date or effective date is required";
  }

  if (form.type === "Leave") {
    const days = Number(form.days);

    if (form.days === "") {
      errors.days = "Number of days is required";
    } else if (Number.isNaN(days)) {
      errors.days = "Days must be a number";
    } else if (days <= 0) {
      errors.days = "Days must be greater than 0";
    } else if (currentUser && days > currentUser.leavesRemaining) {
      errors.days = "Requested days exceed remaining leave balance";
    }
  }

  return errors;
}