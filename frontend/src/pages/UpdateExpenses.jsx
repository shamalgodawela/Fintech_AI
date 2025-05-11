import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'; 
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ExepenseSidebar from '../Components/ExepenseSidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UpdateExpenses = () => {
  const { id } = useParams();
  const [formdata, setFormdata] = useState({
    name: '',
    description: '',
    category: '',
    amount: '',
    date: '',
    responsiblePerson: '',
    notes: '',
    phone: '',
  });

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/Expenses/getsingleExpenses/${id}`);
        const expenseData = response.data;

        if (expenseData.date) {
          expenseData.date = new Date(expenseData.date).toISOString().split('T')[0];
        }

        setFormdata(expenseData);
      } catch (error) {
        console.error('Error fetching expense:', error);
        toast.error('Failed to fetch expense details');
      }
    };
    fetchExpense();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

     if ((name === 'amount') && isNaN(value)) {
          toast.error(`${name.charAt(0).toUpperCase() + name.slice(1)} must be a number`);
          return;
        }
    
        if ((name === 'name' || name==='responsiblePerson') && /[^a-zA-Z\s]/.test(value)) {
          toast.error('Full Name must contain only alphabetic characters');
          return;
        }
        if (name === "phone") {
          if (!/^\d*$/.test(value)) {
            toast.error("Phone number must contain only numbers.");
            return;
          }
        }
    setFormdata((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const confirmUpdate = () => {
    confirmAlert({
      title: 'Confirm Update',
      message: 'Are you sure you want to update this expense?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => handleSubmit(),
        },
        {
          label: 'No',
        },
      ],
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/Expenses/expensesUpddate/${id}`, formdata);
      console.log(response.data);
      toast.success('Expense updated successfully');
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Failed to update expense');
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#434570] to-[#232439] h-full w-full">
  <ExepenseSidebar />

  <div className="form_wrapper bg-black bg-opacity-40 w-full max-w-md p-6 mx-auto my-8 shadow-md rounded-lg">
    <div className="title_container text-center mb-6">
      <h2 className="text-xl font-extrabold text-white">Update Expense</h2>
    </div>
    <form onSubmit={(e) => { e.preventDefault(); confirmUpdate(); }}>
      <label className="text-white">Pay To</label>
      <input
        type="text"
        name="name"
        value={formdata.name}
        onChange={handleChange}
        required
        className="w-full p-2 mb-4 border border-gray-300 rounded-md"
      />

      <label className="text-white">Description</label>
      <input
        type="text"
        name="description"
        value={formdata.description}
        onChange={handleChange}
        required
        className="w-full p-2 mb-4 border border-gray-300 rounded-md"
      />

    

      <label className="text-white">Category</label>
      <select
        name="category"
        value={formdata.category}
        onChange={handleChange}
        required
        className="w-full p-2 mb-4 border border-gray-300 rounded-md"
      >
        <option value="" disabled>Select a category</option>
        <option value="Administrative">Administrative</option>
        <option value="Research & Development">Research & Development</option>
        <option value="Sales and Distribution">Sales and Distribution</option>
        <option value="IT and Software">IT and Software</option>
        <option value="Entertainment and Hospitality">Entertainment and Hospitality</option>
      </select>

      <label className="text-white">Amount</label>
      <input
        type="text"
        name="amount"
        value={formdata.amount}
        onChange={handleChange}
        required
        className="w-full p-2 mb-4 border border-gray-300 rounded-md"
      />

      <label className="text-white">Date</label>
      <input
        type="date"
        name="date"
        value={formdata.date}
        onChange={handleChange}
        required
        className="w-full p-2 mb-4 border border-gray-300 rounded-md"
      />

      <label className="text-white">Responsible Person</label>
      <input
        type="text"
        name="responsiblePerson"
        value={formdata.responsiblePerson}
        onChange={handleChange}
        required
        className="w-full p-2 mb-4 border border-gray-300 rounded-md"
      />

      <label className="text-white">Notes</label>
      <input
        type="text"
        name="notes"
        value={formdata.notes}
        onChange={handleChange}
        className="w-full p-2 mb-4 border border-gray-300 rounded-md"
      />

      <label className="text-white">Contact Number</label>
      <input
        type="text"
        name="phone"
        value={formdata.phone}
        onChange={handleChange}
        className="w-full p-2 mb-4 border border-gray-300 rounded-md"
        maxLength={10}
      />

      <input
        type="submit"
        value="Update Expense"
        className="w-full p-2 bg-blue-900 text-white font-semibold rounded-md cursor-pointer hover:bg-black"
      />
    </form>
  </div>

  <ToastContainer position="top-center" autoClose={5000} hideProgressBar closeButton={false} />
</div>

  );
};

export default UpdateExpenses;
