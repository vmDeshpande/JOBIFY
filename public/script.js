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
      const { job_type, title, company, location, salary } =
        JSON.parse(storedJobDetails);

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
    if (!Array.isArray(posts) || posts.length === 0) {
      return '<p class="lead">No company posts available.</p>';
    }

    return posts
      .map(
        (post) => `
            <div class="card mb-3">
                <div class="card-body">
                    <h3 class="card-title">Job Title: ${post.title}</h3>
                    <p class="card-text">Location: ${post.location}</p>
                    <p class="card-text">Salary: ${post.salary}</p>
                    <p class="card-text">Contact: ${post.contact}</p>
                    <p class="card-text">Job Type: ${post.job_type}</p>
                </div>
            </div>
        `
      )
      .join("");
  }

  function renderApplications(applications) {
    if (!Array.isArray(applications) || applications.length === 0) {
      return '<p class="lead">No applications available.</p>';
    }
    console.log(applications)
    return applications
      .map(
        (application, index) => `
        <div class="card mb-3">
            <div class="card-body">
                <h3 class="card-title" id="applicantName">${application.fullName}</h3>
                <p class="card-text" id="jobTitle">Job Title: ${application.jobTitle}</p>
                <p class="card-text">Email: ${application.email}</p>
                <p class="card-text">Experience: ${application.experience}</p>
                <p class="card-text">Phone Number: ${application.contact}</p>
                <p class="card-text">Expected Salary: ${application.expectedSalary}</p>
                <button class="btn btn-success me-2 companyDownloadButton" data-index="${index}">
                    <i class="bi bi-download"></i> Download Resume
                </button><br><br>
                <button id="selectButton" class="btn btn-success me-2" onclick="handleApplicationApproval('${application.fullName}', 'select', '${application.jobTitle}')">
                    <i class="bi bi-check"></i> Select
                </button>
                <button id="hireButton" class="btn btn-success me-2 hidden" onclick="handleApplicationApproval('${application.fullName}', 'hire', '${application.jobTitle}')">
                    <i class="bi bi-check"></i> Hire
                </button>
                <button class="btn btn-danger" onclick="handleApplicationApproval('${application.fullName}', 'reject', '${application.jobTitle}')">
                    <i class="bi bi-x"></i> Reject
                </button>
            </div>
        </div>
    `
      )
      .join("");
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

    const applicationList = applications
      .map(
        (application, index) => `
      <div class="card mb-3">
          <div class="card-body">
              <h5 class="card-title">Job Title: ${application.jobTitle}</h5>
              <p class="card-text">Company Name: ${application.companyName}</p>
              <p class="card-text">Expected Salary: ${
                application.expectedSalary
              }</p>
              <p class="card-text">Status: ${getStatusLabel(
                application.approved
              )}</p>
              <button class="btn btn-success me-2 userDownloadButton" data-index="${index}">
                    <i class="bi bi-download"></i> Download Resume
                </button><br>
              ${
                application.approved === "true"
                  ? `<p class="card-text">Contact: ${application.contact}</p>`
                  : ""
              }
              ${
                application.approved === "true"
                  ? `<p class="card-text">Contact this number for further assistance.</p>`
                  : ""
              }
              <p class="card-text">Date: ${new Date(
                application.date
              ).toLocaleString()}</p>
          </div>
      </div>
  `
      )
      .join("");

    return applicationList;
  }

  document.addEventListener("click", async (event) => {
    if (event.target.classList.contains("userDownloadButton")) {
      const index = event.target.getAttribute("data-index");
      

      try {
        const response1 = await fetch("/user-panel");
        const data = await response1.json();
        const userName = data.applications[index].fullName;
        const application = data.applications[index];
        const resumeId = application.resume;

        const response = await fetch(`/resume?resumeId=${resumeId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        const base64Data = responseData.fileData;
        const blobFileName = responseData.fileName;

        const blob = base64toBlob(base64Data);

        const blobUrl = URL.createObjectURL(blob);

        const downloadLink = document.createElement("a");
        downloadLink.href = blobUrl;
        downloadLink.download = blobFileName || `resume_${index + 1}.pdf`;

        document.body.appendChild(downloadLink);
        downloadLink.click();

        document.body.removeChild(downloadLink);
      } catch (error) {
        console.error("Error fetching or downloading resume:", error);
      }
    }
  });
  document.addEventListener("click", async (event) => {
    if (event.target.classList.contains("companyDownloadButton")) {
      const index = event.target.getAttribute("data-index");
      

      try {
        const response1 = await fetch("/panel");
        const data = await response1.json();
        const userName = data.applications[index].fullName;
        const application = data.applications[index];
        const resumeId = application.resume;

        const response = await fetch(`/resume?resumeId=${resumeId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        const base64Data = responseData.fileData;
        const blobFileName = responseData.fileName;

        const blob = base64toBlob(base64Data);

        const blobUrl = URL.createObjectURL(blob);

        const downloadLink = document.createElement("a");
        downloadLink.href = blobUrl;
        downloadLink.download = blobFileName || `resume_${index + 1}.pdf`;

        document.body.appendChild(downloadLink);
        downloadLink.click();

        document.body.removeChild(downloadLink);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Downloaded resume successfully!',
      });
    } catch (error) {
      console.error("Error fetching or downloading resume:", error);
      Swal.fire({
        icon: 'error',
        title: 'Failed!',
        text: 'Error fetching or downloading resume!',
    });
      }
    }
  });

  function getStatusLabel(approved) {
    if (approved === "selected") {
      return '<span class="badge bg-success">Called for Interview</span>';
    } else if (approved === "reject") {
      return '<span class="badge bg-danger">Rejected</span>';
    } else if(approved === "hire") {
      return '<span class="badge bg-success">Hired</span>'
    } else {
      return '<span class="badge bg-warning text-dark">Pending</span>';
    }
  }
 
  const userPanelContent = document.getElementById("userpanelContent");

  if (userPanelContent) {
    fetch("/user-panel")
      .then((response) => response.json())
      .then((data) => {
        if (data.userData && Array.isArray(data.userData.applications)) {
          userPanelContent.innerHTML = `
                  <div class="container">
                      <div class="row">
                          <div class="col-md-6">
                              <h2 class="mb-4">User Data</h2>
                              <p>Username: ${data.userData.username}</p>
                              <p>Email: ${data.userData.email}</p>
                              <!-- Add other user-related data here -->
                          </div>
                          <div class="col-md-6">
                              <h2 class="mb-4">Applications</h2>
                              ${renderUserApplications(
                                data.userData.applications
                              )}
                          </div>
                      </div>
                  </div>
              `;
        } else {
          userPanelContent.innerHTML =
            "<p class='lead'>No user data found.</p>";
        }
      })
      .catch((error) =>
        console.error("Error fetching user panel data:", error)
      );
  }

  toggleAuthLinks();
});

