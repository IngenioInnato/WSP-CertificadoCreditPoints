// BEGIN validación de número telefónico
let phone = document.querySelectorAll(".phone");
// let form = document.forms['creditpoints'];
let scriptURL = 'https://script.google.com/macros/s/AKfycbwo_uwKZVWqR_F1ufDclGYvxL9_B_zC0COjvWllYE0liphpUCkE/exec';

function strictValidation(input) {
  input.addEventListener('input', function() {
    if (this.value.length > 30) this.value = this.value.slice(0, 30);
    // Verifica el primer caracter
    // if(!(/^\+/.test(this.value)) && (this.value.length <= 1)) this.value = this.value.slice(0,(this.value.length - 1));
    if (this.value.length <= 1) this.value = "+";
    // Verifica el segundo caracter
    if (!(/^\+(\d*$)/.test(this.value)) && (this.value.length > 1)) this.value = this.value.slice(0, (this.value.length - 1));
  });
}

function clearPhone(phone) {
  phone.forEach(el => el.value = el.value.replace(/ |[a-zA-Z]|-|(|)/g, ''));
}

function dataToSheet(form, url){
  let data = new FormData(form);
  console.log('Enviando...');
  data.append("date", new Date());
  fetch(url, { method: 'POST', body: data})
  .then(response => {
    console.log('Success!', response);
    return true;
  })
  .catch(error => {
    console.error('Error!', error.message);
    return false
  });
}
// function msgValidation(el) { // NO SE USÓ
//   let validMsg = document.querySelector(".valid-msg");
//   let errorMsg = document.querySelector(".error-msg");
//   let inputSubmit = document.querySelector("#inputSubmit");
//   el.addEventListener('blur', function() {
//     reset();
//     if (input.value.trim()) {
//       if (iti.isValidNumber()) {
//         validMsg.classList.remove("d-none");
//         inputSubmit.disabled = false;
//       } else {
//         input.classList.add("error");
//         let errorCode = iti.getValidationError();
//         errorMsg.innerHTML = errorMap[errorCode];
//         errorMsg.classList.remove("d-none");
//         inputSubmit.disabled = true;
//       }
//     }
//   });
// }
phone.forEach(el=> {
  let iti = window.intlTelInput(el, {
    preferredCountries: ['pr'],
    utilsScript: './node_modules/intl-tel-input/build/js/utils.js',
    initialCountry: "auto",
    geoIpLookup: function(success, failure) {
      $.get("https://ipinfo.io/json", function() {}, "jsonp").always(function(resp) {
        console.log(resp)
        let countryCode = (resp && resp.country) ? resp.country : "pr";
        success(countryCode);
      });
    },
    customPlaceholder: function(selectedCountryPlaceholder, selectedCountryData) {
      selectedCountryPlaceholder = "+" + selectedCountryData.dialCode + "" +  selectedCountryPlaceholder.replace(/ |-|(|)/g, '');
      return selectedCountryPlaceholder;
    },    
  });
  strictValidation(el);
});
// END validación de número telefónico
// BEGIN EMAIL
function formToJson(a) {
  e = new FormData(a);
  let object = {};
  e.forEach((value, key) => {object[key] = value});
  let x = JSON.stringify(object);
  return JSON.parse(x);
}

function sendEmail(a, email) {
  let e = formToJson(a);
  Email.send({
    SecureToken: "3abd4a1e-bf22-4caf-8bea-27f68c1ab1ed",
    To: email,
    From: "leads@worldsolarprous.com",
    Subject: "Evento 18 / 09 - Nueva Participante",
    Body: `
    <h1>Datos del usuario</h1>
    <p>Nombre: ${e.name}. <br>
    Email: ${e.mail}. <br>
    Teléfono: ${e.phone}. <br>
    Estado: ${e.address}. <br>
    Ciudad: ${e.city}. <br>
    Fue añadido en <a href="https://docs.google.com/spreadsheets/d/1-mgA6Cc39HL8OW6etR0VkVj3K_KAwEwKjTo_IJ_AzEU/edit?usp=sharing">Google Sheet</a>. <br>
    </p>
    `,
  })
    .then((message) => {
      console.log("Mensaje Enviado Correctamente " + message);
      console.log(e);
    })
    .catch((message) => console.log("Error: " + message));
}
// END EMAIL

// BEGIN PDF

function createPDF(name){
  // You'll need to make your image into a Data URL
  // Use http://dataurl.net/#dataurlmaker
  fetch('./js/certificado.txt').then(data => data.text())
  .then(data => {
    let imgData;
    imgData = data
    let date = new Date();
    let day = String(date.getDate());
    let mounth = String(date.getMonth());
    let year = String(date.getFullYear());
    var doc = new jsPDF({
        orientation: 'l',
    })
    doc.addFont("Helvetica", "Helvetica", "normal")
    doc.setFontSize(30);
    doc.addImage(imgData, 'JPEG', 2, 0, 0, 210);
    doc.text(30, 139, name);
    doc.setFontSize(11);
    doc.text(107, 153, day);
    doc.text(122, 153, mounth);
    doc.text(140, 153, year);
    doc.save('certificado.pdf');
  });
}
// END PDF
// BEGIN Message
function message(form) {
  let html = `
  <div class="card text-white bg-success text-center py-5">
    <div class="card-body">
      <h2 class="card-title font-weight-bold">¡Muchas Gracias!</h2>
      <p class="card-text">Sus datos serán validados lo más pronto posible, ¡estamos en contacto!</p>
    </div>
  </div>
  `;
  form.innerHTML = html;
}

// BEGIN Bootstrap Validación
let forms = document.getElementsByClassName('needs-validation');
// Loop over them and prevent submission
let validation = Array.prototype.filter.call(forms, function(form) {
  form.addEventListener('submit', function(e) {
    let f = formToJson(form);
    if ((form.checkValidity() === false) || (f.phone === f.altphone)) {
      e.preventDefault();
      e.stopPropagation();
      clearPhone(phone);
    } else {
      e.preventDefault();
      clearPhone(phone);
      let sheet = dataToSheet(form, scriptURL);
      sendEmail(form, 'creditowsp@gmail.com');
      sendEmail(form, 'worldsolarpropr@gmail.com');
      let name = `${f.name} ${f.lastname}`;
      createPDF(name);
      message(form)
    }
    form.classList.add('was-validated');
  }, false);
});
// END Bootstrap Validación