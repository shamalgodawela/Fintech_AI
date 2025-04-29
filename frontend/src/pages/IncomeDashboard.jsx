// IncomeList.jsx
import React, { useEffect, useState, useRef } from "react";
import { FaTrash, FaSave, FaEdit, FaDownload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
} from "chart.js";
import IncomeSidebar from "../Components/IncomeSidebar";

// Register chart.js components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler
);

const IncomeDashboard = () => {
  const [incomes, setIncomes] = useState([]);
  const [editedIncome, setEditedIncome] = useState({});
  const [editingRow, setEditingRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const navigate = useNavigate();

  // Refs for charts
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = () => {
    fetch(`${API_URL}/incomes`)
      .then((response) => response.json())
      .then((data) => {
        setIncomes(data);
        setEditedIncome(
          data.reduce((acc, income) => {
            acc[income._id] = { ...income };
            return acc;
          }, {})
        );
      })
      .catch((error) => console.error("Error fetching incomes:", error));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this income entry?")) {
      try {
        await fetch(`${API_URL}/incomes/${id}`, { method: "DELETE" });
        setIncomes((prev) => prev.filter((income) => income._id !== id));
      } catch (err) {
        console.error("Error deleting income:", err.message);
      }
    }
  };

  const handleEditClick = (id) => {
    setEditingRow(id);
  };

  const handleEditChange = (id, field, value) => {
    const newValue = field === "amount" ? parseFloat(value) : value;
    setEditedIncome((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: newValue },
    }));
  };

  const handleUpdate = async (id) => {
    const { _id, date, ...payload } = editedIncome[id];
    try {
      const response = await fetch(`${API_URL}/incomes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to update income");
      const updatedIncome = await response.json();
      setIncomes((prev) =>
        prev.map((income) => (income._id === id ? updatedIncome : income))
      );
      setEditingRow(null);
    } catch (err) {
      console.error("Error updating income:", err.message);
    }
  };

  // Function to download table data along with charts as a PDF
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Define the table columns and rows
    const columns = ['Income Source', 'Category', 'Type', 'Amount', 'Description', 'Date'];
    const rows = incomes.map((income) => [
      income.incomeSource,
      income.incomeCategory,
      income.incomeType,
      `$${income.amount}`,
      income.description,
      new Date(income.date).toLocaleDateString(),
    ]);

    // Add the table to the document
    doc.autoTable({
      head: [columns],
      body: rows,
    });

    // Capture and add the Pie Chart
    if (pieChartRef.current) {
      const pieImage = pieChartRef.current.toBase64Image();
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Total Income by Type", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });
      doc.addImage(pieImage, 'PNG', 30, 30, doc.internal.pageSize.getWidth() - 30, 150);
    }

    // Capture and add the Bar Chart
    if (barChartRef.current) {
      const barImage = barChartRef.current.toBase64Image();
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Income by Category", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });
      doc.addImage(barImage, 'PNG', 15, 30, doc.internal.pageSize.getWidth() - 30, 100);
    }

    // Save the document as a PDF
    doc.save('income-report.pdf');
  };

  // Filter incomes based on search term
  const filteredIncomes = incomes.filter((income) =>
    Object.keys(income).some((key) => {
      if (typeof income[key] === "string" || typeof income[key] === "number") {
        return income[key].toString().toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    })
  );

  // Prepare data for Pie chart (Total income by income type)
  const aggregatedTypes = filteredIncomes.reduce((acc, income) => {
    acc[income.incomeType] = (acc[income.incomeType] || 0) + income.amount;
    return acc;
  }, {});

  const pieChartData = {
    labels: Object.keys(aggregatedTypes),
    datasets: [
      {
        data: Object.values(aggregatedTypes),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      },
    ],
  };

  // Prepare data for Bar chart (Income by category)
  const aggregatedCategories = filteredIncomes.reduce((acc, income) => {
    acc[income.incomeCategory] = (acc[income.incomeCategory] || 0) + income.amount;
    return acc;
  }, {});

  const barChartData = {
    labels: Object.keys(aggregatedCategories),
    datasets: [
      {
        label: 'Income by Category',
        data: Object.values(aggregatedCategories),
        backgroundColor: '#36A2EB',
        borderColor: '#36A2EB',
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for Line chart (Income by source)
  const aggregatedSources = filteredIncomes.reduce((acc, income) => {
    acc[income.incomeSource] = (acc[income.incomeSource] || 0) + income.amount;
    return acc;
  }, {});

  const lineChartData = {
    labels: Object.keys(aggregatedSources),
    datasets: [
      {
        label: "Income by Source",
        data: Object.values(aggregatedSources),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const formatNumbers = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Calculate total income from filtered incomes
  const totalIncome = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);

  return (
    <div className="flex h-screen w-full bg-gradient-to-r from-[#434570] to-[#232439]">
      {/* Sidebar remains open on the left */}
      <IncomeSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <h2 className="text-4xl font-bold mb-4 text-center text-white">Income Dashboard</h2>

        <div className="flex flex-wrap gap-2 mb-4 justify-center ">
          {/* Search Bar */}
          <div className="relative w-full max-w-lg mx-auto">
            <input
              type="text"
              placeholder="Search incomes by type or category...."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1116.65 2a7.5 7.5 0 010 14.65z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Income Card */}
        <div className="max-w-md mx-auto shadow-lg rounded-xl p-6 mb-8">
          <h3 className="text-2xl font-bold text-center text-white">Total Income</h3>
          <p className="text-center text-3xl text-green-500 font-semibold mt-4">Rs:{formatNumbers(totalIncome.toFixed(2))}</p>
        </div>
        
        <div className=" bg-transparent  rounded-xl p-4 fle">
        {/* Charts Section: Pie chart and Bar chart side by side */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          {/* Pie Chart */}
          <div className="w-[30%] min-w-[300px] shadow-lg rounded-xl p-6 mb-8  bg-slate-600">
            <h3 className="text-xl font-bold text-center mb-2 text-black">Total Income by Type</h3>
            <Pie data={pieChartData} ref={pieChartRef} />
          </div>

          {/* Bar Chart */}
          <div className="w-[48%] min-w-[300px] shadow-lg rounded-xl p-6 mb-8  bg-slate-600">
            <h3 className="text-xl font-bold text-center mb-2 text-black">Total Income by Category</h3>
            <Bar data={barChartData} ref={barChartRef} />
          </div>
        </div>

        {/* New Line Chart Section: Income by Source */}
        <div className="max-w-md mx-auto shadow-lg rounded-xl p-6 mb-8  bg-slate-600 ">
          <h3 className="text-2xl font-bold text-center mb-4">Income by Source</h3>
          <Line data={lineChartData} />
        </div>

        </div>

        {/* Income Summary Card (Income Types, Categories & Sources) */}
        <div className="max-w-full mx-auto shadow-lg bg-slate-600 rounded-xl p-6 mb-8 mt-6">
          <h3 className="text-2xl font-bold text-center text-black mb-4">Income Summary</h3>
          <div className="flex flex-col md:flex-row justify-between">
            <div className="md:w-1/3">
              <h4 className="text-xl font-semibold mb-2">Income Types</h4>
              <ul>
                {Object.entries(aggregatedTypes).map(([type, amount]) => (
                  <li key={type} className="py-1 border-b">
                    <span className="font-bold">{type}</span>: ${amount.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/3">
              <h4 className="text-xl font-semibold mb-2">Income Categories</h4>
              <ul>
                {Object.entries(aggregatedCategories).map(([category, amount]) => (
                  <li key={category} className="py-1 border-b">
                    <span className="font-bold">{category}</span>: ${amount.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/3">
              <h4 className="text-xl font-semibold mb-2">Income Sources</h4>
              <ul>
                {Object.entries(aggregatedSources).map(([source, amount]) => (
                  <li key={source} className="py-1 border-b">
                    <span className="font-bold">{source}</span>: ${amount.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

       

      </div>
    </div>
  );
};

export default IncomeDashboard;