function base64toBlob(base64Data) {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: "application/octet-stream" });
}

function register() {
  const userType = document.getElementById("userType").value;
  let registrationData;
  if (userType === "company") {
    registrationData = {
      username: document.getElementById("companyUsername").value,
      companyName: document.getElementById("companyName").value.toLowerCase(),
      contact: document.getElementById("companypnumber").value,
      email: document.getElementById("companyEmail").value,
      website: document.getElementById("companyWebsite").value,
      password: document.getElementById("companyPassword").value,
    };
  } else {
    registrationData = {
      username: document.getElementById("userUsername").value,
      contact: document.getElementById("userpnumber").value,
      email: document.getElementById("userEmail").value,
      dob: document.getElementById("dob").value,
      country: document.getElementById("country").value,
      state: document.getElementById("state").value,
      city: document.getElementById("city").value,
      last_qualification: document.getElementById("lastQualification").value,
      idProof: document.getElementById("idProof").value,
      aadhar_number: document.getElementById("aadharNumber").value,
      password: document.getElementById("userPassword").value,
    };
  }

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
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `${userType} registration successful`,
          confirmButtonText: 'OK',
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/login.html";
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: `${data.message}`,
        })
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: `${error.message}`,
    });
    });
}

function login() {
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
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `${userType} login successful`,
          confirmButtonText: 'OK',
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = '/';
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: `${data.message}`
        })
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: `${error.messsage}`,
    });
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
      const salary = document.getElementById("salary").value;

      const postRoute = "/post";

      await fetch(postRoute, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobType,
          jobTitle,
          companyName,
          location,
          salary,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);

          if (
            data.message === "Job post created successfully" ||
            data.message === "Job post updated successfully"
          ) {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Job post created successfully!',
              confirmButtonText: 'OK',
            }).then((result) => {
              if (result.isConfirmed) {
                window.location.href = "/index.html";
              }
            });           
          }
        });
    } else {
      console.error("Company name is undefined in the response");
      Swal.fire({
        icon: 'error',
        title: 'Failed!',
        text: 'Company name is undefined in the response!',
    });
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
    Swal.fire({
      icon: 'info',
      title: 'Info!',
      text: `Company owners cannont apply for jobs`,
  });
  } else {
    Swal.fire({
      icon: 'warning',
      title: 'Warning!',
      text: `Please log in to submit the application.`,
      confirmButtonText: 'OK',
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = '/login.html';
    }
  });
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
  const email = data.email;
  const contact = data.contact;

  const formData = new FormData();
  formData.append("fullName", userName);
  formData.append("email", email);
  formData.append("companyName", document.getElementById("companyName").textContent);
  formData.append("jobTitle", document.getElementById("jobTitle").textContent);
  formData.append("experience", document.getElementById("experience").value);
  formData.append("expectedSalary", document.getElementById("expectedSalary").value);
  formData.append("job_type", document.getElementById("jobType").textContent);
  formData.append("contact", contact);

  const resumeInput = document.getElementById("resume");
  formData.append("resume", resumeInput.files[0]);

  fetch("/apply-for-job", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.message === "Application submitted successfully") {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `Application submitted successfully.`,
          confirmButtonText: 'OK',
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/index.html";
          }
        });        
      } else {
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: `${error.message}.`,
    });
    });
}

function handleApplicationApproval(applicantName, status, jobTitle) {
  const statusMap = {
    select: 'select',
    reject: 'reject',
    hire: 'hire',
  };

  fetch("/approve-application", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ applicantName, status, jobTitle }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.message === "Application status updated successfully") {
        const statusText = statusMap[status] || 'Updated';
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `Application status ${statusText} successfully.`,
        });
        if(status === 'select'){
          const hireButton = document.getElementById('hireButton');
      const selectButton = document.getElementById('selectButton');
      hireButton.classList.remove('hidden');
      selectButton.classList.add('hidden');
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: `Application status ${statusText} Failed.`,
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
