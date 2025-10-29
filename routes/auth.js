import express from 'express';
// Corrected the import to use named imports directly
import { registerUser, loginUser, updateOnboarding, getUser, getProgress, updateProgress, checkUsername, verifyStorage, getModuleProgress, getCompletedModules } from '../controllers/authController.js';

const router = express.Router();

// Route for user registration
router.post('/register', registerUser);

// Route for user login
router.post('/login', loginUser);

// Route to update onboarding selections
router.put('/onboarding', updateOnboarding);

// Route to get user data
router.get('/user/:userId', getUser);

// Username availability
router.get('/check-username', checkUsername);

// Progress routes
router.get('/progress/:userId', getProgress);
router.get('/module-progress/:userId', getModuleProgress);
router.put('/progress', updateProgress);
// Completed module ids (with cache)
router.get('/completed-modules/:userId', getCompletedModules);

// Debug route to verify database storage
router.get('/verify-storage/:userId', verifyStorage);

export default router;

