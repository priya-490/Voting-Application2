// name , start date, enddate, is active, candidates list -> their name, id, party

document.addEventListener("DOMContentLoaded", () => {
    const roleSelection = document.getElementById("role-selection");
    const loginPage = document.getElementById("login-page");
    const signupPage = document.getElementById("signup-page");
    const userDashboard = document.getElementById("user-dashboard");
    const adminDashboard = document.getElementById("admin-dashboard");
    const electionCards = document.getElementById("election-cards");
    const adminElectionCards = document.getElementById("election-cards-admin");


    // fetching existing elections
    const fetchElections = async () => {
        try {

            const response = await fetch('/api/elections');
            if (!response.ok) throw new Error(" failed to fetch elections");
            const elections = await response.json();
            return elections;

        } catch (error) {
            console.error("error in fetching elections : ", error);
            return [];

        }
    }


    // creating a new election
    const createElection = async (electionData) => {
        try {
            const response = await fetch("/admin/elections", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(electionData),
            });
            if (!response.ok) throw new Error("failed to create election");
            return await response.json();
        } catch (error) {
            console.error("error creating election: ", error);
            throw error;
        }
    };



    // adding a candidate to an election
    const addCandidate = async (electionId, candidateData) => {
        // const token = localStorage.getItem("authToken"); // Get token

        try {

            console.log("candidate data received of the type ", typeof (candidateData)); // so candidate data is in the form of object acc to console

            const response = await fetch(`/admin/elections/${electionId}/candidates`, {
                // const response = await fetch("/admin/elections/67595c0bd050db0f49efd4f6/candidates", {

                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    //  Authorization: `Bearer ${token}`, // Include token

                },
                body: JSON.stringify(candidateData),
            });
            if (!response.ok) throw new Error("Failed to add candidate");
            return await response.json();
        } catch (error) {
            console.error("error adding candidate: ", error);
            throw error;
        }
    };



    //dynamically display and load content
    // document.addEventListener("DOMContentLoaded", async () => {
    //     // fetch elections and render them
    //     const elections = await fetchElections();
    //     renderElections(electionCards, "user", elections);
    //     renderElections(adminElectionCards, "admin", elections);
    // });


    // rendering an election
    async function renderElections(container, role) {
        try {
            // Fetch elections from the backend
            const response = await fetch('/api/elections');
            const elections = await response.json();

            // Render the elections with role-based buttons
            container.innerHTML = elections
                .map(
                    (election) => `
                        <div class="card" id="election-card-${election._id}">
                            <h3>${election.name}</h3>
                            <p>Start Date: ${new Date(election.startDate).toDateString()}</p>
                            <p>End Date: ${new Date(election.endDate).toDateString()}</p>
                            <p>Is Active: ${election.isActive ? "Yes" : "No"}</p>
                            <p>ElectionId: "${election._id}"</p>
                            <p>Candidates: ${election.candidates.map(c => `${c.name} (${c.party})`).join(", ")}</p>
                            <button id="btn-${role}-${election._id}">
                                ${role === "user" ? "Cast Vote" : "Manage Election"}
                            </button>
                        </div>
                    `
                )
                .join("");

            // Add event listeners for role-specific buttons
            elections.forEach((election) => {
                const button = document.getElementById(`btn-${role}-${election._id}`);
                if (role === "user") {
                    button.addEventListener("click", () => castVote(election._id));
                } else if (role === "admin") {
                    button.addEventListener("click", () => manageElection(election._id));
                }
            });
        } catch (error) {
            console.error("Error fetching elections:", error);
        }
    }

    // render elections for voting 
    async function renderElectionsForVoting(container) {
        try {
            const response = await fetch('/api/elections');
            const elections = await response.json();
            const userVotes = await fetch('/api/user/votes');// Fetch elections user has voted in
            const votedElections = await userVotes.json();

            container.innerHTML = elections.map((election) => {
                const isActive = election.isActive;
                const hasVoted = votedElections.includes(election._id);

                return `
                <div class="card" id="election-${election._id}">
                    <h3>${election.name}</h3>
                    <p>Start Date: ${new Date(election.startDate).toDateString()}</p>
                    <p>End Date: ${new Date(election.endDate).toDateString()}</p>
                    <p>Is Active: ${isActive ? "Yes" : "No"}</p>
                    <button 
                        id="vote-btn-${election._id}" 
                        class="cast-vote-btn" 
                        ${!isActive || hasVoted ? "disabled" : ""}
                        onclick="openVotePage('${election._id}')">
                        ${hasVoted ? "Vote Casted" : "Cast Vote"}
                    </button>
                </div>
                `
            }).join("");
        } catch (error) {
            console.error("error fetching elections for user: ", error);
        }
    }

    // async function castVote(electionId) {
    //     console.log("button is clicked for election id ", electionId);
    // }
    // async function manageElection(electionId) {
    //     console.log("button is clicked for election Id, ", electionId);
    // }



    // adding a candidate to an election
    document.getElementById("add-candidate-form").addEventListener("submit", async (event) => {
        event.preventDefault();


        const name = document.getElementById("candidate-name").value;
        const party = document.getElementById("candidate-party").value;
        const electionId = document.getElementById("electionId").value;

        const candidateData = { name, party };  // this is an object
        const newCandidate = await addCandidate(electionId, candidateData);

        if (newCandidate) {
            alert("candidate added successfully");

            // optionally, refresh the list of elections
            const elections = await fetchElections();
            renderElections(document.getElementById("election-cards-admin"), "admin", elections);
            console.log("candidate added successfully");

        }
        else {
            alert("there had been a problem in adding candidate, please try again later");
            console.error("error in adding candidate: "/*, error.message */);
        }
    });


    // creating new election
    document.getElementById("create-election-form").addEventListener("submit", async (event) => {

        event.preventDefault();
        console.log("button is clicked");

        const name = document.getElementById("election-name").value;
        const startDate = document.getElementById("election-start-date").value;
        const endDate = document.getElementById("election-end-date").value;
        console.log(typeof (startDate));
        const electionData = { name, startDate, endDate };

        const newElection = await createElection(electionData);

        if (newElection) {
            alert("election created successfully!");
            // optionally, refresh the list of elections
            const elections = await fetchElections('/admin/elections');
            renderElections(document.getElementById("election-cards-admin"), "admin", elections);
        }
        else {
            alert("there had been a problem in creating election, please try again later");
            console.log("error in creating election");
        }
    });

    // Role Selection
    document.getElementById("user-btn").addEventListener("click", () => {
        roleSelection.classList.add("hidden");
        loginPage.classList.remove("hidden");
        document.getElementById("signup-link").classList.remove("hidden");
        document.getElementById("login-title").innerText = "USER Login";
    });
    document.getElementById("admin-btn").addEventListener("click", () => {
        roleSelection.classList.add("hidden");
        loginPage.classList.remove("hidden");
        document.getElementById("signup-link").classList.add("hidden");
        document.getElementById
            ("login-title").innerText = "ADMIN Login";
    });


    // Login Form
    document.getElementById("login-submit").addEventListener("click", async (e) => {

        e.preventDefault();

        // determine role is user/admin based on UI state
        const role = document.getElementById("signup-link").classList.contains("hidden") ? "admin" : "user";

        // get username and password inputs
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            // send login request based on the role
            const loginRoute = role === "user" ? "/user/login" : "/admin/login";
            const response = await fetch(loginRoute, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });
            // const result = await response.json();

            // handle login success or failure
            if (!response.ok) {

                //handle incorrect credentials or other errors
                const result = await response.json();
                document.getElementById("form-message2").innerText = result.message || "incorrect username or password";
                return;


            } else {
                const result = await response.json();
                console.log(`${role} login successful`);

                document.getElementById("form-message2").innerText = `WELCOME, ${role}!`;

                // redirect or show respective dashboards
                loginPage.classList.add("hidden");
                if (role === "user") {
                    userDashboard.classList.remove("hidden");
                    renderElections(electionCards, "user");
                    // document.getElementById("demo").classList.remove("hidden");
                }
                else {
                    adminDashboard.classList.remove("hidden");
                    renderElections(adminElectionCards, "admin");
                }
                // document.getElementById("demo").classList.remove("hidden");

            }
        } catch (err) {
            console.error("error: ", err);
            document.getElementById("form-message2").innerText = "an error occurred, please try again";
        }

    });


    // Logout Buttons
    document.querySelectorAll(".logout-btn").forEach((button) => {
        button.addEventListener("click", () => {
            userDashboard.classList.add("hidden");
            adminDashboard.classList.add("hidden");
            roleSelection.classList.remove("hidden");
        });
    });

    // Signup Link
    document.getElementById("show-signup").addEventListener("click", () => {
        loginPage.classList.add("hidden");
        signupPage.classList.remove("hidden");
    });

    document.getElementById("signup-submit").addEventListener("click", () => {
        // e.preventDefault(); // Prevent default form submission behavior
        submitUserDetails();
    });

    //for sign up a new user
    async function submitUserDetails() {
        const name = document.getElementById('name').value;
        const age = document.getElementById('age').value;
        const state = document.getElementById('state').value;
        const username = document.getElementById('signup-username').value;
        const password = document.getElementById('signup-password').value;
        const email = document.getElementById('email').value;

        try {
            const response = await fetch('/user/check', { // replace routes accordingly
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (result.exists) {
                //if the user already exists then show the error message 
                console.log('user exists');
                document.getElementById('form-message').innerText = "Your account already exists, Please login to your account";
            }
            else {
                await fetch('/user/signup', {   // replace routes accordingly
                    //add user to the database
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, age, state, username, password, email }),

                });
                // window.location.href ='.html';// replce with ur acutal voting page

                console.log("signed in successfully");

                document.getElementById('form-message').innerText = "sign up successful, please login now.";

                signupPage.classList.add("hidden");
                loginPage.classList.remove("hidden");
                // console.log("signed in successfully");

                // document.getElementById('form-message').innerText = "sign up successful, please login now.";
            }
        }
        catch (error) {
            console.error('Error: ', error);
            document.getElementById('form-message').innerText = "an error occurred, please try again";
        }

    }








    async function openVotePage(electionId) {
        try {
            const response = await fetch(`/api/elections/${electionId}`);
            const election = await response.json();
            document.getElementById("vote-page").innerHTML = `
            <h2>${election.name}</h2>
             <p>Start Date: ${new Date(election.startDate).toDateString()}</p>
            <p>End Date: ${new Date(election.endDate).toDateString()}</p>
            <h3>Candidates:</h3>
             <ul>
                ${election.candidates.map(c => `<li>${c.name} - ${c.party}</li>`).join("")}
            </ul>
            <button id = "cast-vote-btn" onclick= "submitVote('${electionId}')"> Cast your vote </button>
            `;
        } catch (error) {
            console.error("error loading election details: ", error);
        }
    }


    
    async function submitVote(electionId) {
        try {
            const response = await fetch(`/api/vote/${electionId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            if (!response.ok) {
                throw new Error("casting vote failed");

                alert("your vote has been casted successfully");
                window.location.href = "/";// redirect to main page
            }

        } catch (error) {
            console.error("error submitting vote : ", error);
            alert("you can not vote again for this election");
        }
    }

});