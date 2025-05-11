
import express from 'express';
import {
  getIncomes,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome,
} from '../Controllers/incomeController.js';

const router = express.Router();


// Route: GET /
// Description: Retrieve all income entries, sorted by date (most recent first)
// Access: Public
router.get('/', getIncomes);

// Route: GET /:incomeId
// Description: Retrieve a single income entry by its unique ID
// Access: Public
router.get('/:id', getIncomeById);

// Route: POST /
// Description: Create a new income entry with specified details
// Access: Public
router.post('/', createIncome);

// Route: PUT /:incomeId
// Description: Update an existing income entry identified by its ID
// Access: Public
router.put('/:id', updateIncome);

// Route: DELETE /:incomeId
// Description: Delete an income entry identified by its ID
// Access: Public
router.delete('/:id', deleteIncome);

// Export the router to be used in the main application
export default router;
