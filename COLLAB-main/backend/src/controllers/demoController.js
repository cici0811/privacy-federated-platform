const heDemo = require('../utils/heDemo');

exports.encrypt = (req, res) => {
  const { value } = req.body;
  if (value === undefined) return res.status(400).json({ success: false, message: 'Value required' });
  
  const ciphertext = heDemo.encrypt(Number(value));
  res.json({ success: true, ciphertext });
};

exports.computeSum = (req, res) => {
  const { cipherA, cipherB } = req.body;
  if (!cipherA || !cipherB) return res.status(400).json({ success: false, message: 'Two ciphertexts required' });
  
  const resultCipher = heDemo.add(cipherA, cipherB);
  res.json({ success: true, resultCipher });
};

exports.decrypt = (req, res) => {
  const { ciphertext } = req.body;
  if (!ciphertext) return res.status(400).json({ success: false, message: 'Ciphertext required' });
  
  const value = heDemo.decrypt(ciphertext);
  res.json({ success: true, value });
};
