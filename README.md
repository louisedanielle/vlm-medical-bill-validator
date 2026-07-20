# 🏥 LeapStack AI Claims 

> VLM-Powered Medical Bill Validation & Adjudication System

## 📋 Overview

LeapStack AI Claims is a web-based application that uses Mistral AI's Vision Language Model (VLM) to automatically extract, parse, and validate medical bills against insurance policy contracts. The system uses OCR technology to read PDF documents, AI to parse medical charges, and automated validation to check compliance with policy limits.

### Key Features

- **📄 VLM OCR Extraction** - Uses Mistral Pixtral-12B to extract text from medical bill PDFs
- **🧠 AI-Powered Parsing** - Automatically extracts patient info, charges, totals, and more
- **✅ Policy Validation** - Compares charges against policy limits and generates compliance reports
- **💬 Interactive Chat** - Ask questions about the bill using Mistral AI assistant
- **📊 Export Capabilities** - Export parsed data as TXT or JSON
- **🔒 Privacy-First** - Your API key and documents stay in your browser (no server storage)

## 🚀 Demo

*https://vlm-medical-bill-validator-git-main-leapstack.vercel.app/*

## 📦 Installation

### Quick Deploy (Vercel)

1. **Clone or download this repository**

2. **Deploy to Vercel** (one-click):
   - Go to [Vercel](https://vercel.com/new)
   - Drag and drop your project folder
   - Click "Deploy"

3. **Or use Vercel CLI**:
```bash
npm install -g vercel
vercel
