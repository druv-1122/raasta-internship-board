
const searchInput = document.getElementById("search");
const remoteCheckbox = document.getElementById("remoteOnly");
const stipendSelect = document.getElementById("stipend");

const internshipList = document.getElementById("internshipList");
const statusMessage = document.getElementById("status");
const resultCount = document.getElementById("resultCount");

const errorBox = document.getElementById("errorBox");
const emptyState = document.getElementById("emptyState");

const retryBtn = document.getElementById("retryBtn");
const clearBtn = document.getElementById("clearBtn");

let internships = [];

async function fetchInternships() {
    statusMessage.textContent = "Loading internships...";
    statusMessage.hidden = false;

    errorBox.hidden = true;
    emptyState.hidden = true;
    internshipList.innerHTML = "";
    internshipList.setAttribute("aria-busy", "true");

    try {
        const response = await fetch("./internships.json");

        if (!response.ok) {
            throw new Error("Failed to fetch internship data");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Invalid internship data");
        }

        internships = data;

        statusMessage.hidden = true;
        applyFilters();

    } catch (error) {
        console.error(error);

        statusMessage.hidden = true;
        resultCount.textContent = "";
        errorBox.hidden = false;
    }

    internshipList.setAttribute("aria-busy", "false");
}

retryBtn.addEventListener("click", fetchInternships);

searchInput.addEventListener("input", applyFilters);
remoteCheckbox.addEventListener("change", applyFilters);
stipendSelect.addEventListener("change", applyFilters);
clearBtn.addEventListener("click", clearFilters);

function applyFilters() {
    const searchText = searchInput.value.trim().toLowerCase();
    const remoteOnly = remoteCheckbox.checked;
    const minimumStipend = Number(stipendSelect.value);

    const filteredInternships = internships.filter((item) => {

        const skills = Array.isArray(item.skills)
            ? item.skills.join(" ")
            : (item.skills || "");

        const searchableText =
            `${item.title || ""} ${skills}`.toLowerCase();

        const matchesSearch = searchableText.includes(searchText);

        const matchesRemote = !remoteOnly || item.remote === true;

        const matchesStipend =
            minimumStipend === 0 ||
            (item.stipend != null &&
             Number(item.stipend) >= minimumStipend);

        return matchesSearch && matchesRemote && matchesStipend;
    });

    renderInternships(filteredInternships);
}

function clearFilters() {
    searchInput.value = "";
    remoteCheckbox.checked = false;
    stipendSelect.value = "0";

    applyFilters();
}

function renderInternships(list) {
    internshipList.innerHTML = "";

    resultCount.textContent =
        `${list.length} internship(s) found`;

    emptyState.hidden = list.length !== 0;

    list.forEach((item) => {

        const card = document.createElement("article");
        card.className = "internship-card";

        const title = document.createElement("h2");
        title.textContent = item.title || "Untitled Internship";

        const company = document.createElement("p");
        company.textContent = `Company: ${item.company || "Not mentioned"}`;

        const city = document.createElement("p");
        city.textContent = `Location: ${item.city || "Not mentioned"}`;

        const stipend = document.createElement("p");
        stipend.textContent = item.stipend == null
            ? "Stipend not stated"
            : `Stipend: ₹${Number(item.stipend).toLocaleString("en-IN")} a month`;

        card.appendChild(title);
        card.appendChild(company);
        card.appendChild(city);
        card.appendChild(stipend);

        if (item.remote === true) {
            const remoteTag = document.createElement("span");
            remoteTag.className = "remote-tag";
            remoteTag.textContent = "Remote";
            card.appendChild(remoteTag);
        }

        internshipList.appendChild(card);
    });
}

fetchInternships();
