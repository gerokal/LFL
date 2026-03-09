document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-contact");

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
          "https://docs.google.com/forms/u/0/d/e/1FAIpQLSe1lwHp8zXZv2KulK9xf5N1teOZ08iFaFXMd_cO-UzPfNBTkQ/formResponse",
          {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(data).toString(),
          }
        );

        document.getElementById("confirmation").style.display = "block";
        form.reset();
      } catch (error) {
        console.error("Form submission failed", error);
      }
    } else {
      alert("Please fill out all required fields.");
    }
  });
});
