// Add this to routes/policies.js or create a new route

// Clean policy text with AI
app.post('/api/mistral/clean', async (req, res) => {
  try {
    const { text } = req.body;
    
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: 'You are a precise medical bill cleaner. Return ONLY the cleaned text.' },
          { role: 'user', content: `Clean this extracted text by removing duplicates, page numbers, and formatting artifacts. Keep only the main content.\n\n${text}` }
        ],
        temperature: 0.1,
        max_tokens: 4096
      })
    });

    if (!response.ok) throw new Error('Mistral API error');
    const data = await response.json();
    res.json({ cleanedText: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Parse bill with AI
app.post('/api/mistral/parse', async (req, res) => {
  try {
    const { text } = req.body;
    
    const prompt = `You are an expert medical bill parser. Extract ALL information from this Hong Kong hospital bill and return ONLY valid JSON.

OUTPUT FORMAT:
{
  "hospital": "Hospital Name or null",
  "billNumber": "Bill number or null",
  "patientName": "Patient name or null",
  "patientId": "Patient ID or null",
  "admissionDate": "YYYY-MM-DD or null",
  "dischargeDate": "YYYY-MM-DD or null",
  "depositPaid": 0.00,
  "grandTotal": 0.00,
  "balanceDue": 0.00,
  "charges": [
    {
      "date": "YYYY-MM-DD or null",
      "code": "Charge code or null",
      "description": "Charge description",
      "category": "accommodation|laboratory|pharmacy|treatment|surgery|cardiac|dietary|supplies|doctor_fee|admission|other",
      "amount": 0.00,
      "discount": 0.00
    }
  ],
  "notes": "Any additional notes or null"
}

BILL TEXT:
${text}

Return ONLY the JSON.`;

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: 'You are a precise medical bill parser. Return ONLY valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 4096
      })
    });

    if (!response.ok) throw new Error('Mistral API error');
    const data = await response.json();
    const jsonStr = data.choices[0].message.content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    res.json(JSON.parse(jsonStr));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});