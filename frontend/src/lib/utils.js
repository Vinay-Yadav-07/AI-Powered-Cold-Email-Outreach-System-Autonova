export const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

export const formatDate = (dateString) => {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatShortDate = (dateString) => {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const getStatusColor = (status) => {
  const colors = {
    queued: "bg-blue-900/30 text-blue-400",
    sent_step_1: "bg-green-900/30 text-green-400",
    sent_followup_1: "bg-purple-900/30 text-purple-400",
    invalid_email: "bg-red-900/30 text-red-400",
    bounced: "bg-red-900/30 text-red-400",
    unsubscribed: "bg-yellow-900/30 text-yellow-400",
  };
  return colors[status] || "bg-gray-900/30 text-gray-400";
};

export const getStatusLabel = (status) => {
  const labels = {
    queued: "Queued",
    sent_step_1: "Email Sent",
    sent_followup_1: "Follow-up Sent",
    invalid_email: "Invalid Email",
    bounced: "Bounced",
    unsubscribed: "Unsubscribed",
  };
  return labels[status] || status;
};

export const exportToCSV = (data, filename = "export.csv") => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }
          return value;
        })
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
