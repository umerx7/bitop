const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');
const websocketService = require('../services/websocket');

const kycLevels = {
  basic: { name: 'Basic', depositLimit: 2000, withdrawalLimit: 1000, requirements: ['email', 'phone'] },
  intermediate: { name: 'Intermediate', depositLimit: 50000, withdrawalLimit: 25000, requirements: ['email', 'phone', 'id_document', 'selfie', 'address_proof'] },
  advanced: { name: 'Advanced', depositLimit: 1000000, withdrawalLimit: 500000, requirements: ['email', 'phone', 'id_document', 'selfie', 'address_proof', 'source_of_funds', 'video_verification'] }
};

router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('kycStatus kycDocuments');
    const currentLevel = user.kycStatus === 'verified' ? 'intermediate' : (user.kycStatus === 'pending' ? 'basic' : 'not_submitted');
    
    res.json({
      success: true,
      kyc: {
        status: user.kycStatus,
        currentLevel,
        documents: user.kycDocuments || [],
        levels: kycLevels
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/submit', protect, async (req, res) => {
  try {
    const { level, documents } = req.body;
    const user = await User.findById(req.user._id);
    
    if (user.kycStatus === 'verified' && level !== 'advanced') {
      return res.status(400).json({ success: false, message: 'Already verified. Contact support for level upgrade.' });
    }
    
    user.kycStatus = 'pending';
    user.kycDocuments = documents.map(d => ({
      type: d.type,
      url: d.url,
      uploadedAt: new Date(),
      status: 'pending'
    }));
    
    await user.save({ validateBeforeSave: false });
    
    websocketService.broadcastToUser(user._id, 'kyc:submitted', { level, documents: user.kycDocuments });
    
    res.json({ success: true, message: 'KYC submitted for review', kyc: { status: 'pending', documents: user.kycDocuments } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/requirements/:level', protect, async (req, res) => {
  try {
    const { level } = req.params;
    const requirements = kycLevels[level]?.requirements || kycLevels.basic.requirements;
    
    const details = {
      email: { name: 'Email Verification', description: 'Verify your email address', required: true },
      phone: { name: 'Phone Verification', description: 'Verify your phone number via SMS', required: true },
      id_document: { name: 'Government ID', description: 'Upload a clear photo of your passport, driver\'s license, or national ID', required: true, acceptedTypes: ['passport', 'drivers_license', 'national_id'] },
      selfie: { name: 'Selfie with ID', description: 'Take a selfie holding your ID document', required: true },
      address_proof: { name: 'Proof of Address', description: 'Utility bill or bank statement (not older than 3 months)', required: true, acceptedTypes: ['utility_bill', 'bank_statement', 'government_letter'] },
      source_of_funds: { name: 'Source of Funds', description: 'Documentation showing source of funds (payslips, tax returns, etc.)', required: false },
      video_verification: { name: 'Video Verification', description: 'Short video call for identity verification', required: false }
    };
    
    res.json({ success: true, requirements: requirements.map(r => details[r]).filter(Boolean) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/limits', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('kycStatus');
    let level = 'basic';
    if (user.kycStatus === 'verified') level = 'intermediate';
    if (user.kycStatus === 'advanced') level = 'advanced';
    
    const current = kycLevels[level];
    
    res.json({ success: true, currentLevel: level, limits: current });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;