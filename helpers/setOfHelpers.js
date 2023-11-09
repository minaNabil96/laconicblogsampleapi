exports.arabicFullDate = () => {
  const date = new Date();
  const arabicDate = new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "full",
  }).format(date);
  return arabicDate;
};
