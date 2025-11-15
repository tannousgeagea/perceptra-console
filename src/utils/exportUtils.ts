import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        const stringValue = value?.toString() || '';
        return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

export const exportToPDF = (
  title: string,
  headers: string[],
  data: any[][],
  filename: string
) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text(title, 14, 20);
  
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 40,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] }
  });

  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const prepareLeaderboardForExport = (data: any[]) => {
  return data.map(entry => ({
    Rank: entry.rank,
    'Full Name': entry.full_name,
    Username: entry.username,
    Annotations: entry.metric_value,
    'Contribution %': `${entry.percentage_of_total}%`
  }));
};

export const prepareUsersForExport = (data: any[]) => {
  return data.map(user => ({
    Username: user.username,
    'Full Name': user.full_name,
    'Total Annotations': user.total_annotations,
    'Manual Annotations': user.manual_annotations,
    'AI Edited': user.ai_predictions_edited,
    'AI Accepted': user.ai_predictions_accepted,
    'Reviews': user.images_reviewed,
    'Finalized': user.images_finalized,
    'Avg Time (s)': user.avg_annotation_time_seconds?.toFixed(1) || 'N/A',
    'Sessions': user.total_sessions
  }));
};

export const prepareProjectsForExport = (data: any[]) => {
  return data.map(project => ({
    'Project Name': project.project_name,
    'Total Images': project.total_images,
    'Annotated': project.images_annotated,
    'Reviewed': project.images_reviewed,
    'Finalized': project.images_finalized,
    'Completion %': `${project.completion_percentage.toFixed(1)}%`,
    'AI Acceptance %': `${project.prediction_acceptance_rate.toFixed(1)}%`,
    'Contributors': project.active_contributors
  }));
};