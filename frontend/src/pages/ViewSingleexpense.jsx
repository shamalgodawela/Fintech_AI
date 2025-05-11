import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; 
import axios from 'axios';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ExepenseSidebar from '../Components/ExepenseSidebar';

const ViewSingleexpense = () => {
  const { id } = useParams(); 
  const [expense, setExpense] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  
  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/Expenses/getsingleExpenses/${id}`);
        setExpense(response.data);
      } catch (error) {
        console.error('Error fetching expense:', error);
        toast.error('Failed to fetch expense details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpense();
  }, [id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!expense) {
    return <div>No data available for this expense.</div>;
  }

  const formatNumbers = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="bg-gradient-to-r from-[#434570] to-[#232439] min-h-screen w-full">
  <ExepenseSidebar />

  <div className="container mx-auto px-6 py-12 flex justify-center items-center min-h-screen">
    <div className="w-full max-w-4xl bg-white bg-opacity-10 backdrop-blur-md border border-white/20 p-10 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-300">
      <h2 className="text-4xl font-bold text-white text-center mb-10 tracking-tight">Expense Details</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-white">
        <div>
          <p className="text-sm uppercase text-gray-300">Name</p>
          <p className="text-lg font-semibold text-white mt-1">{expense.name}</p>
        </div>
        <div>
          <p className="text-sm uppercase text-gray-300">Description</p>
          <p className="text-lg font-semibold text-white mt-1">{expense.description}</p>
        </div>
        <div>
          <p className="text-sm uppercase text-gray-300">Category</p>
          <p className="text-lg font-semibold text-white mt-1">{expense.category}</p>
        </div>
        <div>
          <p className="text-sm uppercase text-gray-300">Amount</p>
          <p className="text-lg font-semibold text-white mt-1">Rs: {formatNumbers(expense.amount)}</p>
        </div>
        <div>
          <p className="text-sm uppercase text-gray-300">Date</p>
          <p className="text-lg font-semibold text-white mt-1">{new Date(expense.date).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm uppercase text-gray-300">Responsible Person</p>
          <p className="text-lg font-semibold text-white mt-1">{expense.responsiblePerson}</p>
        </div>
        <div>
          <p className="text-sm uppercase text-gray-300">Phone</p>
          <p className="text-lg font-semibold text-white mt-1">{expense.phone}</p>
        </div>
        <div>
          <p className="text-sm uppercase text-gray-300">Notes</p>
          <p className="text-lg font-semibold text-white mt-1">{expense.notes}</p>
        </div>
      </div>
    </div>
  </div>

  <ToastContainer position="top-center" autoClose={5000} hideProgressBar closeButton={false} />
</div>


  );
};

export default ViewSingleexpense;
