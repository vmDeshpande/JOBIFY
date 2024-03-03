document.addEventListener("DOMContentLoaded", () => {
  const jobListContainer = document.getElementById("jobList");
  const jobDetailsContainer = document.getElementById("jobDetails");

  if (jobListContainer) {
    fetch("/get-job-listings")
      .then((response) => response.json())
      .then((jobListings) => {
        jobListings.forEach((jobListing) => {
          jobListing.jobs.forEach((job) => {
            const jobCard = document.createElement("div");
            jobCard.classList.add("job-item", "mb-4", "p-4");
            jobCard.innerHTML = `
                            <div class="row g-4">
                                    <div class="col-sm-12 col-md-8 d-flex align-items-center">
                                        <i class="bi bi-briefcase-fill text-primary me-2 fs-3"></i>
                                        <div class="text-start ps-4">
                                            <h3 class="mb-3">${job.title}</h5>
                                            <h5 class="mb-3">${jobListing.companyName}</h3>
                                            <span class="text-truncate me-3"><i class="fa fa-map-marker-alt text-primary me-2"></i>${job.location}</span>
                                            <span class="text-truncate me-3"><i class="fa fa-clock text-primary me-2"></i>${job.job_type}</span>
                                            <span class="text-truncate me-0"><i class="far fa-money-bill-alt text-primary me-2"></i>${job.salary}₹</span>
                                        </div>
                                    </div>
                                    <div class="col-sm-12 col-md-4 d-flex flex-column align-items-start align-items-md-end justify-content-center">
                                        <div class="d-flex mb-3">                                            
                                        <button class="btn btn-primary" onclick="showJobDetails('${job.job_type}', '${job.title}', '${jobListing.companyName}', '${job.location}', '${job.salary}')">Apply Now</button>

                                        </div>                                        
                                    </div>
                                </div>
                        `;
                        jobListContainer.appendChild(jobCard);
          });
        });
      })
      .catch((error) => console.error("Error fetching job listings:", error));
  }

  if (jobDetailsContainer) {
    const storedJobDetails = sessionStorage.getItem("jobDetails");

    if (storedJobDetails) {
      const { job_type, title, company, location, salary } = JSON.parse(storedJobDetails);

      jobDetailsContainer.innerHTML = `
    <div class="card text-center">
        <div class="card-body">
            <h2 class="card-title" id="jobTitle">${title}</h2>
            <p class="card-text" id="companyName"><span class="bi bi-building text-primary me-2"></span>${company}</p>
            <p class="card-text"><span class="bi bi-geo-alt text-primary me-2"></span>Location: ${location}</p>
            <p class="card-text" id="jobType"><span class="bi bi-clock text-primary me-2"></span>${job_type}</p>
            <p class="card-text"><span class="bi bi-cash text-primary me-2"></span>Salary: ${salary}</p>
        </div>
    </div>
`;


    }
  }
  function renderCompanyPosts(posts) {
    if (!Array.isArray(posts)) {
        return '<p class="lead">No company posts available.</p>';
    }

    return posts.map(
        (post) => `
            <div class="card mb-3">
                <div class="card-body">
                    <h3 class="card-title">Job Title: ${post.title}</h3>
                    <p class="card-text">Location: ${post.location}</p>
                    <p class="card-text">Salary: ${post.salary}</p>
                </div>
            </div>
        `
    ).join('');
}

function renderApplications(applications) {
    return applications.map(application => `
        <div class="card mb-3">
            <div class="card-body">
                <h3 class="card-title" id="applicantName">${application.fullName}</h3>
                <p class="card-text" id="jobTitle">Job Title: ${application.jobTitle}</p>
                <p class="card-text">Email: ${application.email}</p>
                <p class="card-text">Experience: ${application.experience}</p>
                <p class="card-text">Phone Number: ${application.phone_number}</p>
                <button class="btn btn-success me-2" onclick="handleApplicationApproval('${application.fullName}', true, '${application.jobTitle}')">
                    <i class="bi bi-check"></i> Select
                </button>
                <button class="btn btn-danger" onclick="handleApplicationApproval('${application.fullName}', false, '${application.jobTitle}')">
                    <i class="bi bi-x"></i> Reject
                </button>
            </div>
        </div>
    `).join('');
}

const panelContent = document.getElementById("panelContent");

if (panelContent) {
    fetch("/panel")
        .then((response) => response.json())
        .then((data) => {
            panelContent.innerHTML = `
                <div class="container">
                    <div class="row">
                        <div class="col-md-6">
                            <h2 class="mb-4">Company Posts</h2>
                            ${renderCompanyPosts(data.companyPosts.jobs)}
                        </div>
                        <div class="col-md-6">
                            <h2 class="mb-4">Applications</h2>
                            ${renderApplications(data.applications)}
                        </div>
                    </div>
                </div>
            `;
        })
        .catch((error) => console.error("Error fetching panel data:", error));
}


function renderUserApplications(applications) {
  if (!applications || applications.length === 0) {
      return '<p class="lead">No applications found.</p>';
  }

  const applicationList = applications.map(application => `
      <div class="card mb-3">
          <div class="card-body">
              <h5 class="card-title">Job Title: ${application.jobTitle}</h5>
              <p class="card-text">Company Name: ${application.companyName}</p>
              <p class="card-text">Status: ${getStatusLabel(application.approved)}</p>
              ${application.approved === 'true' ? `<p class="card-text">Contact: ${application.contact}</p>` : ''}
              <p class="card-text">Date: ${new Date(application.date).toLocaleString()}</p>
          </div>
      </div>
  `).join('');

  return applicationList;
}

function getStatusLabel(approved) {
  if (approved === 'true') {
      return '<span class="badge bg-success">Hired</span>';
  } else if (approved === 'false') {
      return '<span class="badge bg-danger">Rejected</span>';
  } else {
      return '<span class="badge bg-warning text-dark">Pending</span>';
  }
}

const userPanelContent = document.getElementById("userpanelContent");

if (userPanelContent) {
  fetch("/user-panel")
      .then(response => response.json())
      .then(data => {
          if (data.userData && Array.isArray(data.userData.applications)) {
              userPanelContent.innerHTML = `
                  <div class="container">
                      <div class="row">
                          <div class="col-md-6">
                              <h2 class="mb-4">User Data</h2>
                              <p>Username: ${data.userData.username}</p>
                              <!-- Add other user-related data here -->
                          </div>
                          <div class="col-md-6">
                              <h2 class="mb-4">Applications</h2>
                              ${renderUserApplications(data.userData.applications)}
                          </div>
                      </div>
                  </div>
              `;
          } else {
              userPanelContent.innerHTML = "<p class='lead'>No user data found.</p>";
          }
      })
      .catch(error => console.error("Error fetching user panel data:", error));
}

  toggleAuthLinks();
});

