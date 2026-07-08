export const getAvatarColor = (name = "") => {
  const colors = [
    "from-indigo-500/10 to-indigo-500/20 text-indigo-600 border-indigo-150/50",
    "from-emerald-500/10 to-emerald-500/20 text-emerald-600 border-emerald-150/50",
    "from-blue-500/10 to-blue-500/20 text-blue-600 border-blue-150/50",
    "from-rose-500/10 to-rose-500/20 text-rose-600 border-rose-150/50",
    "from-amber-500/10 to-amber-500/20 text-amber-600 border-amber-150/50",
    "from-purple-500/10 to-purple-500/20 text-purple-600 border-purple-150/50"
  ];
  const charSum = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[charSum % colors.length];
};
