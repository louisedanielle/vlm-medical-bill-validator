# 🏥 LeapStack AI Claims

> VLM-Powered Medical Bill Validation System

## 📋 Overview

A complete medical bill validation system that uses Mistral AI's Vision Language Model (VLM) to extract, parse, and validate medical bills against insurance policies.

## ✨ Features

- **VLM OCR** - Extract text from PDF medical bills using Mistral Pixtral-12B
- **AI Parsing** - Convert bill text to structured data (patient info, charges, totals)
- **Policy Validation** - Automatically check charges against policy limits
- **Policy Management** - Create, upload (PDF), and manage insurance policies
- **MongoDB Storage** - Persist policies and bill data
- **Interactive Chat** - Ask AI questions about the bill
- **Export Results** - Download as TXT or JSON

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Frontend | HTML/CSS/JS (Single Page) |
| AI Models | Mistral Pixtral-12B, Mistral Small/Medium/Large |
| PDF Processing | PDF.js |

## 🚀 Quick Start

### Prerequisites

- Node.js (v20+)
- MongoDB (local or cloud)
- Mistral API key

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd leapstack-ai-claims

# Install dependencies
npm install

# Create .env file
echo "MONGODB_URI=mongodb://localhost:27017/leapstack_claims" > .env

# Start MongoDB (if using local)
mongod

# Run the application
npm run dev
