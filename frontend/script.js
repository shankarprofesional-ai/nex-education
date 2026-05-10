document.getElementById("registerForm").addEventListener("submit", async function(e){
    e.preventDefault();

    try {
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const response = await fetch("http://localhost:5000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const data = await response.json();

        console.log(data); // check browser console

        // show success message
        document.getElementById("message").innerHTML =
            "<h3 style='color:green;'>Student Registered Successfully ✅</h3>";

        // clear form
        document.getElementById("registerForm").reset();

    } catch (error) {
        console.log(error);

        document.getElementById("message").innerHTML =
            "<h3 style='color:red;'>Registration Failed ❌</h3>";
    }
});
document.getElementById("loginForm").addEventListener("submit", async function(e){
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    });

    const data = await response.json();

    if(response.ok){
    document.getElementById("loginMessage").innerHTML =
    "<h3 style='color:green;'>Login Successful ✅ Redirecting...</h3>";

    document.getElementById("loginForm").reset();

    setTimeout(() => {
        window.location.href = "dashboard.html";
    }, 2000);
}
    else{
        document.getElementById("loginMessage").innerHTML =
        `<h3 style='color:red;'>${data.message} ❌</h3>`;
    }
});
async function loadCourses() {
    const response = await fetch("http://localhost:5000/courses");
    const courses = await response.json();

    let output = "";

    courses.forEach(course => {
    output += `
        <div class="card">
            <h3>${course.title}</h3>
            <p>${course.description}</p>
            <p>₹${course.price}</p>
            <button class="btn" onclick="buyCourse()">Buy Now</button>
        </div>
    `;
});
    document.getElementById("courseList").innerHTML = output;
}

loadCourses();
async function loadCourses() {
    try {
        const response = await fetch("http://localhost:5000/courses");
        const courses = await response.json();

        let output = "";

        courses.forEach(course => {
            output += `
                <div class="card">
                    <h3>${course.title}</h3>
                    <p>${course.description}</p>
                    <p>₹${course.price}</p>
                    <button class="btn" onclick="buyCourse()">Buy Now</button>
                </div>
            `;
        });

        document.getElementById("courseList").innerHTML = output;

    } catch (error) {
        console.log(error);
    }
}
async function loadCourses() {
    try {
        const response = await fetch("http://localhost:5000/courses");
        const courses = await response.json();
console.log(courses);
        let output = "";

        courses.forEach(course => {
    output += `
        <div class="card">
            <h3>${course.title}</h3>
            <p>${course.description}</p>
            <p>₹${course.price}</p>

            <button class="btn" onclick="buyCourse()">
                Buy Now
            </button>
        </div>
    `;
});

        document.getElementById("courseList").innerHTML = output;

    } catch (error) {
        console.log(error);
    }
}
async function buyCourse() {
    console.log("Buy button clicked");

    try {
        const response = await fetch("http://localhost:5000/create-order", {
            method: "POST"
        });

        const order = await response.json();

        console.log(order);

        const options = {
            key: "rzp_test_SnPvfwVU6uByz3",
            amount: order.amount,
            currency: order.currency,
            name: "NexEducation",
            description: "Course Purchase",
            order_id: order.id,
        redirect: false,
        modal: {
    ondismiss: function () {
        console.log("Payment popup closed");
    }
},
           handler: async function(response) {
    alert("Payment Successful ✅");

    console.log(response);

    await fetch("http://localhost:5000/save-purchase", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            studentEmail: "student@gmail.com",
            courseTitle: "NexEducation Course",
            paymentId: response.razorpay_payment_id
        })
    });

    alert("Course Unlocked Successfully 🎉");
}
        };

        console.log("Opening Razorpay");

        const rzp = new Razorpay(options);
        rzp.open();

    } catch(error) {
        console.log(error);
        alert("Payment Failed ❌");
    }
}
loadCourses();