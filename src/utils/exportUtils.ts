import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import { SentimentResult } from '../types/sentiment';

export const exportToCSV = (results: SentimentResult[]) => {
  const csvData = results.map(result => ({
    Text: result.text,
    Sentiment: result.sentiment,
    Confidence: Math.round(result.confidence * 100) + '%',
    Keywords: result.keywords.join(', '),
    Timestamp: result.timestamp.toISOString(),
    Source: result.source || 'Direct Input'
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `sentiment-analysis-${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportToJSON = (results: SentimentResult[]) => {
  const jsonData = {
    exportDate: new Date().toISOString(),
    totalResults: results.length,
    summary: {
      positive: results.filter(r => r.sentiment === 'positive').length,
      negative: results.filter(r => r.sentiment === 'negative').length,
      neutral: results.filter(r => r.sentiment === 'neutral').length,
      averageConfidence: results.reduce((sum, r) => sum + r.confidence, 0) / results.length
    },
    results: results
  };

  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
  saveAs(blob, `sentiment-analysis-${new Date().toISOString().split('T')[0]}.json`);
};

export const exportToPDF = (results: SentimentResult[]) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text('Sentiment Analysis Report', 20, 30);
  
  // Summary
  doc.setFontSize(12);
  const positive = results.filter(r => r.sentiment === 'positive').length;
  const negative = results.filter(r => r.sentiment === 'negative').length;
  const neutral = results.filter(r => r.sentiment === 'neutral').length;
  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
  
  doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 20, 50);
  doc.text(`Total Texts Analyzed: ${results.length}`, 20, 60);
  doc.text(`Positive: ${positive} | Negative: ${negative} | Neutral: ${neutral}`, 20, 70);
  doc.text(`Average Confidence: ${Math.round(avgConfidence * 100)}%`, 20, 80);
  
  // Results
  let yPosition = 100;
  doc.setFontSize(10);
  
  results.forEach((result, index) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.text(`${index + 1}. ${result.sentiment.toUpperCase()} (${Math.round(result.confidence * 100)}%)`, 20, yPosition);
    yPosition += 10;
    
    const textLines = doc.splitTextToSize(result.text, 170);
    doc.text(textLines, 25, yPosition);
    yPosition += textLines.length * 5 + 5;
    
    if (result.keywords.length > 0) {
      doc.text(`Keywords: ${result.keywords.join(', ')}`, 25, yPosition);
      yPosition += 10;
    }
    
    yPosition += 5;
  });
  
  doc.save(`sentiment-analysis-${new Date().toISOString().split('T')[0]}.pdf`);
};