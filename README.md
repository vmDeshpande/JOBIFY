# JOBIFY

## Overview

This project is a Job Application System that allows companies to post job listings and receive applications from potential candidates.

## Features

- User registration and login for both regular users and company owners.
- Company owners can post job listings with details such as job title, location, and salary.
- Job seekers can view available job listings and apply for jobs.
- Company owners can view applications submitted for their job listings.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose (ODM for MongoDB)
- HTML/CSS/JavaScript

## Setup Instructions

1. **Clone the repository:**

    ```bash
    git clone https://github.com/vmDeshpande/JOBIFY
    cd JOBIFY
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Set up MongoDB:**
   
   - Create a MongoDB Atlas account (https://www.mongodb.com/cloud/atlas).
   - Create a new cluster and get the connection string.
   - Replace the placeholder connection string in `server.js` with your actual connection string.

4. **Run the application:**

    ```bash
    node .
    ```

5. **Open your browser and go to http://localhost:3000 to access the application.**

## Usage

- Register as a regular user or a company owner.
- Log in using your credentials.
- Regular users can view job listings and apply for jobs.
- Company owners can post job listings and view applications for their jobs.
