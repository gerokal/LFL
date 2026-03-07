// form validation

const regForm = document.querySelector('#form-contact');
const errors_el = document.querySelector('#form-contact .errors');

regForm.addEventListener('submit', validateRegisterForm);

function validateRegisterForm (e) {
  //e.preventDefault();

  // inputs
  const fname = document.querySelector('#form-contact #fname');
  const email = document.querySelector('#form-contact #email');
  const phone = document.querySelector('#form-contact #phone');
  const comments = document.querySelector('#form-contact #comments');
  

  let errors = [];

  // regular expressions for email:
  const email_reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  // regular expressions for password:
  //const pass_reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

  if (fname.value == "") {
    errors.push({text: "Name", el: fname});
  }

  if (email.value == "") {
    errors.push({text: "Email", el: email});
  } else if (!email_reg.test(email.value)) {
    errors.push({text: "Email", el: email});
  }

  if (phone.value == "") {
    errors.push({text: "Phone", el: phone});
  }

  if (comments.value == "") {
    errors.push({text: "Comments", el: comments});
  }

  if (errors.length > 0) {
    handle_errors(errors);
    return false;
  }

  alert('Your message has been submitted. Thank you for contacting us.');
  //document.getElementById("form-solo").reset();
  //document.write("that's it");
  return true;
}

function handle_errors(errs) {
  let str = "You have errors: Pleaase review the following fields: ";

  errs.map((er) => {
    er.el.classList.add('error');
    str += er.text + ", ";
  });

  errs[0].el.focus();

  let error_el = document.createElement('div');
  error_el.classList.add('error');
  error_el.innerText = str;

  error_el.addEventListener('click', function () {
    errors_el.removeChild(error_el);
  });

  errors_el.appendChild(error_el);
}