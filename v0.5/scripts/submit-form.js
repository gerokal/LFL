document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-solo");

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
          "https://docs.google.com/forms/d/e/1FAIpQLSfxqJkeDSY7fvBuJUS07aeFljI2PpXcZ424Sfwqm6BpJJUabQ/formResponse",
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
          `Thank you for registering ${fname.value}! We will contact you shortly.`
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