function register() {
  const userType = document.getElementById("userType").value;

  const registrationData = {
    username: document.getElementById("username").value,
    companyName: document.getElementById("companyName").value.toLowerCase(),
    password: document.getElementById("password").value,
  };

  const registrationRoute = `/register/${userType}`;

  fetch(registrationRoute, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registrationData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (
        data.message === "User registration successful" ||
        data.message === "Company registration successful"
      ) {
        window.location.href = "/login.html";
        alert(`${userType} registration successful`);
      } else {
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function login() {
  console.log("Login button clicked");

  const userType = document.getElementById("userType").value;

  const loginData = {
    username: document.getElementById("username").value,
    password: document.getElementById("password").value,
  };

  const loginRoute = `/login/${userType}`;

  fetch(loginRoute, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      if (
        data.message === "User login successful" ||
        data.message === "Company login successful"
      ) {
        window.location.href = "/";
        alert(`${userType} login successful`);
      } else {
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

async function toggleAuthLinks() {
  const loginLink = document.getElementById("loginLink");
  const registerLink = document.getElementById("registerLink");
  const logoutButton = document.getElementById("logoutButton");
  const createPostLink = document.getElementById("createPostLink");
  const CompanypanelLink = document.getElementById("CompanypanelLink");
  const UserpanelLink = document.getElementById("UserpanelLink");

  console.log("waiting for login...");
  if (await isCompany()) {
    console.log("logged in as company");
    loginLink.style.display = "none";
    registerLink.style.display = "none";
    createPostLink.style.display = "inline";
    logoutButton.style.display = "inline";
    CompanypanelLink.style.display = "inline";
    UserpanelLink.style.display = "none";
  } else if (await isUser()) {
    console.log("logged in as user");
    loginLink.style.display = "none";
    registerLink.style.display = "none";
    createPostLink.style.display = "none";
    logoutButton.style.display = "inline";
    CompanypanelLink.style.display = "none";
    UserpanelLink.style.display = "inline";
  } else {
    console.log("no one logged in");
    loginLink.style.display = "inline";
    registerLink.style.display = "inline";
    createPostLink.style.display = "none";
    logoutButton.style.display = "none";
    CompanypanelLink.style.display = "none";
    UserpanelLink.style.display = "none";
  }
}

async function isCompany() {
  try {
    const response = await fetch("/check-auth-status");
    const data = await response.json();

    return data.isCompany || false;
  } catch (error) {
    console.error("Error checking company status:", error);
  }
}

async function isUser() {
  try {
    const response = await fetch("/check-auth-status");
    const data = await response.json();

    return data.isUser || false;
  } catch (error) {
    console.error("Error checking company status:", error);
    return false;
  }
}

async function createPost() {
  try {
    const panelResponse = await fetch("/panel");
    const data = await panelResponse.json();

    const companyName = data.companyName;

    if (companyName) {
      const jobType = document.getElementById("jobType").value;
      const jobTitle = document.getElementById("jobTitle").value;
      const location = document.getElementById("location").value;
      const contact = document.getElementById("contact").value;
      const salary = document.getElementById("salary").value;

      const postRoute = "/post";

      await fetch(postRoute, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobType, jobTitle, companyName, location, contact, salary }),
      })
      .then((response) => response.json())
      .then((data) => {
      console.log(data);

      if (
        data.message === "Job post created successfully" ||
        data.message === "Job post updated successfully"
      ) {
        window.location.href = "/index.html";
        alert(`Job post created successfully`);
      } else {
      }
    })
    } else {
      console.error("Company name is undefined in the response");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function showJobDetails(job_type, title, company, location, salary) {
  if (await isUser()) {
    sessionStorage.setItem(
      "jobDetails",
      JSON.stringify({ job_type, title, company, location, salary })
    );
    window.location.href = "/apply.html";
  } else if (await isCompany()) {
    alert("Company owners cannont apply for jobs.");
  } else {
    alert("Please log in to submit the application.");
    window.location.href = "/login.html";
    return;
  }
}

window.onclick = function (event) {
  const modal = document.getElementById("jobModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

async function submitApplication() {
    const panelResponse = await fetch("/user-panel");
    const data = await panelResponse.json();

    const userName = data.username;
  const formData = {
    fullName: userName,
    email: document.getElementById("email").value,
    companyName: document.getElementById("companyName").textContent,
    jobTitle: document.getElementById("jobTitle").textContent,
    experience: document.getElementById("experience").value,
    phone_number: document.getElementById("pnumber").value,
    job_type: document.getElementById("jobType").textContent
  };
  fetch("/apply-for-job", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (
        data.message === "Application submitted successfully"
      ) {
        window.location.href = "/index.html";
        alert(`Application submitted successfully`);
      } else {
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function handleApplicationApproval(applicantName, isHired, jobTitle) {
    // Make a fetch request to your server endpoint to update the application status
    fetch('/approve-application', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicantName, isHired, jobTitle }),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (
          data.message === "Application status updated successfully"
        ) {
          alert(`Application status updated successfully`);
        } else {
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}