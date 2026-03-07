document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-team");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (form.checkValidity()) {
      const formData = new FormData(form);
      const data = {};

      formData.forEach((value, key) => {
        data[key] = value;
      });

      /* Try catch error */
      try {
        await fetch(
          "https://docs.google.com/forms/u/0/d/e/1FAIpQLSf6MdPJsHIGLcL-GVDkmQ7V_H9u0yjBVI7TfwFhAo7fbecNSA/formResponse",
          {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(data).toString(),
          }
        );

        //alert("Form submitted successfully");
        alert(
          `${tname.value} have been succesfully registered! We will contact the person in charge shortly.`
        );
        form.reset(); // Reset the form after successful submission
      } catch (error) {
        console.error("Form submission failed", error);
        // Handle the error here
        console.log(error);
      }
    } else {
      // The form is not valid, show an error message or take appropriate action
      alert("Please fill out all required fields.");
    }
  });
});
