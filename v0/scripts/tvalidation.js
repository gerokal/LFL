// form validation

const regForm = document.querySelector('#form-team');
const errors_el = document.querySelector('#form-team .errors');


regForm.addEventListener('submit', validateRegisterForm);


function validateRegisterForm (e) {
  //e.preventDefault();

 
  // team inputs
  const tname = document.querySelector('#form-team #tname');
  const aff = document.querySelector('#form-team #aff');
  const kit = document.querySelector('#form-team #kit');
  const soc = document.querySelector('#form-team #soc');
  const tcb = document.querySelector('#form-team #tcb');
  const pic_name = document.querySelector('#form-team #pic_name');
  const pic_email = document.querySelector('#form-team #pic_email');
  const pic_phone = document.querySelector('#form-team #pic_phone');
  const pic_address = document.querySelector('#form-team #pic_address');
  const spic = document.querySelector('#form-team #spic');
  const tdescription = document.querySelector('#form-team #tdescription');

  let errors = [];

  // regular expressions for email:
  const email_reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  // regular expressions for password:
  //const pass_reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

  
  // *** VALUE CHECKS ***
  if (tname.value == "") {
    errors.push({text: "Team name", el: tname});
  }
  if (aff.value == "") {
    errors.push({text: "Affiliated", el: aff});
  }
  if (kit.value == "") {
    errors.push({text: "Team kit", el: kit});
  }
  if (soc.value == "") {
    errors.push({text: "Social media", el: soc});
  }
  if (tcb.value == "") {
    errors.push({text: "Team competed before", el: tcb});
  }
  if (pic_name.value == "") {
    errors.push({text: "Person in charge Name", el: pic_name});
  }
  if (pic_email.value == "") {
    errors.push({text: "Person in charge Email", el: pic_email});
  } else if (!email_reg.test(pic_email.value)) {
    errors.push({text: "Person in charge Email", el: pic_email});
  }
  if (pic_phone.value == "") {
    errors.push({text: "Person in charge Phone", el: pic_phone});
  }
  if (pic_address.value == "") {
    errors.push({text: "Person in charge Address", el: pic_address});
  }
  if (spic.value == "") {
    errors.push({text: "Second person in charge", el: spic});
  }
  if (tdescription.value == "") {
    errors.push({text: "Brief description of your team", el: tdescription});
  }

  // *** ERROR CHECKS ***
  if (errors.length > 0) {
    handle_errors(errors);
    return false;
  }

  alert('Thank you for registering. We will contact you shortly.');
  //document.getElementById("form-team").reset();
  //document.write("Thank you for registering. we will contact you shortly <a href="/">Go Home</a>");
  return true;
}

function handle_errors(errs) {
  let str = "You have errors: Please review the following fields: ";

  errs.map((er) => {
    er.el.classList.add('error');
    str += er.text + ", ";
  });

  errs[0].el.focus();

  // error element
  let error_el = document.createElement('div');

  
  error_el.classList.add('error');
  error_el.innerText = str;

  error_el.addEventListener('click', function () {
    errors_el.removeChild(error_el);
  });

  errors_el.appendChild(error_el);
}