// IncomeReports.jsx
import React, { useEffect, useState, useRef } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Pie, Bar } from "react-chartjs-2";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import IncomeSidebar from "../Components/IncomeSidebar";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement
);

const IncomeReports = () => {
  const [incomes, setIncomes] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = () => {
    fetch(`${API_URL}/incomes`)
      .then((res) => res.json())
      .then((data) => setIncomes(data))
      .catch((err) => console.error("Error fetching incomes:", err));
  };

  // Totals and aggregates
  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const aggregatedTypes = incomes.reduce((acc, inc) => {
    acc[inc.incomeType] = (acc[inc.incomeType] || 0) + inc.amount;
    return acc;
  }, {});
  const aggregatedCategories = incomes.reduce((acc, inc) => {
    acc[inc.incomeCategory] = (acc[inc.incomeCategory] || 0) + inc.amount;
    return acc;
  }, {});

  // Chart data
  const pieChartData = {
    labels: Object.keys(aggregatedTypes),
    datasets: [
      {
        data: Object.values(aggregatedTypes),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
      },
    ],
  };
  const barChartData = {
    labels: Object.keys(aggregatedCategories),
    datasets: [
      {
        label: "Income by Category",
        data: Object.values(aggregatedCategories),
        backgroundColor: "#36A2EB",
        borderColor: "#36A2EB",
        borderWidth: 1,
      },
    ],
  };

  // Download analyzed report via html2canvas + jsPDF
  const downloadAnalyzedReportPDF = () => {
    const input = document.getElementById("analyzed-report");
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("analyzed-report.pdf");
    });
  };

  // Download full details PDF
  const downloadFullDetailsReportPDF = () => {
    const pdf = new jsPDF();
    const columns = [
      "Income Source",
      "Category",
      "Type",
      "Amount",
      "Description",
      "Date",
    ];
    const rows = incomes.map((inc) => [
      inc.incomeSource,
      inc.incomeCategory,
      inc.incomeType,
      `Rs:${inc.amount}`,
      inc.description,
      new Date(inc.date).toLocaleDateString(),
    ]);
    pdf.autoTable({ head: [columns], body: rows });
    pdf.save("full-details-report.pdf");
  };

  // Download full details Excel
  const downloadFullDetailsReportExcel = () => {
    const wsData = incomes.map((inc) => ({
      "Income Source": inc.incomeSource,
      Category: inc.incomeCategory,
      Type: inc.incomeType,
      Amount: inc.amount,
      Description: inc.description,
      Date: new Date(inc.date).toLocaleDateString(),
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Incomes");
    XLSX.writeFile(wb, "full-details-report.xlsx");
  };

  return (
    <div className="flex h-screen w-full bg-gradient-to-r from-[#434570] to-[#232439]">
      <IncomeSidebar />

      <div className="flex-1 flex flex-col items-center justify-start p-6 overflow-auto">
        <h2 className="text-3xl font-bold mb-8 text-white">Income Reports</h2>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Analyzed Report Card */}
          <div className="m-4 rounded-lg shadow-xl p-6 bg-slate-400">
            <h3 className="text-xl font-semibold mb-2 text-black">
              Analyzed Report
            </h3>
            <p className="text-black mb-4">
              Get a report including Total Income, Charts, and Income Summary as a pdf
            </p>
            <button
              onClick={downloadAnalyzedReportPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition"
            >
              Download
            </button>
          </div>

          {/* Full Details Report Card */}
          <div className="m-4 rounded-lg shadow-xl p-6 bg-slate-400">
            <h3 className="text-xl font-semibold mb-2 text-black">
              Full Details Report
            </h3>
            <p className="text-black mb-4">
              Get a full income list report in PDF or Excel format.
            </p>
            <div className="flex gap-4">
              <button
                onClick={downloadFullDetailsReportPDF}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow transition"
              >
                PDF
              </button>
              <button
                onClick={downloadFullDetailsReportExcel}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow transition"
              >
                Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden container for Analyzed Report export */}
      <div
        id="analyzed-report"
        style={{
          position: "absolute",
          top: "-10000px",
          left: "-10000px",
          width: "800px",
        }}
      >
        <div
          style={{
            padding: "20px",
            border: "1px solid #ccc",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          <h3 style={{ fontSize: "24px", marginBottom: "10px" }}>
            Total Income
          </h3>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>
            Rs {totalIncome.toFixed(2)}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "20px",
          }}
        >
          <div style={{ width: "300px", height: "300px" }}>
            <h4 style={{ textAlign: "center" }}>Income by Type</h4>
            <Pie data={pieChartData} ref={pieChartRef} />
          </div>
          <div style={{ width: "300px", height: "300px" }}>
            <h4 style={{ textAlign: "center" }}>Income by Category</h4>
            <Bar data={barChartData} ref={barChartRef} />
          </div>
        </div>

        <div style={{ padding: "20px", border: "1px solid #ccc" }}>
          <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>
            Income Summary
          </h3>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h4>Income Types</h4>
              <ul>
                {Object.entries(aggregatedTypes).map(([type, amt]) => (
                  <li key={type}>
                    {type}: Rs {amt.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Income Categories</h4>
              <ul>
                {Object.entries(aggregatedCategories).map(
                  ([cat, amt]) => (
                    <li key={cat}>
                      {cat}: Rs {amt.toFixed(2)}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeReports;
