import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBudgetById, updateBudget } from "../services/api";
import BudgetSideBar from "../Components/BudgetSideBar";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UpdateBudget = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    notes: "",
    startDate: "",
    responsiblePerson: "",
    phone: ""
  });

  const [errors, setErrors] = useState({});

  const categories = [
    "Administrative",
    "Financial",
    "Research & Development",
    "Sales and Distribution",
    "IT and Software",
    "Entertainment and Hospitality",
  ];

  // Set today's date in 'YYYY-MM-DD' format
  const todayDate = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const budget = await getBudgetById(id);
        setFormData({
          amount: budget.amount,
          category: budget.category,
          notes: budget.notes,
          startDate: budget.startDate.split("T")[0],
          responsiblePerson: budget.responsiblePerson,
          phone: budget.phone
        });
      } catch (error) {
        console.error("Error fetching budget:", error);
        alert("Failed to fetch budget.");
      }
    };
    fetchBudget();
  }, [id]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount) {
      newErrors.amount = "Amount is required";
    } else if (!/^\d+$/.test(formData.amount)) {
      newErrors.amount = "Amount must be a number only";
    }

    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";

    if (formData.notes && !/^[A-Za-z\s]*$/.test(formData.notes)) {
      newErrors.notes = "Notes must contain only letters and spaces";
    }

    if (formData.responsiblePerson && !/^[A-Za-z\s]*$/.test(formData.responsiblePerson)) {
      newErrors.responsiblePerson = "Responsible Person must contain only letters and spaces";
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "amount") {
      if (/^\d*$/.test(value)) {
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, amount: "" });
      } else {
        setErrors({ ...errors, amount: "Amount must be a number only" });
      }
    }
    else if (name === "notes" || name === "responsiblePerson") {
      if (/^[A-Za-z\s]*$/.test(value)) {
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: "" });
      } else {
        setErrors({ ...errors, [name]: `${name === 'notes' ? 'Notes' : 'Responsible Person'} must contain only letters and spaces` });
      }
    }
    else if (name === "phone") {
      const numbersOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: numbersOnly });
      if (numbersOnly.length !== 10) {
        setErrors({ ...errors, phone: "Phone number must be exactly 10 digits" });
      } else {
        setErrors({ ...errors, phone: "" });
      }
    }
    else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await updateBudget(id, formData);
      toast.success("Budget updated successfully!");
      // navigate("/BudgetHome");
    } catch (error) {
      console.error("Error updating budget:", error);
      toast.error("Failed to update budget.");
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#434570] to-[#232439] h-screen w-full">
      <BudgetSideBar />
      <div className="bg-gradient-to-r from-[#434570] to-[#232439] min-h-screen w-full flex flex-col justify-start items-center py-10">
        <div className="max-w-md w-full p-6 bg-black shadow-md rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-white"><center>Update Budget</center></h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-white">Amount</label>
              <input
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white bg-gray-800"
              />
              {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-white">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white bg-gray-800"
              >
                <option value="">Select a category</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-white">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white bg-gray-800"
              />
              {errors.notes && <p className="text-red-500 text-sm">{errors.notes}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-white">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                max={todayDate}  // Restrict to today's date and before
                className="mt-1 block w-full px-3 py-2 border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white bg-gray-800"
              />
              {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300">Responsible Person</label>
              <input
                type="text"
                name="responsiblePerson"
                value={formData.responsiblePerson}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 text-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.responsiblePerson && <p className="text-red-500 text-sm">{errors.responsiblePerson}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 text-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Update Budget
              
            </button>
          </form>
        </div>
      </div>
      <ToastContainer 
        position="top-center" 
        autoClose={5000} 
        hideProgressBar
        closeButton={false}
        toastClassName="custom-toast"  
      />
    </div>
  );
};

export default UpdateBudget;


