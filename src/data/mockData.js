// Pure Calendar Helper Utilities (No Mock Datasets)

export const getDaysInMonth = (monthName, year = 2026) => {
  const monthMap = {
    "January": 31, "February": 28, "March": 31, "April": 30, "May": 31, "June": 30,
    "July": 31, "August": 31, "September": 30, "October": 31, "November": 30, "December": 31
  };
  // Leap year check
  if (monthName === "February" && year % 4 === 0) return 29;
  return monthMap[monthName] || 30;
};

export const getMonthIndex = (monthName) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months.indexOf(monthName);
};
